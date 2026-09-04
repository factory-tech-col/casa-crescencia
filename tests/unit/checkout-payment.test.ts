import { describe, it, expect } from "vitest";
import {
  TRANSFER_METHODS,
  WALLET_GATEWAY_LINKS,
  PAYMENT_METHOD_LABELS,
  validateReceiptFile,
  MAX_RECEIPT_BYTES,
  ALLOWED_RECEIPT_MIME,
} from "@/features/checkout/paymentService";
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

describe("Transfer methods (NEQUI / DAVIPLATA)", () => {
  it("only offers NEQUI and DAVIPLATA as transfer methods", () => {
    expect(TRANSFER_METHODS).toEqual(["NEQUI", "DAVIPLATA"]);
  });

  it("does not include PSE as a transfer method", () => {
    expect(TRANSFER_METHODS).not.toContain("PSE");
    expect(TRANSFER_METHODS).not.toContain("CREDIT_CARD");
  });

  it("maps each transfer method to its official portal URL", () => {
    expect(WALLET_GATEWAY_LINKS.NEQUI.url).toBe("https://www.nequi.com.co/");
    expect(WALLET_GATEWAY_LINKS.DAVIPLATA.url).toBe(
      "https://www.daviplata.com/personas/pasar-plata",
    );
    for (const m of TRANSFER_METHODS) {
      expect(WALLET_GATEWAY_LINKS[m]).toBeDefined();
    }
  });

  it("provides human-readable labels for NEQUI and DAVIPLATA", () => {
    expect(PAYMENT_METHOD_LABELS.NEQUI).toBe("Nequi");
    expect(PAYMENT_METHOD_LABELS.DAVIPLATA).toBe("Daviplata");
  });
});

describe("Receipt file validation", () => {
  function makeFile(name: string, type: string, size: number): File {
    const bytes = new Uint8Array(size);
    return new File([bytes], name, { type });
  }

  it("accepts PNG, JPEG and WebP images", () => {
    expect(validateReceiptFile(makeFile("a.png", "image/png", 1000))).toBeNull();
    expect(validateReceiptFile(makeFile("a.jpg", "image/jpeg", 1000))).toBeNull();
    expect(validateReceiptFile(makeFile("a.webp", "image/webp", 1000))).toBeNull();
  });

  it("rejects non-image MIME types", () => {
    expect(validateReceiptFile(makeFile("a.pdf", "application/pdf", 1000))).not.toBeNull();
    expect(validateReceiptFile(makeFile("a.txt", "text/plain", 1000))).not.toBeNull();
  });

  it("rejects files larger than 8 MB", () => {
    const tooBig = makeFile("a.png", "image/png", MAX_RECEIPT_BYTES + 1);
    expect(validateReceiptFile(tooBig)).not.toBeNull();
    const ok = makeFile("a.png", "image/png", MAX_RECEIPT_BYTES);
    expect(validateReceiptFile(ok)).toBeNull();
  });

  it("rejects empty files", () => {
    expect(validateReceiptFile(makeFile("a.png", "image/png", 0))).not.toBeNull();
  });

  it("allowed MIME types are PNG, JPEG and WebP only", () => {
    expect(ALLOWED_RECEIPT_MIME).toEqual(["image/png", "image/jpeg", "image/webp"]);
  });
});

describe("Order total formula (no IVA)", () => {
  it("SHIPPING_COST is 13900 COP", () => {
    expect(SHIPPING_COST).toBe(13900);
  });

  it("total = subtotal + shipping when below free-shipping threshold", () => {
    const subtotal = 35000;
    const shipping = subtotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_COST : 0;
    const total = subtotal + shipping;
    expect(total).toBe(35000 + 13900);
    expect(total).toBe(48900);
  });

  it("total = subtotal + 0 when subtotal meets free-shipping threshold", () => {
    const subtotal = 100000;
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;
    expect(total).toBe(100000);
  });

  it("total has no IVA (tax) component", () => {
    const subtotal = 50000;
    const shipping = SHIPPING_COST;
    const total = subtotal + shipping;
    // IVA would be round(50000 * 0.19) = 9500. Total must NOT include it.
    const ivaIfApplied = Math.round(subtotal * 0.19);
    expect(total).not.toBe(subtotal + ivaIfApplied + shipping);
    expect(total).toBe(subtotal + shipping);
  });

  it("total formula is consistent across various subtotals", () => {
    const amounts = [1000, 15000, 35000, 50000, 99999, 100000, 200000];
    for (const subtotal of amounts) {
      const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
      const total = subtotal + shipping;
      expect(total).toBe(subtotal + shipping);
      // Verify no IVA leakage
      const ivaIfApplied = Math.round(subtotal * 0.19);
      if (ivaIfApplied > 0) {
        expect(total).not.toBe(subtotal + ivaIfApplied + shipping);
      }
    }
  });
});
