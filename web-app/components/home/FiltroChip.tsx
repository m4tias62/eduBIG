import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * Chip de filtro. Dos comportamientos:
 *  - Toggle simple (sin dropdown): activo/inactivo, click cambia URL.
 *  - Dropdown (opcional): muestra chevron. La lógica del dropdown se
 *    implementa en un futuro iteración; hoy funciona como link a URL fija.
 *
 * Estado activo: fondo `superficie/inversa` + texto blanco (invierte
 * la superficie base). Inactivo: fondo blanco + borde definido.
 */
export function FiltroChip({
  label,
  href,
  activo,
  conChevron = false,
}: {
  label: string;
  href: string;
  activo: boolean;
  conChevron?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-xxs rounded-s px-m py-xs text-xs whitespace-nowrap border-2 transition-colors",
        activo
          ? "bg-superficie-inversa text-texto-sobre-oscuro border-superficie-inversa"
          : "bg-superficie-base text-texto-primario border-borde-definido hover:border-texto-primario"
      )}
    >
      {label}
      {conChevron && (
        <Icon
          nombre="arrow_drop_down"
          size={16}
          className={activo ? "text-texto-sobre-oscuro" : "text-texto-primario"}
        />
      )}
    </Link>
  );
}
