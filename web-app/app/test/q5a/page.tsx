import { PreguntaLayout } from "@/components/quiz/PreguntaLayout";
import { OpcionPregunta } from "@/components/quiz/OpcionPregunta";
import { nextUrl, parseRespuestas } from "@/lib/quiz/state";

/**
 * Q5 Paso 1 — Prioridad.
 * - "Preparación para la educación superior" aparece solo si eligió media o
 *   ambos niveles (D30).
 * - "No tengo una prioridad clara" (antes "Todo por igual") va al final, con
 *   menos peso visual y una nota de lo que implica (D35).
 */
export default function Q5a({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const previas = parseRespuestas(searchParams);
  const conMedia = previas.nivel === "media" || previas.nivel === "basica_y_media";
  const notaTodo =
    previas.alcance === "cualquiera"
      ? "Ordenaremos considerando todo por igual, y la cercanía pesará más que cada dimensión por separado."
      : "Ordenaremos considerando todas las dimensiones por igual.";

  return (
    <PreguntaLayout
      paso={5}
      volverHref={nextUrl("/test/q4", previas, {})}
      titulo="¿En qué prefieres que Edubig ponga más peso al armar tu lista?"
      nota="Todas las dimensiones importan al elegir un colegio. Necesitamos saber en cuál poner más peso para armar tu lista: escoger una no implica que las demás no se consideren."
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
      {conMedia && (
        <OpcionPregunta
          href={nextUrl("/test/loading", previas, { perfil: "superior" })}
          detalle="Ingreso a la universidad, comparado con colegios similares."
        >
          Preparación para la educación superior
        </OpcionPregunta>
      )}
      <OpcionPregunta
        secundaria
        href={nextUrl("/test/loading", previas, { perfil: "todo_por_igual" })}
        detalle={notaTodo}
      >
        No tengo una prioridad clara
      </OpcionPregunta>
    </PreguntaLayout>
  );
}
