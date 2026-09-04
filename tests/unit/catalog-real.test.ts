import { describe, it, expect } from "vitest";
import { DEFAULT_PRODUCTS, CATALOG, DEFAULT_CATEGORIES } from "@/lib/products-data";

describe("Real catalog integrity", () => {
  it("has exactly 30 products", () => {
    expect(DEFAULT_PRODUCTS.length).toBe(30);
  });

  it("assigns aretes to products 1-17 and pulseras to 18-30", () => {
    DEFAULT_PRODUCTS.forEach((p) => {
      const num = parseInt(String(p.order_index), 10);
      if (num <= 17) {
        expect(p.category?.slug).toBe("aretes");
      } else {
        expect(p.category?.slug).toBe("pulseras");
      }
      expect(p.order_index).toBe(num);
    });
  });

  it("has contiguous order_index 1..30", () => {
    const idx = DEFAULT_PRODUCTS.map((p) => p.order_index).sort((a, b) => a - b);
    expect(idx).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
  });

  it("names match the real catalog", () => {
    const names = DEFAULT_PRODUCTS.map((p) => p.name);
    expect(names.slice(0, 17)).toEqual(CATALOG.aretes);
    expect(names.slice(17, 30)).toEqual(CATALOG.pulseras);
  });

  it("categories exposes only aretes and pulseras", () => {
    expect(DEFAULT_CATEGORIES.map((c) => c.slug).sort()).toEqual(["aretes", "pulseras"]);
  });

  it("strict filter: pulseras yields no aretes and vice versa", () => {
    const aretes = DEFAULT_PRODUCTS.filter((p) => p.category?.slug === "aretes");
    const pulseras = DEFAULT_PRODUCTS.filter((p) => p.category?.slug === "pulseras");
    expect(aretes.length).toBe(17);
    expect(pulseras.length).toBe(13);
    expect(aretes.every((p) => p.category?.slug === "aretes")).toBe(true);
    expect(pulseras.every((p) => p.category?.slug === "pulseras")).toBe(true);
  });

  it("Piñas costs $50.000 COP while other aretes cost $35.000", () => {
    const pinas = DEFAULT_PRODUCTS.find((p) => p.name === "Piñas");
    expect(pinas).toBeDefined();
    expect(pinas!.category?.slug).toBe("aretes");
    expect(pinas!.price).toBe(50000);
    const otherAretes = DEFAULT_PRODUCTS.filter(
      (p) => p.category?.slug === "aretes" && p.name !== "Piñas",
    );
    expect(otherAretes.every((p) => p.price === 35000)).toBe(true);
  });
});
