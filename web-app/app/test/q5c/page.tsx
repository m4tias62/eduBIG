import { PreguntaLayout } from "@/components/quiz/PreguntaLayout";
import { OpcionPregunta } from "@/components/quiz/OpcionPregunta";
import { nextUrl, parseRespuestas } from "@/lib/quiz/state";

/**
 * Q5 Paso 2 — Refinement de "Convivencia y vida escolar".
 * Seguridad y clima escolar → perfil `convivencia` (score = clima IDPS + seguridad denuncias).
 * Participación y sentido de comunidad → perfil `participacion`.
 */
export default function Q5c({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const previas = parseRespuestas(searchParams);

  return (
    <PreguntaLayout
      paso={5}
      esPaso2
      volverHref={nextUrl("/test/q5a", previas, {})}
      contexto={'Elegiste "convivencia y vida escolar"'}
      titulo="Dentro de la convivencia y vida escolar, ¿en qué prefieres que Edubig ponga más peso?"
      nota="Las dos son parte de la convivencia y vida escolar. Necesitamos saber en cuál poner más peso, no cuál te importa menos."
    >
      <OpcionPregunta href={nextUrl("/test/loading", previas, { perfil: "convivencia" })}>
        Seguridad y clima escolar
      </OpcionPregunta>
      <OpcionPregunta href={nextUrl("/test/loading", previas, { perfil: "participacion" })}>
        Participación y sentido de comunidad
      </OpcionPregunta>
    </PreguntaLayout>
  );
}
