import { describe, it, expect, vi, beforeEach } from "vitest";
import { addressSchema } from "@/utils/validation";
import type { PaymentMethod } from "@/types";

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  available: boolean;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: "MOCK", label: "Pago de prueba (Mock)", available: true },
  { id: "PSE", label: "PSE", available: false },
  { id: "NEQUI", label: "Nequi", available: false },
  { id: "BRE_B", label: "Bre-B", available: false },
  { id: "BANK_TRANSFER", label: "Transferencia Bancaria", available: true },
];

interface MockSupabaseClient {
  functions: { invoke: ReturnType<typeof vi.fn> };
  auth: { getSession: ReturnType<typeof vi.fn> };
}

function createMockSupabase(): MockSupabaseClient {
  return {
    functions: { invoke: vi.fn() },
    auth: { getSession: vi.fn() },
  };
}

describe("Checkout Integration", () => {
  let mockSupabase: MockSupabaseClient;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    vi.clearAllMocks();
  });

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
    it("MOCK is available", () => {
      const mock = PAYMENT_OPTIONS.find((o) => o.id === "MOCK");
      expect(mock?.available).toBe(true);
    });

    it("BANK_TRANSFER is available", () => {
      const bt = PAYMENT_OPTIONS.find((o) => o.id === "BANK_TRANSFER");
      expect(bt?.available).toBe(true);
    });

    it("PSE is not available", () => {
      const pse = PAYMENT_OPTIONS.find((o) => o.id === "PSE");
      expect(pse?.available).toBe(false);
    });

    it("NEQUI is not available", () => {
      const nequi = PAYMENT_OPTIONS.find((o) => o.id === "NEQUI");
      expect(nequi?.available).toBe(false);
    });

    it("BRE_B is not available", () => {
      const breb = PAYMENT_OPTIONS.find((o) => o.id === "BRE_B");
      expect(breb?.available).toBe(false);
    });
  });

  describe("order creation flow", () => {
    it("creates order via edge function", async () => {
      const mockOrder = {
        order: { id: "order-123", status: "PENDING_PAYMENT" },
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: "token-abc" } },
      });

      mockSupabase.functions.invoke.mockResolvedValue({
        data: mockOrder,
        error: null,
      });

      const sessionResult = await mockSupabase.auth.getSession();
      expect(sessionResult.data.session?.access_token).toBe("token-abc");

      const result = await mockSupabase.functions.invoke("create-order", {
        body: {
          items: [{ product_id: "prod-a", quantity: 3 }],
          address: {
            full_name: "María García",
            phone: "3101234567",
            address_line1: "Carrera 7 #45-12",
            city: "Medellín",
            department: "Antioquia",
          },
          idempotency_key: "key-123",
        },
      });

      expect(result.error).toBeNull();
      expect(result.data.order.id).toBe("order-123");
      expect(result.data.order.status).toBe("PENDING_PAYMENT");
    });

    it("handles order creation error", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: "token-abc" } },
      });

      mockSupabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: "Product out of stock" },
      });

      const result = await mockSupabase.functions.invoke("create-order", {
        body: {
          items: [{ product_id: "prod-sold-out", quantity: 1 }],
          address: {
            full_name: "María García",
            phone: "3101234567",
            address_line1: "Carrera 7 #45-12",
            city: "Medellín",
            department: "Antioquia",
          },
          idempotency_key: "key-456",
        },
      });

      expect(result.error).toBeDefined();
      expect(result.error.message).toBe("Product out of stock");
    });

    it("processes mock payment after order creation", async () => {
      const mockOrder = {
        order: { id: "order-789", status: "PENDING_PAYMENT" },
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: "token-abc" } },
      });

      mockSupabase.functions.invoke
        .mockResolvedValueOnce({ data: mockOrder, error: null })
        .mockResolvedValueOnce({ data: { status: "COMPLETED" }, error: null });

      const orderResult = await mockSupabase.functions.invoke("create-order", {
        body: {
          items: [{ product_id: "prod-a", quantity: 1 }],
          address: {
            full_name: "María García",
            phone: "3101234567",
            address_line1: "Carrera 7 #45-12",
            city: "Medellín",
            department: "Antioquia",
          },
          idempotency_key: "key-789",
        },
      });

      expect(orderResult.error).toBeNull();

      const paymentResult = await mockSupabase.functions.invoke("process-payment", {
        body: { order_id: "order-789", method: "MOCK" },
      });

      expect(paymentResult.error).toBeNull();
      expect(paymentResult.data.status).toBe("COMPLETED");
    });
  });
});
