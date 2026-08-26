export const SITE_NAME = "MIYUKI";
export const SITE_DESCRIPTION = "MIYUKI - Tienda de productos seleccionados. Envíos a toda Colombia.";
export const SITE_URL = import.meta.env.VITE_BASE_URL || "https://USUARIO.github.io/Miyuki";
export const CURRENCY = "COP" as const;
export const CURRENCY_SYMBOL = "$";
export const SHIPPING_COST = 8000;
export const FREE_SHIPPING_THRESHOLD = 100000;
export const PAYMENT_MODE = (import.meta.env.VITE_PAYMENT_MODE as string) || "mock";

export const VALID_ORDER_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ["PAYMENT_PROCESSING", "PAYMENT_EXPIRED", "CANCELLED"],
  PAYMENT_PROCESSING: ["PAID", "PAYMENT_FAILED", "PAYMENT_EXPIRED"],
  PAID: ["PROCESSING", "REFUNDED", "CANCELLED"],
  PAYMENT_FAILED: ["PENDING_PAYMENT", "CANCELLED"],
  PAYMENT_EXPIRED: ["PENDING_PAYMENT", "CANCELLED"],
  CANCELLED: [],
  PROCESSING: ["SHIPPED", "CANCELLED", "REFUNDED"],
  SHIPPED: ["DELIVERED", "REFUNDED"],
  DELIVERED: ["REFUNDED"],
  REFUNDED: [],
};

export const COLOMBIAN_DEPARTMENTS = [
  "Amazonas", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas",
  "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba",
  "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira",
  "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo",
  "Quindío", "Risaralda", "Santander", "Sucre", "Tolima",
  "Valle del Cauca", "Vaupés", "Vichada", "Bogotá D.C.",
].sort();
