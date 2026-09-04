# Pagos — Transferencia Directa Manual (Nequi / Daviplata)

MIYUKI acepta **pago por transferencia directa** iniciada manualmente por el cliente desde
**Nequi** o **Daviplata**. No hay pasarela de pagos externa (Wompi, PayU, ePayco, MercadoPago,
PSE, Bre-B). El cliente realiza la transferencia manualmente, sube un comprobante y el sistema
lo valida y confirma la orden.

## Flujo de compra

```
CARRO
  → /checkout (datos de envío + selección de método)
  → Crear orden PENDING_PAYMENT (server-side, create-order)
  → Crear payment PENDING asociado (método = NEQUI | DAVIPLATA)
  → /checkout/procesando
  → Abrir Nequi/Daviplata en NUEVA pestaña (la tienda permanece abierta)
  → Transferencia manual
  → Volver a la pestaña de Miyuki
  → Subir comprobante (PNG/JPG/WebP, máx. 8 MB)
  → Subir archivo real a Storage privado (payment-receipts)
  → confirm-receipt Edge Function (revalida todo server-side)
  → confirm_payment RPC (transaccional: payment=COMPLETED, order=PAID, inventario, auditoría)
  → WhatsApp administradora
  → /checkout/confirmacion
  → /pedidos
```

## Métodos de pago

| Método | Código en `payments.method` | SEO/UI |
|--------|-----------------------------|--------|
| Nequi | `NEQUI` | "Nequi" |
| Daviplata | `DAVIPLATA` | "Daviplata" |

Nequi y Daviplata se tratan como **transferencias manuales iniciadas por el cliente**, no como
una integración API bancaria. No se implementa ni simula una API bancaria inexistente. La
plataforma oficial simplemente se abre en una nueva pestaña.

## Regla: no confiar en el monto del frontend

El monto oficial SIEMPRE se obtiene de `orders.total` en Supabase. El frontend muestra el total
solo con fines informativos. Nunca se decide el monto pagado a partir de URL, `localStorage`,
React state o query params.

## Storage de comprobantes

- Bucket privado: `payment-receipts`
- Ruta: `payment-receipts/{user_id}/{order_id}/{unique-file-name}`
- Solo imágenes: PNG, JPG/JPEG, WebP
- Tamaño máximo: 8 MB
- **Nunca es público.** El bucket es privado y el acceso se realiza mediante URLs firmadas.
- RLS: el propietario (dueño de la orden) puede subir/leer sus propios comprobantes; la
  administradora puede leer todos. El cliente A no puede ver el comprobante del cliente B.
- El archivo real se sube desde el frontend; la Edge Function `confirm-receipt` vuelve a
  validar el path (debe pertenecer al usuario y a la orden) antes de confirmar.

### Seguridad

- Nunca se expone la `SUPABASE_SERVICE_ROLE_KEY` al frontend.
- No se usan secretos en variables `VITE_*`.
- Las credenciales privadas solo existen en las Edge Functions (Deno.env).

## Creación de orden (Edge Function `create-order`)

El backend (con la RPC `create_order`):
1. Autentica al usuario.
2. Valida productos y cantidades.
3. Consulta precios reales (server-side).
4. Calcula subtotal, IVA 19% y envío.
5. Reserva inventario (`reserved += quantity`).
6. Crea la orden en `PENDING_PAYMENT`.
7. Crea el payment en `PENDING` con método `NEQUI` o `DAVIPLATA`.
8. Devuelve `order_id`, `payment_id`, `status`, `total`, `currency`.

Petición del frontend:

```json
{
  "items": [{ "product_id": "...", "quantity": 1 }],
  "address_snapshot": { ... },
  "payment_method": "NEQUI",
  "idempotency_key": "..."
}
```

o `"payment_method": "DAVIPLATA"`.

## Confirmación (Edge Function `confirm-receipt`)

La función:
1. Autentica al usuario.
2. Valida JSON y `order_id` (UUID).
3. Consulta la orden y comprueba que pertenece al usuario.
4. Consulta el payment y comprueba que está pendiente y que el método coincide.
5. Valida el `storage_path` del comprobante (pertenece al usuario/orden).
6. Registra el comprobante en el payment (metadata + `receipt_path`).
7. Ejecuta `confirm_payment` RPC (transaccional).
8. Registra auditoría (`PAYMENT_RECEIPT_SUBMITTED`).
9. Responde con datos oficiales.

**Nunca acepta un `total` del navegador como autoridad.** Usa `orders.total`.

## `confirm_payment` RPC (transaccional / atómico)

En una sola operación:
- `payments.status = COMPLETED`
- `orders.status = PAID`
- `inventory.stock -= quantity` y `inventory.reserved -= quantity` (una sola vez)
- Auditoría `PAYMENT_CONFIRMED`

Nunca ocurre "order PAID sin comprobante" ni "inventario descontado sin order PAID".

### Inventario

- Al crear la orden: `reserved += quantity`. El **stock no se descuenta**.
- Al confirmar el pago: `stock -= quantity` y `reserved -= quantity`.
- No se descuenta stock al crear la orden ni dos veces al confirmar.

## Idempotencia

El flujo es idempotente:

- Crear dos órdenes con la misma `idempotency_key` devuelve la orden existente.
- Si el usuario pulsa "Finalizar compra" dos veces, `confirm-receipt` detecta que la orden ya
  está `PAID` y responde de forma idempotente sin descontar inventario ni duplicar auditorías
  críticas.
- No se crean dos órdenes, dos pagos, ni se fractura la orden.

## Qué NO hace el frontend

- El frontend **nunca** marca una orden como `PAID` directamente.
- La única confirmación persistente ocurre en Supabase (RPC + Edge Function).
- El frontend solo recibe la respuesta del backend.
- El carrito se limpia únicamente después de una confirmación exitosa.

## Historial `/pedidos`

Después de finalizar, `/pedidos` muestra la orden con estado `PAID`, fecha, total, método de
pago y productos. El detalle (`/pedidos/:id`) permite ver que el pago fue Nequi o Daviplata y
visualizar el comprobante mediante una URL firmada (no pública).

## WhatsApp de la administradora

Al finalizar la confirmación en Supabase, se genera el enlace con `buildWhatsAppLink()`:

```
Nuevo pedido pagado

Pedido: #XXXXXXXX
Cliente: <nombre>
Método: Nequi / Daviplata
Valor pagado: $XXX.XXX
Estado: PAGADO
```

- Se usa `VITE_WHATSAPP_NUMBER` para el número público de destino.
- El enlace se abre **después** de la confirmación exitosa, nunca antes.
- Si `confirm-receipt` falla, no se notifica por WhatsApp.

## Estados de UI

```
idle | loading_order | opening_wallet | waiting_receipt |
uploading_receipt | validating_receipt | confirming_payment | success | error
```

Mientras se confirma, el botón "Finalizar compra" queda deshabilitado y no hay submits dobles.

## Validación del comprobante (simulada)

> **IMPORTANTE:** La validación de monto del comprobante actualmente es **SIMULADA** (siempre
> devuelve `VALID` para archivos bien formados). **NO** es una validación bancaria ni OCR real.
> La autoridad real de confirmación es `orders.total` (sin confiar en el monto del cliente) y la
> lógica transaccional de `confirm_payment`.

La función `validateReceiptAmount()` está preparada para sustituirse por OCR real sin rediseñar
el checkout. Nunca se usa un valor no confiable del cliente para marcar la orden como pagada.

La interfaz indica internamente que la validación es simulada.

## Configuración (`.env`)

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_WHATSAPP_NUMBER=
VITE_BASE_URL=
```

No se agregan secretos al frontend. `SUPABASE_SERVICE_ROLE_KEY` (sin prefijo `VITE_`) solo
vive en las Edge Functions.

## URLs de Nequi y Daviplata

Centralizadas en `src/lib/constants.ts`:

- Nequi: `https://www.nequi.com.co/`
- Daviplata: `https://www.daviplata.com/personas/pasar-plata`

Son las públicas de cada plataforma. Se abren en una nueva pestaña con `window.open(..., "noopener,noreferrer")`
sin abandonar la tienda. No son integraciones API bancarias.
