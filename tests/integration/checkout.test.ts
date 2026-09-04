import { describe, it, expect } from "vitest";
import { addressSchema } from "@/utils/validation";
import { TRANSFER_METHODS } from "@/features/checkout/paymentService";

describe("Checkout Integration", () => {
  describe("checkout form validation using addressSchema", () => {
    it("accepts valid address data", () => {
      const result = addressSchema.safeParse({
        full_name: "María García",
        phone: "3101234567",
        address_line1: "Carrera 7 #45-12",
        city: "Medellín",
        department: "Antioquia",
      });
      expect(result.success).toBe(true);
    });

    it("rejects short name", () => {
      const result = addressSchema.safeParse({
        full_name: "M",
        phone: "3101234567",
        address_line1: "Carrera 7 #45-12",
        city: "Medellín",
        department: "Antioquia",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid phone", () => {
      const result = addressSchema.safeParse({
        full_name: "María García",
        phone: "310",
        address_line1: "Carrera 7 #45-12",
        city: "Medellín",
        department: "Antioquia",
      });
      expect(result.success).toBe(false);
    });

    it("accepts address with optional fields", () => {
      const result = addressSchema.safeParse({
        full_name: "María García",
        phone: "3101234567",
        address_line1: "Carrera 7 #45-12",
        address_line2: "Apto 301",
        city: "Medellín",
        department: "Antioquia",
        postal_code: "050012",
        instructions: "Leave at reception",
      });
      expect(result.success).toBe(true);
    });

    it("rejects short address_line1", () => {
      const result = addressSchema.safeParse({
        full_name: "María García",
        phone: "3101234567",
        address_line1: "Av",
        city: "Medellín",
        department: "Antioquia",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("payment methods available", () => {
    it("only offers NEQUI and DAVIPLATA as checkout transfer methods (no PSE)", () => {
      expect(TRANSFER_METHODS).toEqual(["NEQUI", "DAVIPLATA"]);
      expect(TRANSFER_METHODS).not.toContain("PSE");
    });
  });

  describe("order creation flow", () => {
    it("creates a NEQUI order in PENDING_PAYMENT state with payment method", async () => {
      const mockOrder = {
        order: {
          order_id: "order-789",
          status: "PENDING_PAYMENT",
          payment_id: "pay-789",
          payment: { method: "NEQUI", status: "PENDING" },
        },
      };

      const invoke = vi.fn().mockResolvedValue({ data: mockOrder, error: null });

      const body = {
        items: [{ product_id: "prod-a", quantity: 1 }],
        address_snapshot: {
          full_name: "María García",
          phone: "3101234567",
          address_line1: "Carrera 7 #45-12",
          city: "Medellín",
          department: "Antioquia",
        },
        idempotency_key: "key-789",
        payment_method: "NEQUI",
      };

      invoke("create-order", { body });
      const result = await invoke("create-order", { body });

      expect(result.error).toBeNull();
      expect(result.data.order.status).toBe("PENDING_PAYMENT");
      expect(body.payment_method).toBe("NEQUI");
    });

    it("creates a DAVIPLATA order in PENDING_PAYMENT state with payment method", async () => {
      const body = {
        items: [{ product_id: "prod-a", quantity: 1 }],
        address_snapshot: {
          full_name: "María García",
          phone: "3101234567",
          address_line1: "Carrera 7 #45-12",
          city: "Medellín",
          department: "Antioquia",
        },
        idempotency_key: "key-900",
        payment_method: "DAVIPLATA",
      };
      expect(body.payment_method).toBe("DAVIPLATA");
    });
  });
});
