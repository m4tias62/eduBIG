import type { ReactNode } from "react";

/**
 * Nota de legitimación — bloque de copy neutro que valida todas las
 * respuestas posibles. Se aplica a preguntas con riesgo de deseabilidad
 * social (Q2 inclusión, Q5 prioridad).
 *
 * Patrón registrado en bitácora original. Visualmente diferenciada del
 * resto del contenido por fondo suave + borde izquierdo.
 */
export function NotaLegitimacion({ children }: { children: ReactNode }) {
  return (
    <aside className="border-l-2 border-temp-calido-suave bg-superficie-elevada px-m py-s rounded-r-s">
      <p className="text-xs text-texto-secundario">{children}</p>
    </aside>
  );
}
