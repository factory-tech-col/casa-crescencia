import { describe, it, expect } from "vitest";
import { VALID_ORDER_TRANSITIONS } from "@/lib/constants";

function isValidTransition(from: string, to: string): boolean {
  const allowed = VALID_ORDER_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

const ALL_STATES = [
  "PENDING_PAYMENT",
  "PAYMENT_PROCESSING",
  "PAID",
  "PAYMENT_FAILED",
  "PAYMENT_EXPIRED",
  "CANCELLED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "REFUNDED",
];

describe("VALID_ORDER_TRANSITIONS", () => {
  it("defines transitions for all expected states", () => {
    for (const state of ALL_STATES) {
      expect(VALID_ORDER_TRANSITIONS).toHaveProperty(state);
    }
  });
});

describe("PENDING_PAYMENT transitions", () => {
  it("allows transition to PAYMENT_PROCESSING", () => {
    expect(isValidTransition("PENDING_PAYMENT", "PAYMENT_PROCESSING")).toBe(true);
  });

  it("allows transition to PAYMENT_EXPIRED", () => {
    expect(isValidTransition("PENDING_PAYMENT", "PAYMENT_EXPIRED")).toBe(true);
  });

  it("allows transition to CANCELLED", () => {
    expect(isValidTransition("PENDING_PAYMENT", "CANCELLED")).toBe(true);
  });

  it("rejects transition to PAID", () => {
    expect(isValidTransition("PENDING_PAYMENT", "PAID")).toBe(false);
  });

  it("rejects transition to SHIPPED", () => {
    expect(isValidTransition("PENDING_PAYMENT", "SHIPPED")).toBe(false);
  });

  it("rejects transition to DELIVERED", () => {
    expect(isValidTransition("PENDING_PAYMENT", "DELIVERED")).toBe(false);
  });

  it("rejects same-state transition", () => {
    expect(isValidTransition("PENDING_PAYMENT", "PENDING_PAYMENT")).toBe(false);
  });
});

describe("PAYMENT_PROCESSING transitions", () => {
  it("allows transition to PAID", () => {
    expect(isValidTransition("PAYMENT_PROCESSING", "PAID")).toBe(true);
  });

  it("allows transition to PAYMENT_FAILED", () => {
    expect(isValidTransition("PAYMENT_PROCESSING", "PAYMENT_FAILED")).toBe(true);
  });

  it("allows transition to PAYMENT_EXPIRED", () => {
    expect(isValidTransition("PAYMENT_PROCESSING", "PAYMENT_EXPIRED")).toBe(true);
  });

  it("rejects transition to CANCELLED", () => {
    expect(isValidTransition("PAYMENT_PROCESSING", "CANCELLED")).toBe(false);
  });

  it("rejects transition to SHIPPED", () => {
    expect(isValidTransition("PAYMENT_PROCESSING", "SHIPPED")).toBe(false);
  });
});

describe("PAID transitions", () => {
  it("allows transition to PROCESSING", () => {
    expect(isValidTransition("PAID", "PROCESSING")).toBe(true);
  });

  it("allows transition to REFUNDED", () => {
    expect(isValidTransition("PAID", "REFUNDED")).toBe(true);
  });

  it("allows transition to CANCELLED", () => {
    expect(isValidTransition("PAID", "CANCELLED")).toBe(true);
  });

  it("rejects transition to SHIPPED", () => {
    expect(isValidTransition("PAID", "SHIPPED")).toBe(false);
  });
});

describe("PAYMENT_FAILED transitions", () => {
  it("allows transition to PENDING_PAYMENT", () => {
    expect(isValidTransition("PAYMENT_FAILED", "PENDING_PAYMENT")).toBe(true);
  });

  it("allows transition to CANCELLED", () => {
    expect(isValidTransition("PAYMENT_FAILED", "CANCELLED")).toBe(true);
  });

  it("rejects transition to PAID", () => {
    expect(isValidTransition("PAYMENT_FAILED", "PAID")).toBe(false);
  });
});

describe("PAYMENT_EXPIRED transitions", () => {
  it("allows transition to PENDING_PAYMENT", () => {
    expect(isValidTransition("PAYMENT_EXPIRED", "PENDING_PAYMENT")).toBe(true);
  });

  it("allows transition to CANCELLED", () => {
    expect(isValidTransition("PAYMENT_EXPIRED", "CANCELLED")).toBe(true);
  });

  it("rejects transition to PAID", () => {
    expect(isValidTransition("PAYMENT_EXPIRED", "PAID")).toBe(false);
  });
});

describe("CANCELLED transitions", () => {
  it("rejects all transitions from CANCELLED", () => {
    expect(isValidTransition("CANCELLED", "PENDING_PAYMENT")).toBe(false);
    expect(isValidTransition("CANCELLED", "PROCESSING")).toBe(false);
    expect(isValidTransition("CANCELLED", "SHIPPED")).toBe(false);
    expect(isValidTransition("CANCELLED", "DELIVERED")).toBe(false);
  });
});

describe("PROCESSING transitions", () => {
  it("allows transition to SHIPPED", () => {
    expect(isValidTransition("PROCESSING", "SHIPPED")).toBe(true);
  });

  it("allows transition to CANCELLED", () => {
    expect(isValidTransition("PROCESSING", "CANCELLED")).toBe(true);
  });

  it("allows transition to REFUNDED", () => {
    expect(isValidTransition("PROCESSING", "REFUNDED")).toBe(true);
  });

  it("rejects transition to DELIVERED", () => {
    expect(isValidTransition("PROCESSING", "DELIVERED")).toBe(false);
  });
});

describe("SHIPPED transitions", () => {
  it("allows transition to DELIVERED", () => {
    expect(isValidTransition("SHIPPED", "DELIVERED")).toBe(true);
  });

  it("allows transition to REFUNDED", () => {
    expect(isValidTransition("SHIPPED", "REFUNDED")).toBe(true);
  });

  it("rejects transition to CANCELLED", () => {
    expect(isValidTransition("SHIPPED", "CANCELLED")).toBe(false);
  });
});

describe("DELIVERED transitions", () => {
  it("allows transition to REFUNDED", () => {
    expect(isValidTransition("DELIVERED", "REFUNDED")).toBe(true);
  });

  it("rejects transition to CANCELLED", () => {
    expect(isValidTransition("DELIVERED", "CANCELLED")).toBe(false);
  });
});

describe("REFUNDED transitions", () => {
  it("rejects all transitions from REFUNDED", () => {
    expect(isValidTransition("REFUNDED", "PENDING_PAYMENT")).toBe(false);
    expect(isValidTransition("REFUNDED", "PROCESSING")).toBe(false);
    expect(isValidTransition("REFUNDED", "SHIPPED")).toBe(false);
  });
});

describe("invalid transitions", () => {
  it("rejects unknown source state", () => {
    expect(isValidTransition("UNKNOWN", "PENDING_PAYMENT")).toBe(false);
  });

  it("rejects unknown target state", () => {
    expect(isValidTransition("PENDING_PAYMENT", "UNKNOWN")).toBe(false);
  });

  it("rejects same-state transitions", () => {
    for (const state of ALL_STATES) {
      expect(isValidTransition(state, state)).toBe(false);
    }
  });
});
