interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const sizeClasses: Record<string, string> = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

export function Loading({ size = "md", text }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className={`animate-spin rounded-full border-4 border-gray-200 border-t-miyuki-600 ${sizeClasses[size]}`}
        role="status"
        aria-label="Cargando"
      />
      {text && <p className="text-sm text-gray-500">{text}</p>}
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
