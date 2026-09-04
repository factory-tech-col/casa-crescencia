import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/features/auth/AuthProvider";
import { SEO } from "@/components/seo/SEO";
import { registerSchema, type RegisterInput } from "@/utils/validation";

export default function Register() {
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    const result = await signUp(data.email, data.password, data.full_name);
    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }
    setSuccess(true);
    setIsSubmitting(false);
  };

  return (
    <>
      <SEO title="Crear Cuenta" description="Crea tu cuenta en Casa Crescencia" />
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-display font-bold text-gray-900 text-center mb-8">
            Crear Cuenta
          </h1>

          {success ? (
            <div className="card p-8 text-center">
              <svg className="w-16 h-16 text-emerald-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Revisa tu correo para confirmar
              </h2>
              <p className="text-gray-500 mb-6">
                Te enviamos un enlace de confirmación a tu correo electrónico.
              </p>
              <Link to="/iniciar-sesion" className="btn-primary">
                Ir a iniciar sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="full_name" className="label-field">Nombre completo</label>
                <input
                  id="full_name"
                  type="text"
                  autoComplete="name"
                  {...register("full_name")}
                  className="input-field"
                />
                {errors.full_name && <p className="error-text">{errors.full_name.message}</p>}
              </div>

              <div>
                <label htmlFor="email" className="label-field">Correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className="input-field"
                />
                {errors.email && <p className="error-text">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="label-field">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                  className="input-field"
                />
                {errors.password && <p className="error-text">{errors.password.message}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label-field">Confirmar contraseña</label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  className="input-field"
                />
                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? "Creando cuenta..." : "Crear Cuenta"}
              </button>
            </form>
          )}

          {!success && (
            <p className="text-center mt-6 text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link to="/iniciar-sesion" className="text-oro-600 hover:text-oro-700 font-medium">
                Iniciar sesión
              </Link>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
