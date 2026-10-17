"use client";

import { Globo } from "@/components/ui/Globo";

/**
 * D25 — El grupo de comparación no se muestra de entrada: aparece en el globo
 * del ícono de info de cada curso, con una explicación de por qué puede cambiar.
 * Oct-2026: usa el Globo, patrón único de ayuda contextual del sitio.
 *
 * TEXTO BORRADOR (pendiente de redacción de Matías): debe evitar que la
 * etiqueta del grupo se lea como juicio sobre el colegio.
 */
export function InfoGrupo({ curso, grupo }: { curso: string; grupo?: string }) {
  return (
    <Globo
      etiqueta={`¿Con qué colegios se compara en ${curso}?`}
      texto={
        grupo ? (
          <>
            En {curso}, comparamos con colegios cuyas familias tienen un nivel socioeconómico parecido: el grupo{" "}
            <strong>{grupo.toLowerCase()}</strong>, según la Agencia de Calidad. El grupo describe a las familias de
            los estudiantes, no la calidad del colegio. Puede cambiar entre cursos porque la Agencia lo calcula para
            cada prueba, con las familias de quienes la rindieron.
          </>
        ) : (
          `La Agencia de Calidad no publicó un grupo de comparación para ${curso} en este colegio.`
        )
      }
    />
  );
}
