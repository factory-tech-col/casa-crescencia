import { Routes, Route } from "react-router-dom";
import { ProductsProvider } from "@/features/products/ProductsProvider";
import { Layout } from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import OrderHistory from "@/pages/OrderHistory";
import OrderDetail from "@/pages/OrderDetail";
import Contact from "@/pages/Contact";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Shipping from "@/pages/Shipping";
import Returns from "@/pages/Returns";
import NotFound from "@/pages/NotFound";
import ForgotPassword from "@/pages/ForgotPassword";
import OrderConfirmation from "@/pages/OrderConfirmation";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { Dashboard as AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminProducts } from "@/pages/admin/Products";
import { AdminOrders } from "@/pages/admin/Orders";
import { AdminUsers } from "@/pages/admin/Users";
import { AdminCategories } from "@/pages/admin/Categories";
import { AdminAudit } from "@/pages/admin/Audit";

export default function App() {
  return (
    <ProductsProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="productos" element={<Catalog />} />
          <Route path="productos/:slug" element={<ProductDetail />} />
          <Route path="carrito" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="iniciar-sesion" element={<Login />} />
          <Route path="crear-cuenta" element={<Register />} />
          <Route path="olvide-contrasena" element={<ForgotPassword />} />
          <Route path="pedido-confirmado" element={<OrderConfirmation />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="pedidos" element={<OrderHistory />} />
          <Route path="pedidos/:id" element={<OrderDetail />} />
          <Route path="contacto" element={<Contact />} />
          <Route path="terminos" element={<Terms />} />
          <Route path="privacidad" element={<Privacy />} />
          <Route path="envios" element={<Shipping />} />
          <Route path="cambios-devoluciones" element={<Returns />} />

          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="productos" element={<AdminProducts />} />
            <Route path="pedidos" element={<AdminOrders />} />
            <Route path="usuarios" element={<AdminUsers />} />
            <Route path="categorias" element={<AdminCategories />} />
            <Route path="auditoria" element={<AdminAudit />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ProductsProvider>
  );
}
