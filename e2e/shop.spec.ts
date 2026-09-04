import { test, expect } from "@playwright/test";

test.describe("Shop flow", () => {
  test("visits the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Casa Crescencia/i);
  });

  test("navigates to catalog via nav link", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation");
    await nav.getByRole("link", { name: "Productos" }).click();
    await expect(page).toHaveURL(/.*Miyuki\/productos/);
    await expect(page.getByRole("heading", { name: /productos/i }).first()).toBeVisible();
  });

  test("shows products on catalog page", async ({ page }) => {
    await page.goto("/Miyuki/productos");
    const productHeading = page.getByRole("heading", { level: 3 }).first();
    await expect(productHeading).toBeVisible();
    const addButton = page.getByRole("button", { name: /agregar/i }).first();
    await expect(addButton).toBeVisible();
  });

  test("adds product to cart from catalog", async ({ page }) => {
    await page.goto("/Miyuki/productos");
    const addButton = page.getByRole("button", { name: /agregar/i }).first();
    await expect(addButton).toBeVisible();
    await addButton.click();
    const badge = page.locator("span.rounded-full.bg-gray-900");
    await expect(badge).toHaveText("1");
  });

  test("navigates to product detail page", async ({ page }) => {
    await page.goto("/Miyuki/productos");
    const productLink = page.getByRole("link", { name: "Arete 01", exact: true });
    await productLink.click();
    await expect(page).toHaveURL(/.*Miyuki\/productos\/arete-01/);
    await expect(page.getByRole("heading", { name: /arete 01/i })).toBeVisible();
  });

  test("checkout page loads with empty cart", async ({ page }) => {
    await page.goto("/Miyuki/checkout");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/Miyuki/iniciar-sesion");
    await expect(page.getByRole("heading", { name: "Iniciar Sesión" })).toBeVisible();
  });
});
