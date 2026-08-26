import { describe, it, expect } from "vitest";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

type Cart = CartItem[];

function addItem(cart: Cart, product: Product, quantity: number = 1): Cart {
  const existing = cart.find((item) => item.product.id === product.id);
  if (existing) {
    return cart.map((item) =>
      item.product.id === product.id
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  }
  return [...cart, { product, quantity }];
}

function removeItem(cart: Cart, productId: string): Cart {
  return cart.filter((item) => item.product.id !== productId);
}

function updateQuantity(cart: Cart, productId: string, quantity: number): Cart {
  if (quantity <= 0) return removeItem(cart, productId);
  return cart.map((item) =>
    item.product.id === productId ? { ...item, quantity } : item
  );
}

function clearCart(): Cart {
  return [];
}

function getSubtotal(cart: Cart): number {
  return cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
}

function hasFreeShipping(subtotal: number): boolean {
  return subtotal >= 100000;
}

const mockProductA: Product = {
  id: "prod-a",
  name: "Camiseta Básica",
  price: 25000,
};

const mockProductB: Product = {
  id: "prod-b",
  name: "Pantalón Jeans",
  price: 55000,
};

describe("addItem", () => {
  it("adds item to empty cart", () => {
    const cart = addItem([], mockProductA, 1);
    expect(cart).toHaveLength(1);
    expect(cart[0].product.id).toBe("prod-a");
    expect(cart[0].quantity).toBe(1);
  });

  it("increments quantity for existing product", () => {
    const cart = addItem([], mockProductA, 1);
    const updated = addItem(cart, mockProductA, 2);
    expect(updated).toHaveLength(1);
    expect(updated[0].quantity).toBe(3);
  });

  it("adds different products separately", () => {
    let cart = addItem([], mockProductA, 1);
    cart = addItem(cart, mockProductB, 1);
    expect(cart).toHaveLength(2);
  });
});

describe("removeItem", () => {
  it("removes item from cart", () => {
    const cart = addItem([], mockProductA, 1);
    const updated = removeItem(cart, "prod-a");
    expect(updated).toHaveLength(0);
  });

  it("does not affect other items", () => {
    let cart = addItem([], mockProductA, 1);
    cart = addItem(cart, mockProductB, 1);
    const updated = removeItem(cart, "prod-a");
    expect(updated).toHaveLength(1);
    expect(updated[0].product.id).toBe("prod-b");
  });
});

describe("updateQuantity", () => {
  it("updates quantity", () => {
    const cart = addItem([], mockProductA, 1);
    const updated = updateQuantity(cart, "prod-a", 5);
    expect(updated[0].quantity).toBe(5);
  });

  it("removes item when quantity <= 0", () => {
    const cart = addItem([], mockProductA, 1);
    const updated = updateQuantity(cart, "prod-a", 0);
    expect(updated).toHaveLength(0);
  });
});

describe("clearCart", () => {
  it("returns empty array", () => {
    expect(clearCart()).toEqual([]);
  });
});

describe("getSubtotal", () => {
  it("calculates subtotal for single item", () => {
    const cart = addItem([], mockProductA, 1);
    expect(getSubtotal(cart)).toBe(25000);
  });

  it("calculates subtotal with multiple quantities", () => {
    const cart = addItem([], mockProductA, 3);
    expect(getSubtotal(cart)).toBe(75000);
  });

  it("calculates subtotal for multiple products", () => {
    let cart = addItem([], mockProductA, 2);
    cart = addItem(cart, mockProductB, 1);
    expect(getSubtotal(cart)).toBe(105000);
  });

  it("returns 0 for empty cart", () => {
    expect(getSubtotal([])).toBe(0);
  });

  it("uses integer math (no floating point)", () => {
    const cart = addItem([], mockProductA, 7);
    const subtotal = getSubtotal(cart);
    expect(subtotal).toBe(175000);
    expect(Number.isInteger(subtotal)).toBe(true);
  });
});

describe("free shipping threshold", () => {
  it("does not offer free shipping below threshold", () => {
    expect(hasFreeShipping(99999)).toBe(false);
  });

  it("offers free shipping at threshold", () => {
    expect(hasFreeShipping(100000)).toBe(true);
  });

  it("offers free shipping above threshold", () => {
    expect(hasFreeShipping(200000)).toBe(true);
  });
});
