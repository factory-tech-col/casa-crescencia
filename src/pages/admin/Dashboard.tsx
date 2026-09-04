import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider";
import { useProducts } from "@/features/products/ProductsProvider";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Order } from "@/types";
import { formatPrice } from "@/utils/format";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
}

export function Dashboard() {
  const { profile } = useAuth();
  const { products } = useProducts();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: products.length,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!isSupabaseConfigured() || !supabase) {
        setStats({
          totalProducts: products.length,
          totalOrders: 0,
          totalRevenue: 0,
          totalUsers: 0,
        });
        setLoading(false);
        return;
      }

      try {
        const [ordersResult, usersResult] = await Promise.all([
          supabase.from("orders").select("total"),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
        ]);

        const orders = (ordersResult.data as Pick<Order, "total">[] | null) ?? [];
        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue,
          totalUsers: usersResult.count ?? 0,
        });
      } catch {
        setStats({
          totalProducts: products.length,
          totalOrders: 0,
          totalRevenue: 0,
          totalUsers: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [products.length]);

  const statCards = [
    {
      label: "Productos",
      value: stats.totalProducts,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      ),
      color: "bg-blue-50 text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Pedidos",
      value: stats.totalOrders,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
        </svg>
      ),
      color: "bg-amber-50 text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Ingresos",
      value: formatPrice(stats.totalRevenue),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      color: "bg-green-50 text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Usuarios",
      value: stats.totalUsers,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      ),
      color: "bg-purple-50 text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {profile?.full_name ?? "Admin"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenido al panel de administración de Casa Crescencia
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-28" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${card.bgColor}`}>
                  <span className={card.color}>{card.icon}</span>
                </div>
                <span className="text-sm font-medium text-gray-500">{card.label}</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900 truncate">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
          <div className="space-y-3">
            <NavLink
              to="/admin/productos"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-oro-300 hover:bg-oro-50/50 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-oro-50 group-hover:bg-oro-100 transition-colors">
                <svg className="w-5 h-5 text-oro-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Agregar producto</p>
                <p className="text-xs text-gray-500">Crear un nuevo producto en la tienda</p>
              </div>
            </NavLink>
            <NavLink
              to="/admin/pedidos"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-oro-300 hover:bg-oro-50/50 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Ver pedidos</p>
                <p className="text-xs text-gray-500">Gestionar pedidos pendientes y en proceso</p>
              </div>
            </NavLink>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad reciente</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p className="mt-3 text-sm text-gray-500">
                No hay actividad reciente para mostrar
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Las acciones en la tienda aparecerán aquí
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
