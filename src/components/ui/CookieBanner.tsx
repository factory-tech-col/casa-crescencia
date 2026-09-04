import { useState, useEffect } from "react";

const STORAGE_KEY = "hasAcceptedCookies";

function hasAccepted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasAccepted()) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* storage unavailable */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white shadow-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 leading-relaxed">
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia de navegación,
              analizar el tráfico del sitio y personalizar el contenido.{" "}
              <a
                href="/privacidad"
                className="text-oro-700 hover:underline font-medium"
              >
                Ver nuestra política de privacidad
              </a>
              .
            </p>
          </div>
          <button
            onClick={accept}
            className="shrink-0 bg-oro-600 hover:bg-oro-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
