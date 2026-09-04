import { createContext, useContext, useCallback } from "react";
import type { ReactNode } from "react";
import type { CartItem, PaymentMethod } from "@/types";
import { useCart } from "@/features/cart/CartProvider";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/constants";

export interface SummarySnapshot {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

export interface CheckoutAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  department: string;
  postal_code?: string | null;
  instructions?: string | null;
}

interface CheckoutContextType {
  summary: SummarySnapshot | null;
  address: CheckoutAddress | null;
  method: PaymentMethod | null;
  setAddress: (address: CheckoutAddress) => void;
  setMethod: (method: PaymentMethod) => void;
  refresh: () => void;
  reset: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const { items, getSubtotal, getShippingCost, getTotal } = useCart();
  const [method, setMethod] = useLocalStorage<PaymentMethod | null>(
    "checkout-payment-method",
    null,
  );
  const [address, setAddress] = useLocalStorage<CheckoutAddress | null>(
    "checkout-address",
    null,
  );

  const summary: SummarySnapshot | null = items.length > 0
    ? { items, subtotal: getSubtotal(), shipping: getShippingCost(), total: getTotal() }
    : null;

  const refresh = useCallback(() => {
    // No-op: summary is derived live from cart state.
  }, []);

  const reset = useCallback(() => {
    setMethod(null);
    setAddress(null);
  }, [setMethod, setAddress]);

  return (
    <CheckoutContext.Provider
      value={{ summary, address, method, setAddress, setMethod, refresh, reset }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout(): CheckoutContextType {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}

export { FREE_SHIPPING_THRESHOLD, SHIPPING_COST };
