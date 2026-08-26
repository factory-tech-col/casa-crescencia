import type { RouteConfig } from "@/types/routes";

export const ROUTES: Record<string, RouteConfig> = {
  home: { path: "/", label: "Inicio" },
  catalog: { path: "/productos", label: "Productos" },
  productDetail: { path: "/productos/:slug", label: "Producto" },
  cart: { path: "/carrito", label: "Carrito" },
  checkout: { path: "/checkout", label: "Checkout" },
  login: { path: "/iniciar-sesion", label: "Iniciar Sesión" },
  register: { path: "/crear-cuenta", label: "Crear Cuenta" },
  profile: { path: "/perfil", label: "Mi Perfil" },
  orders: { path: "/pedidos", label: "Mis Pedidos" },
  orderDetail: { path: "/pedidos/:id", label: "Detalle del Pedido" },
  contact: { path: "/contacto", label: "Contacto" },
  terms: { path: "/terminos", label: "Términos y Condiciones" },
  privacy: { path: "/privacidad", label: "Política de Privacidad" },
  shipping: { path: "/envios", label: "Política de Envíos" },
  returns: { path: "/cambios-devoluciones", label: "Cambios y Devoluciones" },
  admin: { path: "/admin", label: "Administración" },
  adminProducts: { path: "/admin/productos", label: "Productos" },
  adminOrders: { path: "/admin/pedidos", label: "Pedidos" },
  adminUsers: { path: "/admin/usuarios", label: "Usuarios" },
  adminCategories: { path: "/admin/categorias", label: "Categorías" },
  adminAudit: { path: "/admin/auditoria", label: "Auditoría" },
};

export function getRoutePath(key: string): string {
  return ROUTES[key]?.path || "/";
}
