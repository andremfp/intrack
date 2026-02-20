import { test, expect } from "@playwright/test";

test.describe("export", () => {
  test.beforeEach(async ({ page }) => {
    // Log in before each test
    await page.goto("/login");
    await page.locator("#email").fill("test@example.com");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await expect(page).toHaveURL("/dashboard");

    // The export button is disabled when the consultation list is empty,
    // so we need at least one consultation before we can test the export flow.
    const processNumber = String(Date.now()).slice(-6);
    await page.getByTestId("nova-consulta-btn").click();
    await page.locator("#date").fill("2024-01-15");
    await page.locator("#process_number").fill(processNumber);
    await page.locator("#age").fill("45");
    await page.locator("#sex").click();
    await page.getByRole("option", { name: "Feminino" }).click();
    await page.locator("#age_unit").click();
    await page.getByRole("option", { name: "Anos" }).click();
    await page.locator("#location").click();
    await page.getByRole("option", { name: "Unidade de Saúde" }).click();
    await page.locator("#type").click();
    await page.getByRole("option", { name: "Saúde Adulto" }).click();
    await page.locator("#autonomy").click();
    await page.getByRole("option", { name: "Total" }).click();
    await page.locator("#presential").click();
    await page.getByRole("option", { name: "Sim" }).click();
    await page.locator("#own_list").click();
    await page.getByRole("option", { name: "Sim" }).click();
    await page.getByTestId("submit-consultation-btn").click();
    await expect(page.getByText("Consulta criada com sucesso!")).toBeVisible();
  });

  test("opens export menu and exports CSV without error", async ({ page }) => {
    // Open the export popover
    await page.getByTestId("export-menu-trigger").click();

    // CSV option should be visible in the popover
    await expect(page.getByTestId("export-csv-btn")).toBeVisible();

    // Click the CSV export button
    await page.getByTestId("export-csv-btn").click();

    // Popover should close after clicking
    await expect(page.getByTestId("export-csv-btn")).not.toBeVisible();

    // No error toast should appear
    await expect(page.getByText("Erro")).not.toBeVisible();
  });
});
