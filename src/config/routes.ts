import type { RouteConfig } from "@/types/routes";

export const ROUTES: Record<string, RouteConfig> = {
  home: { path: "/", label: "Inicio" },
  catalog: { path: "/productos", label: "Productos" },
  productDetail: { path: "/productos/:slug", label: "Producto" },
  cart: { path: "/carrito", label: "Carrito" },
  checkout: { path: "/checkout", label: "Checkout" },
  checkoutPago: { path: "/checkout/pago", label: "Confirmar pago" },
  checkoutPse: { path: "/checkout/informacion-pse", label: "Confirmar pago" },
  checkoutProcesando: { path: "/checkout/procesando", label: "Comprobante" },
  checkoutConfirmacion: { path: "/checkout/confirmacion", label: "Confirmación" },
  login: { path: "/iniciar-sesion", label: "Iniciar SesiÃ³n" },
  register: { path: "/crear-cuenta", label: "Crear Cuenta" },
  profile: { path: "/perfil", label: "Mi Perfil" },
  orders: { path: "/pedidos", label: "Mis Pedidos" },
  orderDetail: { path: "/pedidos/:id", label: "Detalle del Pedido" },
  contact: { path: "/contacto", label: "Contacto" },
  terms: { path: "/terminos", label: "TÃ©rminos y Condiciones" },
  privacy: { path: "/privacidad", label: "PolÃ­tica de Privacidad" },
  shipping: { path: "/envios", label: "PolÃ­tica de EnvÃ­os" },
  returns: { path: "/cambios-devoluciones", label: "Cambios y Devoluciones" },
  admin: { path: "/admin", label: "AdministraciÃ³n" },
  adminProducts: { path: "/admin/productos", label: "Productos" },
  adminOrders: { path: "/admin/pedidos", label: "Pedidos" },
  adminUsers: { path: "/admin/usuarios", label: "Usuarios" },
  adminCategories: { path: "/admin/categorias", label: "CategorÃ­as" },
  adminAudit: { path: "/admin/auditoria", label: "AuditorÃ­a" },
};

export function getRoutePath(key: string): string {
  return ROUTES[key]?.path || "/";
}
