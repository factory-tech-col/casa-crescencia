export const SITE_NAME = "Casa Crescencia";
export const SITE_DESCRIPTION = "Casa Crescencia - Tienda de productos seleccionados. Envíos a toda Colombia.";
export const SITE_URL = import.meta.env.VITE_BASE_URL || "https://USUARIO.github.io/Miyuki";
export const CURRENCY = "COP" as const;
export const CURRENCY_SYMBOL = "$";
export const SHIPPING_COST = 13900;
export const FREE_SHIPPING_THRESHOLD = 100000;
export const PAYMENT_MODE = (import.meta.env.VITE_PAYMENT_MODE as string) || "mock";

// Número de la tienda: se usa para recibir transferencias de Nequi y para WhatsApp.
// Configurable vía variable de entorno. Formato local sin indicativo: 3133030681
const STORE_NUMBER_LOCAL =
  (import.meta.env.VITE_STORE_PHONE_NUMBER as string) || "3133030681";

/** Número local de Nequi que recibe las transferencias (formato "313 303 0681"). */
export const NEQUI_ACCOUNT_NUMBER = STORE_NUMBER_LOCAL.replace(/\D/g, "")
  .replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3");

/** Número de la tienda en formato internacional WhatsApp (sin "+"), ej. "573133030681". */
export const WHATSAPP_NUMBER = `57${STORE_NUMBER_LOCAL.replace(/\D/g, "")}`;

// URLs oficiales para abrir Nequi y Daviplata (transferencia manual)
export const NEQUI_URL = "https://www.nequi.com.co/";
export const DAVIPLATA_URL = "https://www.daviplata.com/personas/pasar-plata";

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Construye el mensaje de WhatsApp que se abre al presionar
 * "ENVIAR COMPROBANTE Y FINALIZAR". Recibe el total y la lista de productos.
 */
export function buildPaymentWhatsAppMessage(opts: {
  total: number;
  productsList: string;
}): string {
  const totalLabel = opts.total.toLocaleString("es-CO");
  return (
    `Hola, acabo de realizar una transferencia a tu Nequi por un valor de ` +
    `${totalLabel} COP por la compra de: ${opts.productsList} en Casa Crescencia. ` +
    `Te adjunto esta información para que verifiques el pago y me confirmes la ` +
    `disponibilidad de mis productos. ¡Muchas gracias!`
  );
}

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
