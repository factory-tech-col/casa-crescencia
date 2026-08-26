import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider";
import { useCart } from "@/features/cart/CartProvider";
import { ROUTES } from "@/config/routes";

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { getItemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? "text-miyuki-600" : "text-gray-700 hover:text-miyuki-600"
    }`;

  const itemCount = getItemCount();

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            to={ROUTES.home.path}
            className="font-display text-2xl font-bold tracking-wide text-miyuki-600"
          >
            MIYUKI
          </Link>

          <nav className="hidden md:flex md:items-center md:gap-8">
            <NavLink to={ROUTES.home.path} className={navLinkClass} end>
              {ROUTES.home.label}
            </NavLink>
            <NavLink to={ROUTES.catalog.path} className={navLinkClass}>
              {ROUTES.catalog.label}
            </NavLink>
            <NavLink to={ROUTES.contact.path} className={navLinkClass}>
              {ROUTES.contact.label}
            </NavLink>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to={ROUTES.cart.path}
              className="relative text-gray-700 hover:text-miyuki-600 transition-colors"
              aria-label="Carrito de compras"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-8.136A1.125 1.125 0 0018.054 3H5.106m2.394 11.25l-1.5-6h13.5"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-miyuki-600 text-xs font-bold text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-miyuki-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  <span className="max-w-[8rem] truncate">
                    {profile?.full_name ?? "Mi cuenta"}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                      <Link
                        to={ROUTES.profile.path}
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {ROUTES.profile.label}
                      </Link>
                      <Link
                        to={ROUTES.orders.path}
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {ROUTES.orders.label}
                      </Link>
                      {(profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN") && (
                        <Link
                          to={ROUTES.admin.path}
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {ROUTES.admin.label}
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut();
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex md:items-center md:gap-4">
                <Link
                  to={ROUTES.login.path}
                  className="text-sm font-medium text-gray-700 hover:text-miyuki-600 transition-colors"
                >
                  {ROUTES.login.label}
                </Link>
                <Link
                  to={ROUTES.register.path}
                  className="rounded-md bg-miyuki-600 px-4 py-2 text-sm font-medium text-white hover:bg-miyuki-700 transition-colors"
                >
                  {ROUTES.register.label}
                </Link>
              </div>
            )}

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:text-miyuki-600 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="space-y-1 px-4 pb-4 pt-2">
            <NavLink
              to={ROUTES.home.path}
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-base font-medium ${
                  isActive
                    ? "bg-miyuki-50 text-miyuki-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              {ROUTES.home.label}
            </NavLink>
            <NavLink
              to={ROUTES.catalog.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-base font-medium ${
                  isActive
                    ? "bg-miyuki-50 text-miyuki-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              {ROUTES.catalog.label}
            </NavLink>
            <NavLink
              to={ROUTES.contact.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-base font-medium ${
                  isActive
                    ? "bg-miyuki-50 text-miyuki-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              {ROUTES.contact.label}
            </NavLink>

            <hr className="my-2" />

            {user ? (
              <>
                <Link
                  to={ROUTES.profile.path}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  {ROUTES.profile.label}
                </Link>
                <Link
                  to={ROUTES.orders.path}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  {ROUTES.orders.label}
                </Link>
                {(profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN") && (
                  <Link
                    to={ROUTES.admin.path}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {ROUTES.admin.label}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    signOut();
                  }}
                  className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to={ROUTES.login.path}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-center text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  {ROUTES.login.label}
                </Link>
                <Link
                  to={ROUTES.register.path}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md bg-miyuki-600 px-3 py-2 text-center text-base font-medium text-white hover:bg-miyuki-700"
                >
                  {ROUTES.register.label}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
