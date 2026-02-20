import { test, expect } from "@playwright/test";

test.describe("consultation", () => {
  test.beforeEach(async ({ page }) => {
    // Log in before each test
    await page.goto("/login");
    await page.locator("#email").fill("test@example.com");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("creates a consultation via the modal happy path", async ({ page }) => {
    // Use a timestamp-based process number to avoid collisions on repeated local runs
    const processNumber = String(Date.now()).slice(-6);

    // Open the consultation creation modal
    await page.getByTestId("nova-consulta-btn").click();

    // Fill required text/number fields
    await page.locator("#date").fill("2024-01-15");
    await page.locator("#process_number").fill(processNumber);
    await page.locator("#age").fill("45");

    // Select #sex → "Feminino"
    await page.locator("#sex").click();
    await page.getByRole("option", { name: "Feminino" }).click();

    // Select #age_unit → "Anos" (likely default, but set explicitly)
    await page.locator("#age_unit").click();
    await page.getByRole("option", { name: "Anos" }).click();

    // Select #location → "Unidade de Saúde"
    await page.locator("#location").click();
    await page.getByRole("option", { name: "Unidade de Saúde" }).click();

    // "Tipologia" (type) becomes required when location is "Unidade de Saúde"
    await page.locator("#type").click();
    await page.getByRole("option", { name: "Saúde Adulto" }).click();

    // Select #autonomy → "Total"
    await page.locator("#autonomy").click();
    await page.getByRole("option", { name: "Total" }).click();

    // Select #presential → true
    await page.locator("#presential").click();
    await page.getByRole("option", { name: "Sim" }).click();

    // Select #own_list → true
    await page.locator("#own_list").click();
    await page.getByRole("option", { name: "Sim" }).click();

    // Submit the form
    await page.getByTestId("submit-consultation-btn").click();

    // Expect success toast and modal to close
    await expect(page.getByText("Consulta criada com sucesso!")).toBeVisible();
  });
});
