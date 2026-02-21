import { test, expect } from "@playwright/test";

test.describe("auth", () => {
  test.beforeEach(async ({ page }) => {
    // Surface any uncaught JS errors (e.g. failed chunk loads) in test output.
    page.on("pageerror", (err) => console.error("[pageerror]", err.message));
  });

  // Unauthenticated access to /dashboard redirects to the landing page (/)
  // because useUserInitialization detects no valid session and calls navigate("/").
  // Use waitForURL (30 s timeout) rather than expect.toHaveURL (15 s) because
  // the redirect is driven by an async chain: lazy chunk load → Supabase auth
  // check → navigate("/"). waitForURL blocks until the URL actually changes.
  test("redirects to landing when accessing dashboard unauthenticated", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL("/");
  });

  test("logs in with valid credentials and navigates to dashboard", async ({
    page,
  }) => {
    await page.goto("/login");
    // Wait for the lazy login chunk to finish rendering before interacting.
    // page.goto() returns on the load event — at that point only the Suspense
    // fallback is in the DOM. Waiting for #email is more reliable than
    // waitForLoadState("networkidle"), which can stall on Supabase auth/realtime
    // requests that never fully settle.
    await page.locator("#email").waitFor();
    await page.locator("#email").fill("test@example.com");
    await page.locator("#password").fill("password123");
    // Use exact match to avoid hitting the "Login com Google" button
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await expect(page).toHaveURL("/dashboard");
  });
});
