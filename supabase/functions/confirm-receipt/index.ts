// @ts-nocheck -- Supabase Edge Function runs in Deno; types are resolved at deploy time.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ALLOWED_RECEIPT_METHODS = ["NEQUI", "DAVIPLATA"];
const ALLOWED_RECEIPT_MIME = ["image/png", "image/jpeg", "image/webp"];
const MAX_RECEIPT_BYTES = 8 * 1024 * 1024;

interface ReceiptInfo {
  file_name?: string | null;
  mime?: string | null;
  size?: number | null;
  storage_path?: string | null;
}

interface ConfirmReceiptBody {
  order_id: string;
  payment_method?: string;
  receipt?: ReceiptInfo | null;
}

interface OrderRow {
  id: string;
  user_id: string;
  status: string;
  total: number;
}

interface PaymentRow {
  id: string;
  order_id: string;
  status: string;
  method: string;
  amount: number;
}

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function validateReceiptPath(path: string, userId: string, orderId: string): boolean {
  // Expected structure: {userId}/{orderId}/{unique-file-name}
  const parts = path.split("/");
  if (parts.length < 3) return false;
  return parts[0] === userId && parts[1] === orderId;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.error("confirm-receipt: missing required environment variables");
      return jsonResponse(500, { error: "Server misconfiguration" });
    }

    // --- Authenticate user ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return jsonResponse(401, { error: "Missing or malformed authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      console.error("confirm-receipt: auth error", authError);
      return jsonResponse(401, { error: "Invalid or expired token" });
    }

    // --- Parse & validate body ---
    let body: ConfirmReceiptBody;
    try {
      body = await req.json();
    } catch {
      return jsonResponse(400, { error: "Invalid JSON body" });
    }

    if (!body.order_id || !UUID_RE.test(body.order_id)) {
      return jsonResponse(400, { error: "order_id must be a valid UUID" });
    }

    // Validate payment method
    const paymentMethod = (body.payment_method || "NEQUI").toUpperCase();
    if (!ALLOWED_RECEIPT_METHODS.includes(paymentMethod)) {
      return jsonResponse(400, {
        error: "payment_method must be NEQUI or DAVIPLATA",
      });
    }

    // Validate receipt metadata (server-side re-validation of MIME and size)
    if (body.receipt?.mime && !ALLOWED_RECEIPT_MIME.includes(body.receipt.mime)) {
      return jsonResponse(400, {
        error: "Solo se permiten imágenes PNG, JPG o WEBP.",
      });
    }
    if (body.receipt?.size && body.receipt.size > MAX_RECEIPT_BYTES) {
      return jsonResponse(400, {
        error: "El comprobante no puede superar 8 MB.",
      });
    }

    // Validate receipt path (must belong to this user/order)
    if (body.receipt?.storage_path) {
      if (!validateReceiptPath(body.receipt.storage_path, user.id, body.order_id)) {
        return jsonResponse(403, {
          error: "Comprobante inválido: la ruta no pertenece a este pedido",
        });
      }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // --- Fetch order ---
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, status, total")
      .eq("id", body.order_id)
      .single();

    if (orderError || !order) {
      console.error("confirm-receipt: order not found", orderError);
      return jsonResponse(404, { error: "Order not found" });
    }

    const orderRow = order as OrderRow;

    // --- Ownership check ---
    if (orderRow.user_id !== user.id) {
      return jsonResponse(403, { error: "Order does not belong to this user" });
    }

    // --- Idempotency: if already PAID, record receipt metadata and return ok ---
    if (orderRow.status === "PAID") {
      if (body.receipt) {
        await supabase
          .from("payments")
          .update({
            receipt_path: body.receipt.storage_path ?? null,
            metadata: {
              payment_method: paymentMethod,
              receipt: body.receipt,
              confirmed_at: new Date().toISOString(),
            },
          })
          .eq("order_id", body.order_id)
          .eq("status", "COMPLETED");
      }
      return jsonResponse(200, {
        success: true,
        order_id: orderRow.id,
        status: "PAID",
        total: orderRow.total,
        message: "Order already confirmed",
      });
    }

    if (orderRow.status !== "PENDING_PAYMENT" && orderRow.status !== "PAYMENT_PROCESSING") {
      return jsonResponse(400, {
        error: `Order is not in a payable state (current: ${orderRow.status})`,
      });
    }

    // --- Fetch the payment record for this order (PENDING or PROCESSING) ---
    const { data: pendingPayment, error: fetchError } = await supabase
      .from("payments")
      .select("id, order_id, status, method, amount")
      .eq("order_id", body.order_id)
      .in("status", ["PENDING", "PROCESSING"])
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("confirm-receipt: error fetching payment", fetchError);
      return jsonResponse(500, { error: "Failed to fetch payment record" });
    }

    const paymentId: string | null = pendingPayment
      ? (pendingPayment as PaymentRow).id
      : null;

    // --- Check for an already-completed payment (idempotent) ---
    if (!paymentId) {
      const { data: completed } = await supabase
        .from("payments")
        .select("id, order_id, status, method, amount")
        .eq("order_id", body.order_id)
        .eq("status", "COMPLETED")
        .maybeSingle();

      if (completed) {
        if (body.receipt) {
          await supabase
            .from("payments")
            .update({
              receipt_path: body.receipt.storage_path ?? null,
              metadata: {
                payment_method: paymentMethod,
                receipt: body.receipt,
                confirmed_at: new Date().toISOString(),
              },
            })
            .eq("id", (completed as PaymentRow).id);
        }
        return jsonResponse(200, {
          success: true,
          order_id: orderRow.id,
          payment_id: (completed as PaymentRow).id,
          status: "PAID",
          total: orderRow.total,
          message: "Payment already completed",
        });
      }

      return jsonResponse(400, { error: "No pending payment found for this order" });
    }

    const paymentRow = pendingPayment as PaymentRow;

    // --- Method match: the stored payment method must match the confirmed method ---
    if (paymentRow.method !== paymentMethod) {
      return jsonResponse(400, {
        error: `Payment method mismatch: order expects ${paymentRow.method}, got ${paymentMethod}`,
      });
    }

    // --- Record the receipt metadata BEFORE confirming (avoids losing it) ---
    if (body.receipt) {
      await supabase
        .from("payments")
        .update({
          receipt_path: body.receipt.storage_path ?? null,
          metadata: {
            payment_method: paymentMethod,
            receipt: body.receipt,
            confirmed_at: new Date().toISOString(),
          },
        })
        .eq("id", paymentId);
    }

    // --- Confirm the payment: mark order PAID, decrement stock, release reserved.
    // The server-side order total is authoritative; we never trust the client. ---
    const { error: confirmError } = await supabase.rpc("confirm_payment", {
      p_order_id: body.order_id,
      p_payment_id: paymentId,
      p_amount: orderRow.total,
    });

    if (confirmError) {
      console.error("confirm-receipt: confirm_payment RPC error", confirmError);
      return jsonResponse(500, {
        error: "Failed to confirm payment. You can retry.",
      });
    }

    // --- Audit log ---
    await supabase.from("audit_log").insert({
      user_id: user.id,
      action: "PAYMENT_RECEIPT_SUBMITTED",
      entity_type: "order",
      entity_id: body.order_id,
      metadata: {
        total: orderRow.total,
        payment_id: paymentId,
        method: paymentMethod,
        ...(body.receipt ? { receipt: body.receipt } : {}),
      },
    });

    return jsonResponse(200, {
      success: true,
      order_id: body.order_id,
      payment_id: paymentId,
      status: "PAID",
      total: orderRow.total,
      method: paymentMethod,
    });
  } catch (err) {
    console.error("confirm-receipt: unexpected error", err);
    return jsonResponse(500, { error: "Internal server error" });
  }
});
