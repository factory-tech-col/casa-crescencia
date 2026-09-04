export type UserRole = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: "COP";
  is_active: boolean;
  category_id: string | null;
  order_index?: number | null;
  category?: Category;
  images?: ProductImage[];
  inventory?: Inventory;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  stock: number;
  reserved: number;
  updated_at: string;
}

export interface CartItemData {
  product_id: string;
  quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_PROCESSING"
  | "PAID"
  | "PAYMENT_FAILED"
  | "PAYMENT_EXPIRED"
  | "CANCELLED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "REFUNDED";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED"
  | "EXPIRED";

export type PaymentMethod =
  | "MOCK"
  | "PSE"
  | "NEQUI"
  | "DAVIPLATA"
  | "BRE_B"
  | "BANK_TRANSFER";

export type PersonType = "NATURAL" | "JURIDICA";

export interface PseInfo {
  person_type: PersonType;
  bank: string;
  document_type?: string;
  document_number?: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  iva: number;
  shipping_cost: number;
  total: number;
  currency: "COP";
  shipping_address: Address;
  notes: string | null;
  idempotency_key: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payment?: Payment;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image_url: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
  currency: "COP";
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: "COP";
  reference: string | null;
  provider_reference: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentEvent {
  id: string;
  payment_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  processed: boolean;
  created_at: string;
}

export interface Address {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  department: string;
  postal_code: string | null;
  instructions: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
