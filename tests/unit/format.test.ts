import { describe, it, expect } from "vitest";
import { formatCOP, formatPrice, slugify, generateIdempotencyKey } from "@/utils/format";

describe("formatCOP", () => {
  it("formats zero", () => {
    expect(formatCOP(0)).toBe("$0");
  });

  it("formats standard amounts (COP integers)", () => {
    expect(formatCOP(35000)).toBe("$35.000");
  });

  it("formats small amounts", () => {
    expect(formatCOP(1500)).toBe("$1.500");
  });

  it("formats large amounts with thousand separators", () => {
    expect(formatCOP(1500000)).toBe("$1.500.000");
  });

  it("formats very large amounts", () => {
    expect(formatCOP(99999900)).toBe("$99.999.900");
  });
});

describe("formatPrice", () => {
  it("formats with COP suffix", () => {
    expect(formatPrice(25000)).toBe("$25.000 COP");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("$0 COP");
  });

  it("formats large price", () => {
    expect(formatPrice(4999900)).toBe("$4.999.900 COP");
  });
});

describe("slugify", () => {
  it("converts lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes accents", () => {
    expect(slugify("Café Con Leche")).toBe("cafe-con-leche");
  });

  it("removes special characters", () => {
    expect(slugify("Shirt (XL)!")).toBe("shirt-xl");
  });

  it("collapses multiple dashes", () => {
    expect(slugify("a   b   c")).toBe("a-b-c");
  });

  it("trims leading and trailing dashes", () => {
    expect(slugify(" hello ")).toBe("hello");
  });
});

describe("generateIdempotencyKey", () => {
  it("returns a string", () => {
    const key = generateIdempotencyKey();
    expect(typeof key).toBe("string");
  });

  it("contains a dash separator", () => {
    const key = generateIdempotencyKey();
    expect(key).toContain("-");
  });

  it("generates unique values", () => {
    const keys = new Set<string>();
    for (let i = 0; i < 100; i++) {
      keys.add(generateIdempotencyKey());
    }
    expect(keys.size).toBe(100);
  });
});
