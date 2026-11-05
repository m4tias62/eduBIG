"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

/**
 * Chip de filtro — patrón ÚNICO para activar o desactivar un filtro (D47).
 * v3: rediseño de Matías (Figma «Componentes creados → Filter buttons»,
 * nodo 833:9259). Es verdadero o falso: no despliega opciones.
 *
 * Estados:
 * - Inactivo: fondo blanco y borde rdbu-02; hover en rdbu-05.
 * - Activo: fondo rdbu-10, borde rdbu-11 y texto rdbu-06 (lo elegido «se
 *   calienta»); hover en rdbu-07 con texto rdbu-11.
 * - Presionado: vuelve al color de reposo de su estado.
 * - Foco: contorno de 2 px en rdbu-10, como los demás componentes v3.
 *
 * Contraste: texto rdbu-06 sobre rdbu-10, 6,5:1; borde rdbu-02 sobre blanco,
 * 5,9:1. 48 px de alto (objetivo táctil).
 */
export const CHIP_BASE =
  "inline-flex min-h-12 max-w-full items-center gap-xs rounded-s border-2 px-[18px] py-xs text-left text-xs sm:whitespace-nowrap shrink-0 transition-colors " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rdbu-10";

export const CHIP_INACTIVO =
  "border-rdbu-02 bg-superficie-base text-texto-primario hover:bg-rdbu-05 active:bg-superficie-base";

export const CHIP_ACTIVO =
  "border-rdbu-11 bg-rdbu-10 text-rdbu-06 hover:bg-rdbu-07 hover:text-rdbu-11 active:bg-rdbu-10 active:text-rdbu-06";

export function ChipFiltro({
  label,
  activo,
  onClick,
  icono,
  disabled,
  className,
}: {
  label: string;
  activo: boolean;
  onClick: () => void;
  /** Ícono Material Symbols (24 px), según el estándar del sitio. */
  icono?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      disabled={disabled}
      className={cn(CHIP_BASE, activo ? CHIP_ACTIVO : CHIP_INACTIVO, disabled && "cursor-wait opacity-70", className)}
    >
      {icono && <Icon nombre={icono} size={24} />}
      {label}
    </button>
  );
}
