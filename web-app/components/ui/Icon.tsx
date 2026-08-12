import { cn } from "@/lib/utils";

/**
 * Wrapper de Material Symbols Outlined — misma familia que usa el
 * gob.cl UI Kit en el design system Edubig.
 *
 * `nombre` es el identificador Material (ej. "shield", "monetization_on",
 * "arrow_drop_down"). Ver catálogo: https://fonts.google.com/icons
 *
 * Prop `filled` activa la versión rellena (FILL=1). Útil para íconos
 * seleccionados o énfasis.
 */
export function Icon({
  nombre,
  size = 20,
  filled = false,
  className,
}: {
  nombre: string;
  size?: number;
  filled?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("material-symbols-outlined shrink-0", className)}
      style={{
        fontSize: size,
        width: size,
        height: size,
        fontVariationSettings: filled
          ? `"FILL" 1, "wght" 400, "GRAD" 0, "opsz" ${size}`
          : `"FILL" 0, "wght" 400, "GRAD" 0, "opsz" ${size}`,
      }}
      aria-hidden
    >
      {nombre}
    </span>
  );
}
