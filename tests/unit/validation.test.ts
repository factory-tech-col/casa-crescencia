import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, addressSchema } from "@/utils/validation";

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      full_name: "Juan Pérez",
      email: "juan@example.com",
      password: "securepass",
      confirmPassword: "securepass",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({
      full_name: "J",
      email: "juan@example.com",
      password: "securepass",
      confirmPassword: "securepass",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password mismatch", () => {
    const result = registerSchema.safeParse({
      full_name: "Juan Pérez",
      email: "juan@example.com",
      password: "securepass",
      confirmPassword: "differentpass",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmPasswordError = result.error.issues.find(
        (issue) => issue.path.includes("confirmPassword")
      );
      expect(confirmPasswordError).toBeDefined();
    }
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      full_name: "Juan Pérez",
      email: "juan@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      full_name: "Juan Pérez",
      email: "invalid",
      password: "securepass",
      confirmPassword: "securepass",
    });
    expect(result.success).toBe(false);
  });
});

describe("addressSchema", () => {
  it("accepts valid Colombian address", () => {
    const result = addressSchema.safeParse({
      full_name: "Juan Pérez",
      phone: "3001234567",
      address_line1: "Calle 45 #12-34",
      city: "Bogotá",
      department: "Cundinamarca",
    });
    expect(result.success).toBe(true);
  });

  it("accepts address with optional fields", () => {
    const result = addressSchema.safeParse({
      full_name: "Juan Pérez",
      phone: "3001234567",
      address_line1: "Calle 45 #12-34",
      address_line2: "Apto 301",
      city: "Bogotá",
      department: "Cundinamarca",
      postal_code: "110111",
      instructions: "Leave at reception",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid phone (not Colombian format)", () => {
    const result = addressSchema.safeParse({
      full_name: "Juan Pérez",
      phone: "1234567890",
      address_line1: "Calle 45 #12-34",
      city: "Bogotá",
      department: "Cundinamarca",
    });
    expect(result.success).toBe(false);
  });

  it("accepts phone with +57 prefix", () => {
    const result = addressSchema.safeParse({
      full_name: "Juan Pérez",
      phone: "+573001234567",
      address_line1: "Calle 45 #12-34",
      city: "Bogotá",
      department: "Cundinamarca",
    });
    expect(result.success).toBe(true);
  });

  it("accepts phone with 57 prefix", () => {
    const result = addressSchema.safeParse({
      full_name: "Juan Pérez",
      phone: "573001234567",
      address_line1: "Calle 45 #12-34",
      city: "Bogotá",
      department: "Cundinamarca",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = addressSchema.safeParse({
      full_name: "Juan Pérez",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short address_line1", () => {
    const result = addressSchema.safeParse({
      full_name: "Juan Pérez",
      phone: "3001234567",
      address_line1: "Av",
      city: "Bogotá",
      department: "Cundinamarca",
    });
    expect(result.success).toBe(false);
  });
});
