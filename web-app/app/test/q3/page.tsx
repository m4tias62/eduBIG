import { PreguntaLayout } from "@/components/quiz/PreguntaLayout";
import { OpcionPregunta } from "@/components/quiz/OpcionPregunta";
import { nextUrl, parseRespuestas } from "@/lib/quiz/state";
import type { RespuestasFamilia } from "@/lib/motor";

/**
 * Q3 — Nivel educativo. Mapea directo al filtro duro de Capa 1.
 * "volver" retorna a Q2b si vino de allí (incTipo definido), a Q2a si no.
 */
export default function Q3({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const previas = parseRespuestas(searchParams);
  const volverA = previas.incTipo ? "/test/q2b" : "/test/q2a";

  const opciones: Array<{ label: string; valor: RespuestasFamilia["nivel"] }> = [
    { label: "Educación básica (1° a 8°)", valor: "basica" },
    { label: "Educación media (I° a IV°)", valor: "media" },
    { label: "Ambos niveles", valor: "basica_y_media" },
  ];

  return (
    <PreguntaLayout
      paso={3}
      volverHref={nextUrl(volverA, previas, {})}
      titulo="¿Qué nivel están buscando?"
    >
      {opciones.map((o) => (
        <OpcionPregunta
          key={o.valor}
          href={nextUrl("/test/q4", previas, { nivel: o.valor })}
        >
          {o.label}
        </OpcionPregunta>
      ))}
    </PreguntaLayout>
  );
}
