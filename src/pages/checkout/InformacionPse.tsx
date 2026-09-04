import { Navigate } from "react-router-dom";

// InformacionPse is kept for route compatibility only. PSE is no longer part
// of the checkout. This component now redirects to the new /checkout/pago flow.

export default function InformacionPse() {
  return <Navigate to="/checkout/pago" replace />;
}
