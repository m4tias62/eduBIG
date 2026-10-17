"use client";

import { cn } from "@/lib/utils";

/**
 * Chip de filtro — patrón ÚNICO para elegir una opción que filtra o cambia lo
 * que se ve (filtros de Explorar, curso en Comparar). Borde frío; activo en
 * cálido acento con texto blanco (eje de temperatura: lo elegido "se calienta").
 * 44 px de alto (objetivo táctil).
 */
export function ChipFiltro({
  label,
  activo,
  onClick,
  className,
}: {
  label: string;
  activo: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={cn(
        "min-h-[44px] inline-flex items-center gap-xxs rounded-s px-m py-xs text-xs whitespace-nowrap shrink-0 border-2 transition-colors",
        activo
          ? "bg-temp-calido-acento text-texto-sobre-oscuro border-temp-calido-acento"
          : "bg-superficie-base text-texto-primario border-temp-frio-profundo hover:bg-temp-frio-suave",
        className
      )}
    >
      {label}
    </button>
  );
}
