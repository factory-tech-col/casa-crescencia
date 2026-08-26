# Payment Integration

## Architecture

Payments use a provider pattern. The active provider is selected by `VITE_PAYMENT_MODE`:

```
VITE_PAYMENT_MODE=mock       → MockPaymentProvider (development)
VITE_PAYMENT_MODE=production → Production provider (requires external setup)
```

All payment providers implement a common interface:

```typescript
interface PaymentProvider {
  initiatePayment(orderId: string, amount: number, method: PaymentMethod): Promise<PaymentResult>;
  verifyPayment(paymentId: string): Promise<PaymentStatus>;
  handleWebhook(payload: unknown, signature: string): Promise<WebhookResult>;
}
```

### Payment Flow

```
1. Customer completes checkout
2. Frontend calls create-order Edge Function
   → Creates order + order_items via create_order RPC
   → Reserves stock in inventory
   → Returns order_id
3. Frontend calls process-payment Edge Function
   → Validates order is PENDING_PAYMENT
   → Processes payment via selected provider
   → Records payment in payments table
4. Webhook handler receives provider callback
   → Validates signature (placeholder)
   → Stores event in payment_events
   → Calls confirm_payment RPC
   → Decrements stock and releases reserved
```

## MockPaymentProvider

Used in development and testing. Simulates the full payment lifecycle:

1. Creates a payment record with status `PENDING`.
2. Immediately transitions to `COMPLETED` (no delay in current implementation).
3. Calls `confirm_payment` RPC to update order status and decrement stock.
4. Webhook handler always returns success.

**No real money is involved.** Safe for all development and CI environments.

### Configuration

```env
VITE_PAYMENT_MODE=mock
```

No additional environment variables needed.

## PSE Integration

PSE (Pago Seguro Electrónico) is Colombia's interbank transfer system.

### Requirements

- A registered Colombian company (NIT).
- A contract with an authorized payment processor (e.g., PayU, ePayco, MercadoPago).
- The processor provides API credentials and webhook endpoints.
- A custom domain with SSL certificate (required by payment processors).

### Current Status

**NOT IMPLEMENTED.** The Edge Function returns `501 Not Implemented`. Requires:
- A registered payment processor account.
- Custom domain with SSL.
- Webhook endpoint accessible from the internet (requires Supabase Edge Function deployment).

## Nequi Integration

Nequi is a mobile payment platform widely used in Colombia.

### Requirements

- Nequi Business account.
- API access (requires application to Nequi developer program).
- Nequi provides REST API for payment requests and QR codes.

### Current Status

**NOT IMPLEMENTED.** The Edge Function returns `501 Not Implemented`. Requires Nequi API access approval.

## Bre-B / Bank Transfer (PSE/Bre-B)

Bre-B (Banco de la República) bank transfer — a manual verification flow.

### How It Works

1. Customer selects "Bank Transfer" at checkout.
2. Application displays bank account details and a unique reference code.
3. Customer makes a bank transfer manually.
4. Admin verifies the transfer via the admin panel and marks the order as paid.

### Current Status

**NOT IMPLEMENTED.** The Edge Function returns `501 Not Implemented`. Requires:
- Admin UI to upload payment proof and confirm.
- Order status transition from `PENDING_PAYMENT` → `PAID` via admin action.

## Bank Transfer (BANK_TRANSFER)

Admin-configurable payment info with manual verification.

### How It Works

1. Customer selects "Bank Transfer" at checkout.
2. Application displays configurable bank account details.
3. Customer makes a bank transfer manually.
4. Admin verifies the transfer via the admin panel.

### Current Status

**NOT IMPLEMENTED.** Requires admin UI for bank info configuration and manual verification.

## Payment Configuration Summary

| Method | Mode | Status | Requires |
|--------|------|--------|----------|
| Mock | Development | Working | Nothing |
| PSE | Production | Not implemented | Payment processor, custom domain, SSL |
| Nequi | Production | Not implemented | Nequi Business API access |
| Bre-B | Production | Not implemented | Manual admin verification flow |
| Bank Transfer | Production | Not implemented | Admin UI for bank info config |

## Environment Variables

| Variable | Used By | Required |
|----------|---------|----------|
| `VITE_PAYMENT_MODE` | All | No (defaults to `mock`) |

**Important:** `VITE_` variables are embedded in the browser bundle. Do not store sensitive payment credentials (API keys, secrets) in `VITE_` variables. Use Supabase Edge Function environment variables for server-side secrets.

## Testing Payments

### Development (Mock Mode)

1. Set `VITE_PAYMENT_MODE=mock` in `.env`.
2. Go through checkout flow.
3. Mock provider will simulate successful payment automatically.
4. Verify order status transitions: `PENDING_PAYMENT` → `PAYMENT_PROCESSING` → `PAID`.

### Integration Testing

For testing with real payment providers in sandbox:

1. Obtain sandbox credentials from the payment processor.
2. Set `VITE_PAYMENT_MODE=production` and provider-specific sandbox URLs.
3. Use test card numbers / test accounts provided by the processor.
4. Verify webhook delivery and order status updates.

## Idempotency Guarantees

- Orders have an `idempotency_key` field (unique constraint in database).
- Creating a duplicate order with the same key returns the existing order.
- Payment webhooks are stored in `payment_events` with `processed` flag to prevent double-processing.

## IMPORTANT: Payment Status Rules

**Never mark an order as `PAID` based on client-side confirmation alone.**

The flow must be:

1. Payment provider confirms via webhook (server-side).
2. Webhook handler verifies the signature.
3. `payment_events` table is checked for duplicates.
4. Order status is updated to `PAID`.
5. Stock is decremented.

If a payment provider is not available, use mock mode or manual bank transfer verification via the admin panel.

## Production Requirements

Before accepting real payments:

1. **Custom domain** with valid SSL certificate (payment processor requirement).
2. **Supabase production project** (not free tier — needs reliable Edge Functions).
3. **Payment processor account** with live (not sandbox) credentials.
4. **Webhook endpoint** accessible from the internet.
5. **Business registration** (RUT, Cámara de Comercio) for Colombian payment processors.
6. **Privacy policy** and **terms of service** (already present in the app).
