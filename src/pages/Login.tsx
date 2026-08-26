import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/features/auth/AuthProvider";
import { SEO } from "@/components/seo/SEO";
import { loginSchema, type LoginInput } from "@/utils/validation";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    setIsSubmitting(true);
    const result = await signIn(data.email, data.password);
    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <>
      <SEO title="Iniciar Sesión" description="Inicia sesión en tu cuenta de MIYUKI" />
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-display font-bold text-gray-900 text-center mb-8">
            Iniciar Sesión
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

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
                autoComplete="current-password"
                {...register("password")}
                className="input-field"
              />
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link to="/crear-cuenta" className="text-miyuki-600 hover:text-miyuki-700 font-medium">
              Crear cuenta
            </Link>
          </p>
          <p className="text-center mt-2 text-sm text-gray-600">
            <Link to="/olvide-contrasena" className="text-miyuki-600 hover:text-miyuki-700 font-medium">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
