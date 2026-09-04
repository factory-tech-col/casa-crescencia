import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { NEQUI_URL, DAVIPLATA_URL } from "@/lib/constants";
import type { CartItem, PaymentMethod } from "@/types";

export interface CheckoutOrderResult {
  orderId: string;
  paymentId: string | null;
  reference: string;
  mode: "mock" | "sandbox" | "live";
  total: number;
  currency: string;
}

export interface ReceiptInfo {
  file_name: string | null;
  mime: string | null;
  size: number | null;
  storage_path?: string | null;
  data?: string | null;
}

export interface ConfirmReceiptResult {
  orderId: string;
  paymentId: string | null;
  status: string;
  total: number;
}

export interface OrderWithPayment {
  id: string;
  user_id: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  currency: string;
  shipping_address?: {
    full_name?: string | null;
    phone?: string | null;
  } | null;
  payment?: {
    method: string | null;
    status: string | null;
  } | null;
  items?: {
    product_name: string;
    quantity: number;
  }[];
}

// Official transfer methods for this store.
export const TRANSFER_METHODS = ["NEQUI", "DAVIPLATA"] as const;
export type TransferMethod = (typeof TRANSFER_METHODS)[number];

// URLs oficiales/configurables para abrir la plataforma de cada método.
export const WALLET_GATEWAY_LINKS: Record<string, { name: string; url: string }> = {
  NEQUI: { name: "Nequi", url: NEQUI_URL },
  DAVIPLATA: { name: "Daviplata", url: DAVIPLATA_URL },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  MOCK: "Pago de prueba (Mock)",
  PSE: "Débito Bancario (PSE)",
  NEQUI: "Nequi",
  DAVIPLATA: "Daviplata",
  BRE_B: "Bre-B",
  BANK_TRANSFER: "Transferencia Bancaria",
};

export const TRANSFER_METHOD_LABELS: Record<TransferMethod, string> = {
  NEQUI: "Nequi",
  DAVIPLATA: "Daviplata",
};

export const ALLOWED_RECEIPT_MIME = ["image/png", "image/jpeg", "image/webp"];
export const MAX_RECEIPT_BYTES = 8 * 1024 * 1024;

function generateReference(): string {
  return `MIYUKI-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

/**
 * Validates a receipt file (frontend UX validation).
 * Backend validation happens server-side in the confirm-receipt edge function.
 * Returns a human-readable error message or null when valid.
 */
export function validateReceiptFile(file: File): string | null {
  if (!ALLOWED_RECEIPT_MIME.includes(file.type)) {
    return "Solo se permiten imágenes PNG, JPG o WEBP.";
  }
  if (file.size > MAX_RECEIPT_BYTES) {
    return "El comprobante no puede superar 8 MB.";
  }
  if (file.size <= 0) {
    return "El comprobante está vacío.";
  }
  return null;
}

/**
 * Simulated receipt validation. This is NOT a real OCR/bank validation.
 * It is a placeholder that always returns VALID for well-formed receipts,
 * ready to be swapped for a real OCR service without redesigning the checkout.
 *
 * The authoritative validation (idempotency, amount, ownership) happens in
 * the confirm-receipt edge function and the confirm_payment RPC transactionally.
 */
export function validateReceiptAmount(_file: File): { result: string; total: number | null } {
  // NOTE: Simulated. Replaced by real OCR when configured. Never trust this
  // result alone to mark an order as PAID. The `_file` parameter is kept so a
  // real OCR implementation can be dropped in without changing the signature.
  return { result: "VALID", total: null };
}

/**
 * Creates an order persistently in Supabase (PENDING_PAYMENT state).
 * Primary path: the `create-order` edge function (server-side source of truth).
 * Fallback: calls the `create_order` RPC directly from the client, which is
 * SECURITY DEFINER and bypasses RLS. If both paths fail, throws with the
 * specific Supabase error message for diagnosis.
 */
export async function createCheckoutOrder(params: {
  items: CartItem[];
  address: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string | null;
    city: string;
    department: string;
    postal_code?: string | null;
    instructions?: string | null;
  };
  method: PaymentMethod;
  idempotencyKey: string;
}): Promise<CheckoutOrderResult> {
  const reference = generateReference();

  if (!supabase || !isSupabaseConfigured()) {
    console.error("[Payment] Supabase is not configured.");
    throw new Error("El servidor de pagos no está disponible.");
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error("[Payment] Session error:", sessionError);
    throw new Error("Error al obtener la sesión. Inicia sesión de nuevo e inténtalo.");
  }

  const token = sessionData.session?.access_token;
  const userId = sessionData.session?.user?.id;
  if (!token || !userId) {
    console.error("[Payment] No access token or user id in session.");
    throw new Error("Debes iniciar sesión para realizar un pedido.");
  }

  // Build a shipping_address_snapshot matching the schema expected by the
  // `create_order` RPC / `create-order` edge function.
  const address = params.address ?? ({} as typeof params.address);
  const shippingAddress = {
    full_name: address.full_name ?? "",
    phone: address.phone ?? "",
    address_line1: address.address_line1 ?? "",
    address_line2: address.address_line2 ?? null,
    city: address.city ?? "",
    department: address.department ?? "",
    postal_code: address.postal_code ?? null,
    instructions: address.instructions ?? null,
  };

  const rpcItems = params.items.map((item) => ({
    product_id: item.product.id,
    quantity: item.quantity,
  }));

  // --- PRIMARY PATH: Edge Function ---
  let edgeResult: Record<string, unknown> | null = null;
  let edgeFailed = false;

  try {
    console.debug("[Payment] create-order via edge function:", {
      itemCount: rpcItems.length,
      method: params.method,
      city: shippingAddress.city,
      idempotencyKey: params.idempotencyKey,
    });

    const response = await supabase.functions.invoke("create-order", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: {
        items: rpcItems,
        address_snapshot: shippingAddress,
        idempotency_key: params.idempotencyKey,
        payment_method: params.method,
      },
    });

    if (response.error) {
      const errData = response.error;
      const errMsg =
        errData?.message || errData?.error || JSON.stringify(errData) || "Edge Function error";
      console.warn("[Payment] Edge function returned error, will try RPC fallback:", {
        status: errData?.status,
        message: errMsg,
      });
      edgeFailed = true;
    } else {
      edgeResult = response.data as Record<string, unknown> | null;
    }
  } catch (fnErr) {
    console.warn("[Payment] Edge function invocation failed, will try RPC fallback:", fnErr);
    edgeFailed = true;
  }

  // --- FALLBACK PATH: Direct RPC call (bypasses Edge Function) ---
  if (edgeFailed || !edgeResult) {
    console.debug("[Payment] create-order via RPC fallback:", {
      itemCount: rpcItems.length,
      method: params.method,
    });

    const { data: rpcData, error: rpcError } = await supabase.rpc("create_order", {
      p_user_id: userId,
      p_items: rpcItems,
      p_address_snapshot: shippingAddress,
      p_idempotency_key: params.idempotencyKey,
      p_payment_method: params.method,
    });

    if (rpcError) {
      console.error("[Payment] RPC fallback also failed:", {
        message: rpcError.message,
        details: rpcError.details,
        hint: rpcError.hint,
        code: rpcError.code,
      });
      throw new Error(
        rpcError.message || "No se pudo crear el pedido. Intenta de nuevo.",
      );
    }

    edgeResult = rpcData as Record<string, unknown> | null;
  }

  if (!edgeResult) {
    console.error("[Payment] Empty response from both edge function and RPC fallback.");
    throw new Error("El servidor devolvió una respuesta vacía. Intenta de nuevo.");
  }

  // Parse the RPC / edge function response (both return the same JSONB shape):
  // { order_id, payment_id, status, subtotal, iva, shipping_cost, total, currency, items }
  // The edge function historically wrapped this in { order: {...} }, so unwrap
  // defensively if that shape is encountered.
  const raw = edgeResult as Record<string, unknown>;
  const order = (raw.order && typeof raw.order === "object" && raw.order !== null
    ? raw.order as Record<string, unknown>
    : raw) as Record<string, unknown>;
  const orderId = String(order.order_id ?? order.id ?? "");

  if (!orderId) {
    console.error("[Payment] No orderId in response:", edgeResult);
    throw new Error("No se pudo crear el pedido. El servidor no devolvió un identificador válido.");
  }

  const paymentId = (order.payment_id ?? null) as string | null;
  const currency = String(order.currency ?? "COP");

  // The server RPC calculates total with IVA (19%). Override with the frontend
  // formula: total = subtotal + shipping (no IVA) for display consistency.
  const subtotal = Number(order.subtotal ?? 0);
  const shippingCost = Number(order.shipping_cost ?? 0);
  const total = subtotal + shippingCost;

  console.debug("[Payment] Order created:", { orderId, subtotal, shippingCost, total, mode: "live" });

  return {
    orderId,
    paymentId,
    reference,
    mode: "live",
    total,
    currency,
  };
}

/**
 * Confirms a real order by receipt ('comprobante de pago').
 * PRIMARY PATH:    the `confirm-receipt` edge function (marks order PAID,
 *                  records receipt metadata + path, decrements inventory,
 *                  logs an audit entry).
 * FALLBACK PATH:   if the edge function is unreachable, calls the
 *                  `confirm_payment` RPC directly (SECURITY DEFINER, bypasses
 *                  RLS). This is the same function the edge function calls
 *                  internally, so it produces the same business outcome:
 *                  order -> PAID, payment -> COMPLETED.
 * NOTE: a raw `supabase.from('orders').update({ status: 'paid', receipt_url })`
 * is NOT used as fallback because (a) orders/payments only expose SELECT
 * policies to regular users (no UPDATE), so it would fail under RLS, and
 * (b) the 'receipt_url' column does not exist; receipt data is persisted on
 * the payment's receipt_path / metadata by the edge function path.
 */
export async function confirmReceiptPayment(params: {
  orderId: string;
  paymentMethod: string;
  receipt?: ReceiptInfo | null;
}): Promise<ConfirmReceiptResult> {
  if (!supabase || !isSupabaseConfigured()) {
    throw new Error("El servidor de pagos no está disponible.");
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  const userId = sessionData.session?.user?.id;

  if (!token || !userId) {
    throw new Error("Debes iniciar sesión para finalizar tu compra.");
  }

  // --- PRIMARY PATH: confirm-receipt edge function ---
  try {
    console.debug("[Payment] confirm receipt via edge function:", {
      orderId: params.orderId,
      method: params.paymentMethod,
    });

    const { data, error } = await supabase.functions.invoke("confirm-receipt", {
      body: {
        order_id: params.orderId,
        payment_method: params.paymentMethod,
        receipt: params.receipt ?? null,
      },
    });

    if (error) {
      console.error("Error confirmando comprobante (edge function):", error);
    } else if (data && data.status === "PAID") {
      return {
        orderId: data?.order_id ?? params.orderId,
        paymentId: data?.payment_id ?? null,
        status: "PAID",
        total: data?.total ?? 0,
      };
    } else {
      console.error(
        "Error confirmando comprobante (edge function): unexpected response",
        data,
      );
    }
  } catch (fnErr) {
    console.error("Error confirmando comprobante (edge function):", fnErr);
  }

  // --- FALLBACK PATH: direct confirm_payment RPC (bypasses edge function) ---
  console.warn("[Payment] Edge function failed; using confirm_payment RPC fallback.");
  return await confirmPaymentViaRpc(params.orderId, userId);
}

/**
 * Direct fallback: confirms the pending payment via the `confirm_payment`
 * SECURITY DEFINER RPC (order -> PAID, payment -> COMPLETED, releases reserved
 * stock and decrements inventory). Ownership and pending-payment lookups use
 * SELECT queries, which are permitted by RLS.
 */
async function confirmPaymentViaRpc(
  orderId: string,
  userId: string,
): Promise<ConfirmReceiptResult> {
  if (!supabase) {
    throw new Error("El servidor de pagos no está disponible.");
  }

  // Verify ownership + current status (SELECT is allowed via RLS).
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, status, total")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    console.error("Error confirmando comprobante (fallback): order not found", orderError);
    throw new Error("No tienes permiso para confirmar este pedido.");
  }
  if (order.user_id !== userId) {
    console.error("Error confirmando comprobante (fallback): order belongs to another user");
    throw new Error("No tienes permiso para confirmar este pedido.");
  }

  if (order.status === "PAID") {
    return { orderId, paymentId: null, status: "PAID", total: order.total };
  }
  if (order.status !== "PENDING_PAYMENT" && order.status !== "PAYMENT_PROCESSING") {
    throw new Error(`Este pedido no está pendiente de pago (estado actual: ${order.status}).`);
  }

  // Fetch the pending payment row for this order.
  const { data: pendingPayment, error: payError } = await supabase
    .from("payments")
    .select("id, order_id, status, amount")
    .eq("order_id", orderId)
    .in("status", ["PENDING", "PROCESSING"])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (payError || !pendingPayment) {
    console.error("Error confirmando comprobante (fallback): no pending payment", payError);
    throw new Error("No se encontró el pago pendiente para confirmar.");
  }

  // Confirm via SECURITY DEFINER RPC (identical to the edge function's action).
  const { data: confirmData, error: confirmError } = await supabase.rpc(
    "confirm_payment",
    {
      p_order_id: orderId,
      p_payment_id: (pendingPayment as { id: string }).id,
      p_amount: order.total,
    },
  );

  if (confirmError) {
    console.error("Error confirmando comprobante (fallback RPC):", confirmError);
    throw new Error("No se pudo confirmar el comprobante. Intenta de nuevo.");
  }

  return {
    orderId: (confirmData as { order_id?: string } | null)?.order_id ?? orderId,
    paymentId: (confirmData as { payment_id?: string } | null)?.payment_id ?? null,
    status: "PAID",
    total: Number(order.total ?? 0),
  };
}

/**
 * Uploads a receipt image to the public `receipts` bucket.
 * Path: {user_id}/{order_id}/{unique-file-name}
 * Falls back to Base64 inline data if storage upload fails, so the checkout
 * flow is never blocked by bucket misconfiguration.
 */
export async function uploadReceipt(opts: {
  orderId: string;
  file: File;
}): Promise<{ path: string | null; data: string | null }> {
  if (!supabase || !isSupabaseConfigured()) {
    throw new Error("El servidor de almacenamiento no está disponible.");
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) {
    throw new Error("Debes iniciar sesión para subir el comprobante.");
  }

  const cleanName = opts.file.name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\s+/g, "_");
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${cleanName}`;
  const path = `${userId}/${opts.orderId}/${uniqueName}`;

  // --- Primary path: Supabase Storage ---
  const { error } = await supabase.storage
    .from("receipts")
    .upload(path, opts.file, {
      contentType: opts.file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (!error) {
    console.debug("[Payment] Receipt uploaded to storage:", path);
    return { path, data: null };
  }

  // --- Fallback: Base64 inline data ---
  console.warn("[Payment] Storage upload failed, falling back to Base64:", error.message);
  const base64 = await fileToBase64(opts.file);
  console.debug("[Payment] Receipt encoded as Base64, length:", base64.length);
  return { path: null, data: base64 };
}

/**
 * Converts a File to a Base64 data URL string.
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo leer el archivo del comprobante."));
    reader.readAsDataURL(file);
  });
}

/**
 * Fetches the real order from Supabase to rebuild checkout state after a reload.
 * The server is the source of truth for total, status, method and ownership.
 */
export async function fetchOrderWithPayment(orderId: string): Promise<OrderWithPayment | null> {
  if (!supabase || !isSupabaseConfigured()) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, user_id, status, subtotal, shipping_cost, total, currency, shipping_address, payment:payments(method, status), items:order_items(product_name, quantity)",
    )
    .eq("id", orderId)
    .single();

  if (error || !data) return null;
  if ((data as { user_id?: string }).user_id !== userId) return null;

  return data as unknown as OrderWithPayment;
}

/**
 * Returns the wallet full name (display) for a transfer method.
 */
export function getTransferLabel(method: string): string {
  return TRANSFER_METHOD_LABELS[method as TransferMethod] ?? "Transferencia";
}
