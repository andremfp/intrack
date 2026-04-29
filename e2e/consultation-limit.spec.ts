/**
 * E2E test for the per-user consultation count cap (Fix 22).
 *
 * Uses the Supabase service-role client to seed rows directly (bypassing RLS
 * and the app's rate-limit layer) up to the DB-level limit, then verifies
 * that attempting one more insert via the UI surfaces the correct error toast.
 *
 * Requires a running local Supabase instance (`supabase start`) with the
 * migration applied. Credentials are read from .env.local.
 */

import fs from "fs";
import path from "path";
import { test, expect, type TestInfo } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Env helpers
// ---------------------------------------------------------------------------

function parseEnvFile(filePath: string): Record<string, string> {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const result: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const match = line.match(/^([^#=\s][^=]*)=(.*)$/);
      if (match) result[match[1].trim()] = match[2].trim();
    }
    return result;
  } catch {
    return {};
  }
}

const env = parseEnvFile(
  path.resolve(new URL(".", import.meta.url).pathname, "../.env.local")
);

const SUPABASE_URL =
  process.env.VITE_LOCAL_SUPABASE_URL ||
  env.VITE_LOCAL_SUPABASE_URL ||
  "http://127.0.0.1:54321";

const SUPABASE_SECRET =
  process.env.VITE_LOCAL_SUPABASE_SECRET || env.VITE_LOCAL_SUPABASE_SECRET;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONSULTATION_LIMIT = 5000;
// Use a high base process number to avoid collisions with fixture data.
const SEED_PROCESS_NUMBER_BASE = 900_000;
const TEST_USER_EMAIL = "test@example.com";
const TEST_USER_PASSWORD = "password123";

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe("consultation limit", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let adminClient: ReturnType<typeof createClient<any>>;
  let testUserId: string;
  let specialtyId: string;

  test.beforeAll(async () => {
    if (!SUPABASE_SECRET) {
      throw new Error(
        "VITE_LOCAL_SUPABASE_SECRET is not set. " +
          "Ensure .env.local exists with the service-role key."
      );
    }

    adminClient = createClient(SUPABASE_URL, SUPABASE_SECRET, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Resolve the test user's auth UUID via the public users table.
    const { data: user, error: userError } = await adminClient
      .from("users")
      .select("user_id")
      .eq("email", TEST_USER_EMAIL)
      .single();

    if (userError || !user)
      throw new Error(`Could not find test user: ${userError?.message}`);
    testUserId = user.user_id as string;

    // Resolve the MGF specialty ID.
    const { data: specialty, error: specError } = await adminClient
      .from("specialties")
      .select("id")
      .eq("code", "mgf")
      .single();

    if (specError || !specialty)
      throw new Error(`Could not find MGF specialty: ${specError?.message}`);
    specialtyId = specialty.id as string;

    // Clear all existing consultations for this user+specialty so we can seed
    // exactly CONSULTATION_LIMIT rows without needing to count first. This also
    // handles stale rows left by other tests or a previously interrupted run.
    const { error: clearError } = await adminClient
      .from("consultations")
      .delete()
      .eq("user_id", testUserId)
      .eq("specialty_id", specialtyId);

    if (clearError)
      throw new Error(`Pre-seed cleanup failed: ${clearError.message}`);

    // Seed exactly CONSULTATION_LIMIT rows in chunks to stay within
    // PostgREST's default payload limits.
    const CHUNK_SIZE = 500;
    const allRows = Array.from({ length: CONSULTATION_LIMIT }, (_, i) => ({
      user_id: testUserId,
      specialty_id: specialtyId,
      specialty_year: 1,
      date: "2020-01-01",
      sex: "m",
      age: 30,
      age_unit: "years",
      process_number: SEED_PROCESS_NUMBER_BASE + i,
      location: "unidade",
      autonomy: "total",
      details: {},
      favorite: false,
    }));

    for (let i = 0; i < allRows.length; i += CHUNK_SIZE) {
      const chunk = allRows.slice(i, i + CHUNK_SIZE);
      const { error: insertError } = await adminClient
        .from("consultations")
        .insert(chunk);

      if (insertError)
        throw new Error(`Seed insert failed: ${insertError.message}`);
    }
  });

  test.afterAll(async () => {
    if (!adminClient) return;
    // Delete ALL seeded rows by process_number range — more reliable than ID
    // tracking, which can fail silently if the array is partially populated.
    // SEED_PROCESS_NUMBER_BASE is deliberately far above real process numbers.
    await adminClient
      .from("consultations")
      .delete()
      .eq("user_id", testUserId)
      .eq("specialty_id", specialtyId)
      .gte("process_number", SEED_PROCESS_NUMBER_BASE);
  });

  test(
    "shows error toast when consultation limit is reached",
    async ({ page }: { page: import("@playwright/test").Page }, testInfo: TestInfo) => {
      // Allow extra time: beforeAll seeds up to 5000 rows before this test runs.
      testInfo.setTimeout(120_000);
      testInfo.annotations.push({
        type: "description",
        description:
          "Verifies the DB trigger fires and the UI surfaces the correct error.",
      });

      page.on("pageerror", (err: Error) =>
        console.error("[pageerror]", err.message)
      );

      // Log in.
      await page.goto("/login");
      await page.locator("#email").waitFor();
      await page.locator("#email").fill(TEST_USER_EMAIL);
      await page.locator("#password").fill(TEST_USER_PASSWORD);
      await page.getByRole("button", { name: "Login", exact: true }).click();
      await expect(page).toHaveURL("/dashboard");

      // Open the new-consultation modal.
      await page.getByTestId("nova-consulta-btn").click();

      // Fill the minimum required fields.
      // Use a process number that won't collide with seeded data.
      await page.locator("#date").fill("2024-06-01");
      await page.locator("#process_number").fill("100");
      await page.locator("#age").fill("40");

      await page.locator("#sex").click();
      await page.getByRole("option", { name: "Masculino" }).click();

      await page.locator("#age_unit").click();
      await page.getByRole("option", { name: "Anos" }).click();

      await page.locator("#location").click();
      await page.getByRole("option", { name: "Unidade de Saúde" }).click();

      // "Tipologia" is required when location is "Unidade de Saúde"
      await page.locator("#type").click();
      await page.getByRole("option", { name: "Saúde Adulto" }).click();

      await page.locator("#autonomy").click();
      await page.getByRole("option", { name: "Total" }).click();

      await page.locator("#presential").click();
      await page.getByRole("option", { name: "Sim" }).click();

      await page.locator("#own_list").click();
      await page.getByRole("option", { name: "Sim" }).click();

      // Submit — the trigger should block this and the UI should toast an error.
      await page.getByTestId("submit-consultation-btn").click();

      // The toast title is "Erro ao criar consulta" and its description
      // contains our user-facing limit message.
      await expect(
        page.getByText("Atingiu o limite de consultas para esta especialidade")
      ).toBeVisible();
    }
  );
});
