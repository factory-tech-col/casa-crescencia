import { CURRENCY_SYMBOL } from "@/lib/constants";

export function formatCOP(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString("es-CO")}`;
}

export function formatPrice(amount: number, currency: string = "COP"): string {
  if (currency === "COP") {
    return `${CURRENCY_SYMBOL}${amount.toLocaleString("es-CO")} COP`;
  }
  return `${CURRENCY_SYMBOL}${amount.toLocaleString()}`;
}

/**
 * Customer-facing total for an order. The DB `total` column historically
 * includes IVA (subtotal + iva + shipping), but customers actually pay
 * `subtotal + shipping_cost` (no IVA). This returns the exact amount charged
 * to the customer so the UI matches what was paid (e.g. $48.900 COP).
 */
export function orderTotal(order: {
  subtotal?: number | null;
  shipping_cost?: number | null;
}): number {
  return (Number(order.subtotal ?? 0) || 0) + (Number(order.shipping_cost ?? 0) || 0);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
