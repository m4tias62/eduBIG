import { PreguntaLayout } from "@/components/quiz/PreguntaLayout";
import { OpcionPregunta } from "@/components/quiz/OpcionPregunta";
import { nextUrl, parseRespuestas } from "@/lib/quiz/state";

/**
 * Q2 Paso 1 — Inclusión (Gate).
 * Sí → Q2b (refinement) · No → salta a Q3.
 * Nota de legitimación: pregunta con alto riesgo de deseabilidad social.
 */
export default function Q2a({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const previas = parseRespuestas(searchParams);

  return (
    <PreguntaLayout
      paso={2}
      volverHref={nextUrl("/test/q1", previas, {})}
      titulo="¿Tu familia necesita que el colegio tenga programas de inclusión o apoyos específicos?"
      subtitulo="Nos referimos tanto a programas de integración escolar (PIE) como a colegios de educación especial."
      nota="Cada familia tiene una realidad distinta. Elegir 'no' aquí no significa que no valores la inclusión — solo que no es lo que buscas en este momento."
    >
      <OpcionPregunta href={nextUrl("/test/q2b", previas, { quiereInclusion: true })}>
        Sí
      </OpcionPregunta>
      <OpcionPregunta href={nextUrl("/test/q3", previas, { quiereInclusion: false })}>
        No
      </OpcionPregunta>
    </PreguntaLayout>
  );
}
