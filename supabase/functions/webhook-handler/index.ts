import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface WebhookPayload {
  id: string;
  type: string;
  data: Record<string, unknown>;
  created_at: string;
}

interface StoredEvent {
  id: string;
  event_type: string;
  processed: boolean;
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

function extractOrderId(
  data: Record<string, unknown>,
): string | null {
  const candidates = [
    "order_id",
    "orderId",
    "reference",
    "referenceCode",
    "invoice",
  ];

  for (const key of candidates) {
    const val = data[key];
    if (typeof val === "string" && val.length > 0) {
      return val;
    }
  }

  return null;
}

function validateWebhookSignature(
  _signature: string | null,
  _body: string,
): void {
  // TODO: Implement real webhook signature validation per provider.
  //
  // Each payment provider uses a different signing mechanism:
  //
  // - PayU: HMAC-SHA256 with merchant API key against the raw body.
  //   See: https://developers.payu.com/en/restapi.html#webhook-validation
  //
  // - ePayco: MD5 or SHA256 of concatenated secret + trxId + amount.
  //   See: https://docs.epayco.co/referencia-cobros/cobros
  //
  // - Placetopay: SHA256 signature computed over the request body using
  //   the integration secret.
  //   See: https://developers.placetopay.com/webcheckout
  //
  // Steps to implement:
  // 1. Read the webhook secret from env: Deno.env.get("WEBHOOK_SECRET_<PROVIDER>")
  // 2. Compute expected signature from raw body + secret
  // 3. Compare with the signature header using constant-time comparison
  // 4. Throw an error if signatures don't match
  //
  // Example (PayU):
  //   const cryptoKey = Deno.env.get("PAYU_WEBHOOK_SECRET")!;
  //   const expected = crypto.subtle.importKey(...);
  //   const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  //   const expectedHex = [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
  //   if (expectedHex !== signatureHeader) throw new Error("Invalid signature");

  console.log("webhook-handler: signature validation is a no-op (TODO)");
}

async function processEvent(
  supabase: ReturnType<typeof createClient>,
  event: WebhookPayload,
): Promise<string> {
  const eventType = event.type.toLowerCase();

  // payment.completed
  if (
    eventType === "payment.completed" ||
    eventType === "payment.success" ||
    eventType === "transaction.approved"
  ) {
    const orderId = extractOrderId(event.data);
    if (!orderId) return "no_order_id";

    const { error } = await supabase.rpc("confirm_payment", {
      p_order_id: orderId,
      p_provider_reference: String(event.id),
      p_event_payload: event.data,
    });

    if (error) {
      console.error("webhook-handler: confirm_payment RPC failed", error);
      return "confirm_failed";
    }
    return "confirmed";
  }

  // payment.failed
  if (
    eventType === "payment.failed" ||
    eventType === "payment.declined" ||
    eventType === "transaction.declined"
  ) {
    const orderId = extractOrderId(event.data);
    if (!orderId) return "no_order_id";

    const { error } = await supabase.rpc("handle_payment_failure", {
      p_order_id: orderId,
      p_event_payload: event.data,
    });

    if (error) {
      console.error("webhook-handler: handle_payment_failure RPC failed", error);
      return "failure_handle_failed";
    }
    return "failure_handled";
  }

  // payment.pending — log only
  if (
    eventType === "payment.pending" ||
    eventType === "transaction.pending"
  ) {
    return "pending_logged";
  }

  console.log(`webhook-handler: unhandled event type ${event.type}`);
  return "unhandled";
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Always return 200 to webhook providers to avoid retry storms
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("webhook-handler: missing required environment variables");
      return jsonResponse(500, { error: "Server misconfiguration" });
    }

    // Read raw body for signature validation
    const rawBody = await req.text();

    let body: WebhookPayload;
    try {
      body = JSON.parse(rawBody);
    } catch {
      console.error("webhook-handler: invalid JSON body");
      return jsonResponse(400, { error: "Invalid JSON" });
    }

    if (!body.id || !body.type) {
      console.error("webhook-handler: missing id or type field", { body });
      return jsonResponse(400, { error: "Missing id or type field" });
    }

    // Validate signature (placeholder — always passes)
    const signature = req.headers.get("x-webhook-signature");
    validateWebhookSignature(signature, rawBody);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Idempotency: check if event was already processed
    const { data: existingEvent } = await supabase
      .from("payment_events")
      .select("id, processed")
      .eq("event_id", body.id)
      .maybeSingle();

    if (existingEvent) {
      const existing = existingEvent as StoredEvent;
      if (existing.processed) {
        console.log(`webhook-handler: event ${body.id} already processed, skipping`);
        return jsonResponse(200, { received: true, message: "Event already processed" });
      }
    }

    // Store raw event for audit trail
    const { error: insertError } = await supabase.from("payment_events").insert({
      event_id: body.id,
      event_type: body.type,
      payload: body,
      processed: false,
    });

    if (insertError) {
      console.error("webhook-handler: failed to store event", insertError);
      // Still return 200 — we don't want provider retries on storage failures
      return jsonResponse(200, { received: true });
    }

    // Process the event
    const outcome = await processEvent(supabase, body);

    // Mark event as processed
    const { error: updateError } = await supabase
      .from("payment_events")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("event_id", body.id);

    if (updateError) {
      console.error("webhook-handler: failed to mark event as processed", updateError);
    }

    console.log(
      `webhook-handler: event ${body.id} type=${body.type} outcome=${outcome}`,
    );

    return jsonResponse(200, { received: true });
  } catch (err) {
    console.error("webhook-handler: unexpected error", err);
    // Always return 200 to avoid provider retry storms
    return jsonResponse(200, { received: true });
  }
});
