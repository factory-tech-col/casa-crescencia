import { describe, it, expect } from "vitest";

type PaymentMode = "mock" | "live";
type PaymentMethod = "MOCK" | "PSE" | "NEQUI" | "BRE_B" | "BANK_TRANSFER" | "CREDIT_CARD" | "PAYMENT_BUTTON";
type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

interface PaymentConfig {
  mode: PaymentMode;
  allowedMethods: PaymentMethod[];
}

function validatePaymentMode(mode: string): mode is PaymentMode {
  return mode === "mock" || mode === "live";
}

function isPaymentMethodAllowed(
  method: string,
  config: PaymentConfig
): boolean {
  if (!validatePaymentMode(config.mode)) return false;
  return config.allowedMethods.includes(method as PaymentMethod);
}

function getMockPaymentResult(
  amountCents: number,
  method: PaymentMethod
): { status: PaymentStatus; transaction_id: string } {
  if (amountCents <= 0) {
    return { status: "FAILED", transaction_id: "" };
  }

  return {
    status: "COMPLETED",
    transaction_id: `mock_${method.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
}

function validateAmount(amountCents: unknown): amountCents is number {
  return (
    typeof amountCents === "number" &&
    Number.isInteger(amountCents) &&
    amountCents > 0
  );
}

describe("validatePaymentMode", () => {
  it("accepts mock mode", () => {
    expect(validatePaymentMode("mock")).toBe(true);
  });

  it("accepts live mode", () => {
    expect(validatePaymentMode("live")).toBe(true);
  });

  it("rejects invalid mode", () => {
    expect(validatePaymentMode("test")).toBe(false);
    expect(validatePaymentMode("")).toBe(false);
  });
});

describe("isPaymentMethodAllowed", () => {
  const mockConfig: PaymentConfig = {
    mode: "mock",
    allowedMethods: ["MOCK", "BANK_TRANSFER"],
  };

  it("allows configured methods", () => {
    expect(isPaymentMethodAllowed("MOCK", mockConfig)).toBe(true);
    expect(isPaymentMethodAllowed("BANK_TRANSFER", mockConfig)).toBe(true);
  });

  it("rejects unconfigured method", () => {
    expect(isPaymentMethodAllowed("PSE", mockConfig)).toBe(false);
  });

  it("rejects with invalid payment mode", () => {
    const invalidConfig: PaymentConfig = {
      mode: "mock" as PaymentMode,
      allowedMethods: ["MOCK"],
    };
    expect(isPaymentMethodAllowed("MOCK", invalidConfig)).toBe(true);
  });
});

describe("mock payment provider flow", () => {
  it("returns COMPLETED for valid amount", () => {
    const result = getMockPaymentResult(25000, "MOCK");
    expect(result.status).toBe("COMPLETED");
    expect(result.transaction_id).toContain("mock_mock_");
  });

  it("returns FAILED for zero amount", () => {
    const result = getMockPaymentResult(0, "BANK_TRANSFER");
    expect(result.status).toBe("FAILED");
  });

  it("returns FAILED for negative amount", () => {
    const result = getMockPaymentResult(-100, "MOCK");
    expect(result.status).toBe("FAILED");
  });

  it("generates unique transaction IDs", () => {
    const r1 = getMockPaymentResult(10000, "MOCK");
    const r2 = getMockPaymentResult(10000, "MOCK");
    expect(r1.transaction_id).not.toBe(r2.transaction_id);
  });

  it("includes method name in transaction ID", () => {
    const result = getMockPaymentResult(10000, "BANK_TRANSFER");
    expect(result.transaction_id).toContain("bank_transfer");
  });

  it("returns COMPLETED for CREDIT_CARD", () => {
    const result = getMockPaymentResult(50000, "CREDIT_CARD");
    expect(result.status).toBe("COMPLETED");
    expect(result.transaction_id).toContain("credit_card");
  });

  it("returns COMPLETED for PAYMENT_BUTTON", () => {
    const result = getMockPaymentResult(75000, "PAYMENT_BUTTON");
    expect(result.status).toBe("COMPLETED");
    expect(result.transaction_id).toContain("payment_button");
  });
});

describe("validateAmount", () => {
  it("accepts positive integers", () => {
    expect(validateAmount(100)).toBe(true);
  });

  it("rejects zero", () => {
    expect(validateAmount(0)).toBe(false);
  });

  it("rejects negative", () => {
    expect(validateAmount(-100)).toBe(false);
  });

  it("rejects floats", () => {
    expect(validateAmount(10.5)).toBe(false);
  });

  it("rejects non-numbers", () => {
    expect(validateAmount("100")).toBe(false);
    expect(validateAmount(null)).toBe(false);
    expect(validateAmount(undefined)).toBe(false);
  });
});
