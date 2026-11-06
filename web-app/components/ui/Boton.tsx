import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

/**
 * Botones (v3, rediseño nov-2026). Un solo patrón para todo el sitio (D47),
 * con sus cuatro estados: reposo, hover, presionado (active) y foco.
 *
 * - `BotonEnlace`: navega a otra página (Next Link).
 * - `Boton`: ejecuta una acción en la misma página (<button>).
 *
 * Variantes:
 * - `primario` (Matías, 2026-11-05, Figma «Outline Square + arrow»,
 *   945:27175): reemplaza al botón azul redondeado anterior. Esquinas rectas,
 *   borde de 1 px en rdbu-01, 9 px de relleno, Roboto 16 regular y flecha.
 *   · Alto: 44 px, el de la instancia del hero (240 × 44) y el objetivo
 *     táctil del proyecto. Es además el alto natural del contenido: flecha
 *     de 24 px + 9 px de relleno arriba y abajo + el borde. El componente
 *     suelto mide 36 px porque su alto está fijo y la flecha se sale del
 *     relleno.
 *   · Reposo: interaccion/enlace (#1D70B8). Hover: enlace-hover (#003078).
 *   · Presionado: enlace-activo (#373737) con borde #111111.
 *   · Foco: anillo de 2 px en rdbu-01 a 3 px del botón (blanco sobre fondo
 *     oscuro, con `sobreOscuro`).
 *   · La flecha va en `BotonEnlace` (lleva a otra página); en `Boton` (una
 *     acción en la misma página) solo si se pide con `flecha`.
 *   Texto blanco sobre los tres fondos: 5,2:1, 12,4:1 y 11,9:1.
 * - `contorno`: el botón secundario del sitio, el único (hero, tarjeta de
 *   colegio, ficha, resultado del Test, «Usar mi ubicación» y el modal de
 *   ubicación). Desde el 2026-11-05 (decisión de Matías) tiene la forma y la
 *   tipografía del principal: esquinas rectas, borde de 1 px en rdbu-01,
 *   9 px de relleno, 44 px de alto, Roboto 16 regular.
 *   · Reposo: fondo blanco y texto interaccion/enlace (#1D70B8): 5,2:1.
 *   · Hover: fondo interaccion-tinte y texto enlace-hover (#003078): 10,8:1.
 *   · Presionado: fondo rdbu-05 y texto #003078: 9,5:1. (El azul de reposo
 *     sobre rdbu-05 daría 3,98:1, bajo el mínimo; por eso cambia el texto.)
 *   · Foco: el mismo contorno del principal.
 *   La variante `secundario` (texto blanco sobre fondo oscuro, solo en el
 *   hero) se retiró el 2026-11-05: Matías pidió un solo botón secundario.
 */
type Variante = "primario" | "contorno";

const BASE = "inline-flex items-center justify-center gap-xs transition-colors";

/** Forma, tipografía y foco comunes al principal y al secundario. */
const FORMA =
  "min-h-objetivo-tactil border border-rdbu-01 p-[9px] text-sm font-normal tracking-[0.015em] active:!filter-none " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-rdbu-01";

const VARIANTES: Record<Variante, string> = {
  primario:
    FORMA +
    " bg-interaccion-enlace text-texto-sobre-oscuro hover:bg-interaccion-enlace-hover active:border-[#111111] active:bg-interaccion-enlace-activo",
  contorno:
    FORMA +
    " bg-superficie-base text-interaccion-enlace hover:bg-interaccion-tinte hover:text-interaccion-enlace-hover active:bg-rdbu-05 active:text-interaccion-enlace-hover",
};

function clases(variante: Variante, sobreOscuro: boolean, className?: string) {
  return cn(BASE, VARIANTES[variante], sobreOscuro && "focus-visible:outline-texto-sobre-oscuro", className);
}

const Flecha = () => <Icon nombre="arrow_forward" size={24} />;

export function BotonEnlace({
  variante = "primario",
  sobreOscuro = false,
  flecha = variante === "primario",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { variante?: Variante; sobreOscuro?: boolean; flecha?: boolean }) {
  return (
    <Link {...props} className={clases(variante, sobreOscuro, className)}>
      {children}
      {flecha && <Flecha />}
    </Link>
  );
}

export function Boton({
  variante = "primario",
  sobreOscuro = false,
  flecha = false,
  className,
  type = "button",
  children,
  ...props
}: ComponentProps<"button"> & { variante?: Variante; sobreOscuro?: boolean; flecha?: boolean }) {
  return (
    <button type={type} {...props} className={clases(variante, sobreOscuro, className)}>
      {children}
      {flecha && <Flecha />}
    </button>
  );
}
