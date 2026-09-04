import { createContext, useContext, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import type { CartItem, Product } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getShippingCost: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>("oro-cart", []);

  const addItem = useCallback(
    (product: Product, quantity: number = 1) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: Math.min(item.quantity + quantity, 10) }
              : item,
          );
        }
        return [...prev, { product, quantity: Math.min(quantity, 10) }];
      });
    },
    [setItems],
  );

  const removeItem = useCallback(
    (productId: string) => {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
    },
    [setItems],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity: Math.min(quantity, 10) } : item,
        ),
      );
    },
    [setItems, removeItem],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, [setItems]);

  const getSubtotal = useCallback(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items],
  );

  const getShippingCost = useCallback(() => {
    const subtotal = getSubtotal();
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  }, [getSubtotal]);

  const getTotal = useCallback(
    () => getSubtotal() + getShippingCost(),
    [getSubtotal, getShippingCost],
  );

  const getItemCount = useCallback(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  useEffect(() => {
    const validItems = items.filter(
      (item) => item.product && item.product.id && item.quantity > 0,
    );
    if (validItems.length !== items.length) {
      setItems(validItems);
    }
  }, [items, setItems]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getSubtotal,
        getShippingCost,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
