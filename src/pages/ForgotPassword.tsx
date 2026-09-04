import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/features/auth/AuthProvider";
import { SITE_NAME } from "@/lib/constants";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await resetPassword(email);
    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Recuperar contraseña | {SITE_NAME}</title>
      </Helmet>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-8 text-center">
            Recuperar contraseña
          </h1>

          {sent ? (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Correo enviado</h2>
              <p className="text-gray-600 mb-6">
                Si existe una cuenta con <strong>{email}</strong>, recibirás un enlace para restablecer tu contraseña.
                Revisa tu bandeja de entrada y carpeta de spam.
              </p>
              <Link to="/iniciar-sesion" className="btn-primary inline-block">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card p-8">
              <p className="text-gray-600 mb-6">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="email" className="label-field">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "Enviando..." : "Enviar enlace de recuperación"}
              </button>

              <p className="text-center mt-6 text-sm text-gray-600">
                <Link to="/iniciar-sesion" className="text-oro-600 hover:text-oro-700 font-medium">
                  Volver al inicio de sesión
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
