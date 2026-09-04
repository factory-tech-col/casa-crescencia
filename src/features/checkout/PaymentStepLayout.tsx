import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import CheckoutSummaryPanel from "@/features/checkout/CheckoutSummaryPanel";

interface Props {
  title: string;
  subtitle?: string;
  step: number;
  children: ReactNode;
  actions?: ReactNode;
}

const STEPS = ["Carrito", "Checkout", "Pago", "Confirmación"];

export default function PaymentStepLayout({ title, subtitle, step, children, actions }: Props) {
  return (
    <div className="container-custom py-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/carrito" className="hover:text-oro-600">Carrito</Link>
        <span className="mx-2">/</span>
        <Link to="/checkout" className="hover:text-oro-600">Checkout</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{title}</span>
      </nav>

      <div className="mb-6 flex items-center gap-2 flex-wrap">
        {STEPS.map((label, i) => {
          const current = i === step;
          const done = i < step;
          return (
            <div key={label} className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  current
                    ? "bg-oro-600 text-white"
                    : done
                      ? "bg-oro-100 text-oro-700"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && <span className="text-gray-300">›</span>}
            </div>
          );
        })}
      </div>

      <h1 className="text-3xl font-display font-bold text-gray-900 mb-1">{title}</h1>
      {subtitle && <p className="text-gray-500 mb-8">{subtitle}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">{children}</div>
        <div className="lg:col-span-1">
          <CheckoutSummaryPanel />
          {actions && <div className="mt-4">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
