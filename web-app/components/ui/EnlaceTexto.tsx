import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Enlace de texto de la navegación (v3, Figma «Componentes creados → Text
 * links», nodo 833:8437). Estados del diseño de Matías:
 *
 * - Reposo: texto en negrita, sin subrayado.
 * - Hover: línea inferior de 2 px en rdbu-10.
 * - Presionado: marco de 1 px en rdbu-10.
 * - Foco: marco de 1 px más un contorno exterior de 2 px, ambos en rdbu-10.
 *   Sobre el gris de la barra (#EAEAEA) el rojo tiene 5,4:1, sobre el 3:1 que
 *   pide WCAG 1.4.11 para el indicador de foco.
 * - Página actual (aria-current): la misma línea inferior del hover, fija.
 *
 * El marco se dibuja con una sombra interior para que el enlace no cambie de
 * tamaño al pasar de un estado a otro.
 *
 * `EnlaceTexto` navega; `BotonTexto` abre algo en la misma página (por
 * ejemplo, un diálogo) y por eso es un <button>.
 */
const CLASES =
  "inline-flex min-h-objetivo-tactil items-center border-b-2 border-transparent px-xxs text-xs font-bold text-texto-primario transition-colors " +
  "hover:border-rdbu-10 aria-[current=page]:border-rdbu-10 " +
  "active:shadow-[inset_0_0_0_1px_#b2181f] " +
  "focus-visible:shadow-[inset_0_0_0_1px_#b2181f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-rdbu-10";

export function EnlaceTexto({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link {...props} className={cn(CLASES, className)} />;
}

export function BotonTexto({ className, type = "button", ...props }: ComponentProps<"button">) {
  return <button type={type} {...props} className={cn(CLASES, className)} />;
}
