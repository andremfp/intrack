import { test, expect } from "@playwright/test";

test.describe("auth", () => {
  // Unauthenticated access to /dashboard redirects to the landing page (/)
  // because useUserInitialization detects no valid session and calls navigate("/")
  test("redirects to landing when accessing dashboard unauthenticated", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/");
  });

  test("logs in with valid credentials and navigates to dashboard", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.locator("#email").fill("test@example.com");
    await page.locator("#password").fill("password123");
    // Use exact match to avoid hitting the "Login com Google" button
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await expect(page).toHaveURL("/dashboard");
  });
});
