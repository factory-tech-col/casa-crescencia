import { useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { SEO } from "@/components/seo/SEO";

function ProfileContent() {
  const { user, profile, updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordError(null);
    setIsUpdating(true);
    const result = await updatePassword(newPassword);
    if (result.error) {
      setPasswordError(result.error);
    } else {
      setPasswordMsg("Contraseña actualizada correctamente");
      setNewPassword("");
    }
    setIsUpdating(false);
  };

  return (
    <div className="container-custom py-8 max-w-2xl">
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Mi Perfil</h1>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de la cuenta</h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm text-gray-500">Nombre</dt>
            <dd className="text-gray-900 font-medium">
              {profile?.full_name || "No especificado"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Correo electrónico</dt>
            <dd className="text-gray-900 font-medium">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Rol</dt>
            <dd className="text-gray-900 font-medium capitalize">
              {profile?.role?.toLowerCase() || "customer"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cambiar contraseña</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {passwordMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
              {passwordMsg}
            </div>
          )}
          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {passwordError}
            </div>
          )}
          <div>
            <label htmlFor="new-password" className="label-field">Nueva contraseña</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              minLength={8}
              required
            />
          </div>
          <button type="submit" disabled={isUpdating} className="btn-primary">
            {isUpdating ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <SEO title="Mi Perfil" description="Gestiona tu perfil en MIYUKI" />
      <ProfileContent />
    </ProtectedRoute>
  );
}
