// @ts-nocheck -- Supabase Edge Function runs in Deno; types are resolved at deploy time.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VALID_PAYMENT_METHODS = ["MOCK", "PSE", "NEQUI", "BRE_B", "BANK_TRANSFER", "CREDIT_CARD", "PAYMENT_BUTTON"] as const;
type PaymentMethod = (typeof VALID_PAYMENT_METHODS)[number];

interface PaymentBody {
  order_id: string;
  payment_method: PaymentMethod;
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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    const paymentMode = Deno.env.get("PAYMENT_MODE") ?? "mock";

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.error("process-payment: missing required environment variables");
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
      console.error("process-payment: auth error", authError);
      return jsonResponse(401, { error: "Invalid or expired token" });
    }

    // --- Parse & validate body ---
    let body: PaymentBody;
    try {
      body = await req.json();
    } catch {
      return jsonResponse(400, { error: "Invalid JSON body" });
    }

    if (!body.order_id || !UUID_RE.test(body.order_id)) {
      return jsonResponse(400, { error: "order_id must be a valid UUID" });
    }

    if (!body.payment_method || !VALID_PAYMENT_METHODS.includes(body.payment_method)) {
      return jsonResponse(400, {
        error: `payment_method must be one of: ${VALID_PAYMENT_METHODS.join(", ")}`,
      });
    }

    // --- Fetch order ---
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, status, total")
      .eq("id", body.order_id)
      .single();

    if (orderError || !order) {
      console.error("process-payment: order not found", orderError);
      return jsonResponse(404, { error: "Order not found" });
    }

    const orderRow = order as OrderRow;

    if (orderRow.user_id !== user.id) {
      return jsonResponse(403, { error: "Order does not belong to this user" });
    }

    if (orderRow.status !== "PENDING_PAYMENT") {
      return jsonResponse(400, {
        error: `Order is not in PENDING_PAYMENT state (current: ${orderRow.status})`,
      });
    }

    // --- Idempotency: check for existing completed payment ---
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id, status, method")
      .eq("order_id", body.order_id)
      .eq("status", "COMPLETED")
      .maybeSingle();

    if (existingPayment) {
      const existing = existingPayment as PaymentRow;
      console.log("process-payment: idempotent — payment already completed", existing.id);
      return jsonResponse(200, {
        success: true,
        payment_id: existing.id,
        status: "COMPLETED",
        message: "Payment was already processed",
      });
    }

    // --- Fetch existing PENDING payment record (created by create_order) ---
    const { data: existingPayment, error: fetchPaymentError } = await supabase
      .from("payments")
      .select("id, status, method, reference")
      .eq("order_id", body.order_id)
      .eq("status", "PENDING")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (fetchPaymentError) {
      console.error("process-payment: error fetching pending payment", fetchPaymentError);
      return jsonResponse(500, { error: "Failed to fetch payment record" });
    }

    if (!existingPayment) {
      return jsonResponse(400, {
        error: "No pending payment found for this order. It may have already been processed.",
      });
    }

    const pendingPayment = existingPayment as PaymentRow;

    // --- Determine if this is a mock payment ---
    const isMock =
      paymentMode === "mock" || body.payment_method === "MOCK";

    if (!isMock) {
      // Real payment methods are not yet implemented
      return jsonResponse(501, {
        error: "Payment method not yet implemented",
      });
    }

    // Generate mock provider reference
    const providerReference = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    // --- Update existing payment to COMPLETED (no duplicate INSERT) ---
    const { data: payment, error: updateError } = await supabase
      .from("payments")
      .update({
        status: "COMPLETED",
        reference: providerReference,
        provider_reference: providerReference,
        metadata: { mode: "mock", amount: orderRow.total },
      })
      .eq("id", pendingPayment.id)
      .select("id, status, method, reference")
      .single();

    if (updateError) {
      console.error("process-payment: update error", updateError);
      return jsonResponse(500, { error: "Failed to update payment record" });
    }

    // --- Confirm order via RPC ---
    const { error: confirmError } = await supabase.rpc("confirm_payment", {
      p_order_id: body.order_id,
      p_provider_reference: providerReference,
      p_event_payload: {
        provider_reference: providerReference,
        method: body.payment_method,
        amount: orderRow.total,
        status: "COMPLETED",
      },
    });

    if (confirmError) {
      console.error("process-payment: confirm_payment RPC error", confirmError);
      return jsonResponse(500, {
        error: "Payment recorded but order confirmation failed",
      });
    }

    const paymentRecord = payment as PaymentRow & { reference: string | null };

    return jsonResponse(200, {
      success: true,
      payment_id: paymentRecord.id,
      provider_reference: paymentRecord.reference,
    });
  } catch (err) {
    console.error("process-payment: unexpected error", err);
    return jsonResponse(500, { error: "Internal server error" });
  }
});
