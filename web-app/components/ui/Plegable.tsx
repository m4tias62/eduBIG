"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

/**
 * Encabezado plegable (v3, 2026-11-09). Unifica los módulos de la ficha, los
 * grupos de Comparar y la «Tabla de datos». Anotación de Matías («Unificar
 * dropdowns»): «mantener forma de los de la ficha pero con los estados
 * aplicados» de Comparar.
 *
 * Forma (de la ficha): tarjeta de ancho completo con ícono, título,
 * conclusión opcional y una flecha a la derecha que apunta hacia la derecha
 * plegada y hacia abajo desplegada.
 *
 * Estados (los del botón de un desplegable, SelectorFiltro):
 * - Plegado: blanco, borde de 2 px en rdbu-02, flecha rdbu-01, conclusión
 *   gris. Hover rdbu-05; presionado rdbu-04.
 * - Desplegado: rdbu-10 con texto rdbu-06 (6,44:1), también la conclusión.
 *   Hover rdbu-07 con texto rdbu-11 (10,11:1); presionado rdbu-10.
 * - Foco: contorno de 2 px en rdbu-10 a 2 px.
 *
 * Accesibilidad (patrón de acordeón de la WAI-ARIA APG): el botón va dentro
 * del encabezado, con aria-expanded y aria-controls. Antes, en la ficha, el
 * encabezado iba dentro del botón, algo que el HTML no permite.
 */
export const PLEGABLE_BASE =
  "flex w-full items-start gap-m rounded-s border-2 px-l py-m text-left transition-colors active:!filter-none " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rdbu-10";
export const PLEGABLE_CERRADO = "border-rdbu-02 bg-superficie-base text-texto-primario hover:bg-rdbu-05 active:bg-rdbu-04";
export const PLEGABLE_ABIERTO =
  "border-rdbu-11 bg-rdbu-10 text-rdbu-06 hover:bg-rdbu-07 hover:text-rdbu-11 active:bg-rdbu-10 active:text-rdbu-06";

/** Contenido del encabezado; también lo usa el <summary> de la tabla de datos. */
export function ContenidoPlegable({
  icono,
  titulo,
  conclusion,
  abierto,
}: {
  icono: string;
  titulo: ReactNode;
  conclusion?: ReactNode;
  /** `undefined`: lo decide el <details> que lo contiene (group-open). */
  abierto?: boolean;
}) {
  const porDetalles = abierto === undefined;
  return (
    <>
      <Icon nombre={icono} size={24} className="flex-none" />
      <span className="flex min-w-0 flex-1 flex-col gap-xxs">
        <span className="font-heading text-sm font-bold leading-[24px]">{titulo}</span>
        {conclusion && (
          <span className={cn("font-body text-xs", !abierto && !porDetalles && "text-texto-secundario", porDetalles && "text-texto-secundario group-open:text-inherit")}>
            {conclusion}
          </span>
        )}
      </span>
      <Icon
        nombre="arrow_drop_down"
        size={24}
        className={cn(
          "flex-none transition-transform",
          porDetalles
            ? "-rotate-90 text-rdbu-01 group-open:rotate-0 group-open:text-inherit"
            : abierto
              ? "rotate-0"
              : "-rotate-90 text-rdbu-01"
        )}
      />
    </>
  );
}

export function EncabezadoPlegable({
  nivel = "h2",
  icono,
  titulo,
  conclusion,
  abierto,
  onAlternar,
  idControl,
  className,
}: {
  nivel?: "h2" | "h3";
  icono: string;
  titulo: ReactNode;
  conclusion?: ReactNode;
  abierto: boolean;
  onAlternar: () => void;
  idControl?: string;
  className?: string;
}) {
  const H = nivel;
  return (
    <H className={className}>
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls={idControl}
        onClick={onAlternar}
        className={cn(PLEGABLE_BASE, abierto ? PLEGABLE_ABIERTO : PLEGABLE_CERRADO)}
      >
        <ContenidoPlegable icono={icono} titulo={titulo} conclusion={conclusion} abierto={abierto} />
      </button>
    </H>
  );
}
