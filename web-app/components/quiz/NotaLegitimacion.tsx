import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Nota de legitimación — bloque de copy neutro que valida todas las
 * respuestas posibles. Se aplica a preguntas con riesgo de deseabilidad
 * social (Q2 inclusión, Q5 prioridad).
 *
 * Patrón registrado en bitácora original. Visualmente diferenciada del
 * resto del contenido por fondo suave + borde izquierdo. Sobre una tarjeta
 * gris (preguntas del Test en escritorio) el fondo pasa a blanco con
 * `className`.
 */
export function NotaLegitimacion({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <aside className={cn("border-l-2 border-temp-calido-suave bg-superficie-elevada px-m py-s rounded-r-s", className)}>
      <p className="text-xs text-texto-secundario">{children}</p>
    </aside>
  );
}
