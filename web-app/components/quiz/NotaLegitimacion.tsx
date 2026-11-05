import type { ReactNode } from "react";
import { FichaInformativa } from "@/components/ui/FichaInformativa";

/**
 * Nota de legitimación: copy neutro que valida todas las respuestas posibles.
 * Se aplica a preguntas con riesgo de deseabilidad social (Q2 inclusión, Q5
 * prioridad) y al resumen de la shortlist.
 *
 * v3 (2026-11-05): usa la ficha informativa de Matías (uso «informativo»),
 * como las demás notas para leer con calma del sitio. Antes era un bloque
 * con borde izquierdo cálido.
 */
export function NotaLegitimacion({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <FichaInformativa className={className}>
      <p>{children}</p>
    </FichaInformativa>
  );
}
