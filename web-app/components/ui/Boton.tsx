import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Botones (v3, rediseño nov-2026). Un solo patrón para todo el sitio (D47),
 * con sus cuatro estados: reposo, hover, presionado (active) y foco.
 *
 * - `BotonEnlace`: navega a otra página (Next Link).
 * - `Boton`: ejecuta una acción en la misma página (<button>).
 *
 * Variantes:
 * - `primario`: la acción principal. Azul de interacción.
 * - `secundario`: acción alternativa sobre fondo oscuro (hero). Borde y
 *   texto blancos, sin relleno; en hover y presionado se rellena apenas.
 * - `contorno`: acción alternativa sobre fondo claro (tarjeta de colegio).
 *   Borde y texto azules sobre blanco; hover y presionado en celestes.
 *
 * Foco: la norma del sitio es un contorno de 2 px (globals.css). Sobre fondo
 * oscuro el azul de foco no alcanza 3:1 contra el fondo (WCAG 1.4.11), así
 * que con `sobreOscuro` el contorno pasa a blanco.
 */
type Variante = "primario" | "secundario" | "contorno";

const BASE =
  "inline-flex min-h-objetivo-tactil items-center justify-center rounded-m px-l text-xs font-bold transition-colors";

const VARIANTES: Record<Variante, string> = {
  primario:
    "bg-interaccion-enlace text-texto-sobre-oscuro hover:bg-interaccion-enlace-hover active:bg-interaccion-enlace-activo",
  secundario:
    "border-2 border-texto-sobre-oscuro bg-transparent text-texto-sobre-oscuro hover:bg-white/15 active:bg-white/25",
  contorno:
    "border border-interaccion-enlace bg-superficie-base text-interaccion-enlace hover:bg-interaccion-tinte active:bg-rdbu-05",
};

function clases(variante: Variante, sobreOscuro: boolean, className?: string) {
  return cn(BASE, VARIANTES[variante], sobreOscuro && "focus-visible:outline-texto-sobre-oscuro", className);
}

export function BotonEnlace({
  variante = "primario",
  sobreOscuro = false,
  className,
  ...props
}: ComponentProps<typeof Link> & { variante?: Variante; sobreOscuro?: boolean }) {
  return <Link {...props} className={clases(variante, sobreOscuro, className)} />;
}

export function Boton({
  variante = "primario",
  sobreOscuro = false,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { variante?: Variante; sobreOscuro?: boolean }) {
  return <button type={type} {...props} className={clases(variante, sobreOscuro, className)} />;
}
