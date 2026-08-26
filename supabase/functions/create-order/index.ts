import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface OrderItem {
  product_id: string;
  quantity: number;
}

interface AddressSnapshot {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  department: string;
  postal_code?: string | null;
  instructions?: string | null;
}

interface CreateOrderBody {
  items: OrderItem[];
  address_snapshot: AddressSnapshot;
  idempotency_key?: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isValidUUID(v: string): boolean {
  return UUID_RE.test(v);
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
      console.error("create-order: missing required environment variables");
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
      console.error("create-order: auth error", authError);
      return jsonResponse(401, { error: "Invalid or expired token" });
    }

    // --- Parse & validate body ---
    let body: CreateOrderBody;
    try {
      body = await req.json();
    } catch {
      return jsonResponse(400, { error: "Invalid JSON body" });
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return jsonResponse(400, { error: "Order must contain at least one item" });
    }

    if (body.items.length > 20) {
      return jsonResponse(400, { error: "Order cannot contain more than 20 items" });
    }

    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i];
      if (!item.product_id || !isValidUUID(item.product_id)) {
        return jsonResponse(400, {
          error: `Item at index ${i} has an invalid product_id`,
        });
      }
      if (
        typeof item.quantity !== "number" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 10
      ) {
        return jsonResponse(400, {
          error: `Item at index ${i} has an invalid quantity (must be 1-10)`,
        });
      }
    }

    if (!body.address_snapshot) {
      return jsonResponse(400, { error: "address_snapshot is required" });
    }

    const addr = body.address_snapshot;
    if (
      !addr.full_name ||
      !addr.phone ||
      !addr.address_line1 ||
      !addr.city ||
      !addr.department
    ) {
      return jsonResponse(400, {
        error:
          "address_snapshot must include full_name, phone, address_line1, city, and department",
      });
    }

    // --- Create order via RPC ---
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: order, error: orderError } = await supabase.rpc(
      "create_order",
      {
        p_user_id: user.id,
        p_items: body.items,
        p_address_snapshot: body.address_snapshot,
        p_idempotency_key: body.idempotency_key ?? null,
      },
    );

    if (orderError) {
      console.error("create-order: RPC error", orderError);
      return jsonResponse(400, { error: orderError.message });
    }

    return jsonResponse(201, { order });
  } catch (err) {
    console.error("create-order: unexpected error", err);
    return jsonResponse(500, { error: "Internal server error" });
  }
});
