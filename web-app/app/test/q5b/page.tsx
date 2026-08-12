import { PreguntaLayout } from "@/components/quiz/PreguntaLayout";
import { OpcionPregunta } from "@/components/quiz/OpcionPregunta";
import { nextUrl, parseRespuestas } from "@/lib/quiz/state";

/**
 * Q5 Paso 2 — Refinement de "Bienestar personal".
 * Confianza y motivación → perfil `autoestima`.
 * Hábitos de vida saludable → perfil `habitos`.
 * No avanza el contador (sigue en 5/5).
 */
export default function Q5b({
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
      contexto={'Elegiste "bienestar personal"'}
      titulo="Dentro del bienestar personal, ¿en qué prefieres que Edubig ponga más peso?"
      nota="Las dos son parte del bienestar personal. Necesitamos saber en cuál poner más peso, no cuál te importa menos."
    >
      <OpcionPregunta href={nextUrl("/test/loading", previas, { perfil: "autoestima" })}>
        Confianza y motivación
      </OpcionPregunta>
      <OpcionPregunta href={nextUrl("/test/loading", previas, { perfil: "habitos" })}>
        Hábitos de vida saludable
      </OpcionPregunta>
    </PreguntaLayout>
  );
}
