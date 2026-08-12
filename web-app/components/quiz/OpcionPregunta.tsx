"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Opción clickable de una pregunta del quiz.
 * Espejo del component set Figma "Opción de pregunta" (variantes Estado=Reposo/Selected).
 *
 * Auto-advance: al hacer click, el <Link> navega a la próxima URL con
 * la respuesta serializada. Sin botón "Continuar" — patrón validado en
 * bitácora original del quiz.
 */
export function OpcionPregunta({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block w-full rounded-m border border-borde-definido bg-superficie-base px-l py-m text-sm text-texto-primario hover:border-texto-primario hover:bg-superficie-elevada focus:border-interaccion-foco focus:outline-none transition-colors"
    >
      {children}
    </Link>
  );
}
