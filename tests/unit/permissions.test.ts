import { describe, it, expect } from "vitest";
import type { UserRole } from "@/types";

function hasRole(userRole: UserRole | null, role: UserRole): boolean {
  if (!userRole) return false;
  if (role === "ADMIN") return userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  if (role === "SUPER_ADMIN") return userRole === "SUPER_ADMIN";
  return userRole === role;
}

function canAccessAdmin(userRole: UserRole | null): boolean {
  return hasRole(userRole, "ADMIN");
}

describe("Admin route access", () => {
  it("denies unauthenticated user", () => {
    expect(canAccessAdmin(null)).toBe(false);
    expect(canAccessAdmin(null)).toBe(false);
    expect(canAccessAdmin(null)).toBe(false);
    expect(canAccessAdmin(null)).toBe(false);
    expect(canAccessAdmin(null)).toBe(false);
  });

  it("denies CUSTOMER role", () => {
    expect(canAccessAdmin("CUSTOMER")).toBe(false);
  });

  it("allows ADMIN role", () => {
    expect(canAccessAdmin("ADMIN")).toBe(true);
  });

  it("allows SUPER_ADMIN role", () => {
    expect(canAccessAdmin("SUPER_ADMIN")).toBe(true);
  });
});

describe("hasRole", () => {
  it("ADMIN matches ADMIN and SUPER_ADMIN", () => {
    expect(hasRole("ADMIN", "ADMIN")).toBe(true);
    expect(hasRole("SUPER_ADMIN", "ADMIN")).toBe(true);
  });

  it("ADMIN does not match CUSTOMER", () => {
    expect(hasRole("CUSTOMER", "ADMIN")).toBe(false);
  });

  it("SUPER_ADMIN only matches SUPER_ADMIN", () => {
    expect(hasRole("SUPER_ADMIN", "SUPER_ADMIN")).toBe(true);
    expect(hasRole("ADMIN", "SUPER_ADMIN")).toBe(false);
    expect(hasRole("CUSTOMER", "SUPER_ADMIN")).toBe(false);
  });

  it("returns false for null user", () => {
    expect(hasRole(null, "ADMIN")).toBe(false);
    expect(hasRole(null, "SUPER_ADMIN")).toBe(false);
    expect(hasRole(null, "CUSTOMER")).toBe(false);
  });

  it("CUSTOMER matches only CUSTOMER", () => {
    expect(hasRole("CUSTOMER", "CUSTOMER")).toBe(true);
    expect(hasRole("ADMIN", "CUSTOMER")).toBe(false);
    expect(hasRole("SUPER_ADMIN", "CUSTOMER")).toBe(false);
  });
});
