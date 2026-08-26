import { test, expect } from "@playwright/test";

test.describe("Shop flow", () => {
  test("visits the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/MIYUKI/i);
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
    const addButton = page.getByRole("button", { name: /agregar al carrito/i }).first();
    await expect(addButton).toBeVisible();
  });

  test("adds product to cart from catalog", async ({ page }) => {
    await page.goto("/Miyuki/productos");
    const addButton = page.getByRole("button", { name: /agregar al carrito/i }).first();
    await expect(addButton).toBeVisible();
    await addButton.click();
    const badge = page.locator("span.rounded-full.bg-miyuki-600");
    await expect(badge).toHaveText("1");
  });

  test("navigates to product detail page", async ({ page }) => {
    await page.goto("/Miyuki/productos");
    const productLink = page.getByRole("link", { name: "Collar Elegante", exact: true });
    await productLink.click();
    await expect(page).toHaveURL(/.*Miyuki\/productos\/collar-elegante/);
    await expect(page.getByRole("heading", { name: /collar elegante/i })).toBeVisible();
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
