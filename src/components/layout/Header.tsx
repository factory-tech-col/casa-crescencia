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
    `text-xs font-medium uppercase tracking-[0.2em] transition-colors ${
      isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
    }`;

  const itemCount = getItemCount();

  return (
    <header
      className={`sticky top-0 z-50 bg-crema transition-all duration-300 ${
        scrolled ? "border-b border-stone-100 shadow-sm" : "border-b border-stone-50"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[100px] py-3 items-center justify-between">
          <Link to={ROUTES.home.path} className="flex items-center ml-3">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Casa Crescencia"
              className="h-28 md:h-36 lg:h-44 w-auto object-contain transition-all duration-300"
            />
          </Link>

          <nav className="hidden md:flex md:items-center md:gap-10">
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

          <div className="flex items-center gap-5">
            <Link
              to={ROUTES.cart.path}
              className="relative text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Carrito de compras"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-8.136A1.125 1.125 0 0018.054 3H5.106m2.394 11.25l-1.5-6h13.5"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  <span className="max-w-[8rem] truncate">{profile?.full_name ?? "Mi cuenta"}</span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right bg-crema border border-stone-100 py-1 shadow-lg">
                      <Link
                        to={ROUTES.profile.path}
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-xs text-gray-600 hover:bg-stone-50 transition-colors"
                      >
                        {ROUTES.profile.label}
                      </Link>
                      <Link
                        to={ROUTES.orders.path}
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-xs text-gray-600 hover:bg-stone-50 transition-colors"
                      >
                        {ROUTES.orders.label}
                      </Link>
                      {(profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN") && (
                        <Link
                          to={ROUTES.admin.path}
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-xs text-gray-600 hover:bg-stone-50 transition-colors"
                        >
                          {ROUTES.admin.label}
                        </Link>
                      )}
                      <div className="my-1 border-t border-stone-100" />
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut();
                        }}
                        className="block w-full px-4 py-2.5 text-left text-xs text-gray-600 hover:bg-stone-50 transition-colors"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex md:items-center md:gap-5">
                <Link
                  to={ROUTES.login.path}
                  className="text-xs font-medium uppercase tracking-[0.15em] text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {ROUTES.login.label}
                </Link>
                <Link
                  to={ROUTES.register.path}
                  className="border border-gray-900 bg-gray-900 px-5 py-2 text-xs font-medium uppercase tracking-[0.15em] text-white hover:bg-gray-800 transition-colors"
                >
                  {ROUTES.register.label}
                </Link>
              </div>
            )}

            <button
              type="button"
              className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 md:hidden"
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
                  className="h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
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
        <div className="md:hidden border-t border-stone-100 bg-crema">
          <div className="space-y-0 px-4 pb-6 pt-2">
            <NavLink
              to={ROUTES.home.path}
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block py-3 text-xs font-medium uppercase tracking-[0.2em] border-b border-stone-50 ${
                  isActive ? "text-gray-900" : "text-gray-500"
                }`
              }
            >
              {ROUTES.home.label}
            </NavLink>
            <NavLink
              to={ROUTES.catalog.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block py-3 text-xs font-medium uppercase tracking-[0.2em] border-b border-stone-50 ${
                  isActive ? "text-gray-900" : "text-gray-500"
                }`
              }
            >
              {ROUTES.catalog.label}
            </NavLink>
            <NavLink
              to={ROUTES.contact.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block py-3 text-xs font-medium uppercase tracking-[0.2em] border-b border-stone-50 ${
                  isActive ? "text-gray-900" : "text-gray-500"
                }`
              }
            >
              {ROUTES.contact.label}
            </NavLink>

            <div className="pt-4 space-y-0">
              {user ? (
                <>
                  <Link
                    to={ROUTES.profile.path}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-xs font-medium uppercase tracking-[0.2em] text-gray-500 border-b border-stone-50"
                  >
                    {ROUTES.profile.label}
                  </Link>
                  <Link
                    to={ROUTES.orders.path}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-xs font-medium uppercase tracking-[0.2em] text-gray-500 border-b border-stone-50"
                  >
                    {ROUTES.orders.label}
                  </Link>
                  {(profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN") && (
                    <Link
                      to={ROUTES.admin.path}
                      onClick={() => setMobileOpen(false)}
                      className="block py-3 text-xs font-medium uppercase tracking-[0.2em] text-gray-500 border-b border-stone-50"
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
                    className="block w-full py-3 text-left text-xs font-medium uppercase tracking-[0.2em] text-gray-500"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 pt-2">
                  <Link
                    to={ROUTES.login.path}
                    onClick={() => setMobileOpen(false)}
                    className="py-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-gray-500"
                  >
                    {ROUTES.login.label}
                  </Link>
                  <Link
                    to={ROUTES.register.path}
                    onClick={() => setMobileOpen(false)}
                    className="border border-gray-900 bg-gray-900 py-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-white"
                  >
                    {ROUTES.register.label}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
