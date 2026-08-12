import { PreguntaLayout } from "@/components/quiz/PreguntaLayout";
import { OpcionPregunta } from "@/components/quiz/OpcionPregunta";
import { nextUrl, parseRespuestas } from "@/lib/quiz/state";

/**
 * Q5 Paso 1 — Prioridad.
 * 4 opciones — 2 terminan el quiz directo (academico, todo_por_igual),
 * 2 abren un Paso 2 de refinement (bienestar → Q5b, convivencia → Q5c).
 *
 * Nota de legitimación crítica: memoria original marca alto riesgo de
 * "todo por igual" como escape moral (central-tendency bias). Se mantiene
 * la opción; la mitigación es discursiva.
 */
export default function Q5a({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const previas = parseRespuestas(searchParams);

  return (
    <PreguntaLayout
      paso={5}
      volverHref={nextUrl("/test/q4", previas, {})}
      titulo="¿En qué prefieres que Edubig ponga más peso al armar tu lista?"
      nota="Todas las dimensiones importan al elegir un colegio. Sin embargo necesitamos saber en cuál poner más peso para armar tu lista. Escoger una no implica que las demás no se consideren."
    >
      <OpcionPregunta href={nextUrl("/test/loading", previas, { perfil: "academico" })}>
        Resultados académicos
      </OpcionPregunta>
      <OpcionPregunta href={nextUrl("/test/q5b", previas, {})}>
        Bienestar personal del estudiante
      </OpcionPregunta>
      <OpcionPregunta href={nextUrl("/test/q5c", previas, {})}>
        Convivencia y vida escolar
      </OpcionPregunta>
      <OpcionPregunta href={nextUrl("/test/loading", previas, { perfil: "todo_por_igual" })}>
        Todo por igual
      </OpcionPregunta>
    </PreguntaLayout>
  );
}
