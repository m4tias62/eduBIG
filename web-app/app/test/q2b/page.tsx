import { PreguntaLayout } from "@/components/quiz/PreguntaLayout";
import { OpcionPregunta } from "@/components/quiz/OpcionPregunta";
import { nextUrl, parseRespuestas } from "@/lib/quiz/state";
import type { Inclusion } from "@/lib/motor/types";

/**
 * Q2 Paso 2 — Tipo de inclusión (D21).
 * "Necesita" PIE o educación especial → filtro: solo colegios que lo tienen.
 * "Valoro un entorno inclusivo" → no filtra; suma a los colegios con PIE o
 * educación especial.
 */
export default function Q2b({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const previas = parseRespuestas(searchParams);
  const opciones: Array<{ label: string; detalle: string; valor: Inclusion }> = [
    {
      label: "Necesita PIE en un colegio regular",
      detalle: "Verás solo colegios con Programa de Integración Escolar.",
      valor: "pie",
    },
    {
      label: "Necesita un colegio con educación especial",
      detalle: "Verás solo colegios que imparten educación especial.",
      valor: "especial",
    },
    {
      label: "No tiene una necesidad específica, pero valoro un entorno inclusivo",
      detalle: "Los colegios con PIE o educación especial suman puntos en tu lista.",
      valor: "entorno",
    },
  ];

  return (
    <PreguntaLayout
      paso={2}
      esPaso2
      volverHref={nextUrl("/test/q2a", previas, {})}
      contexto="Dijiste que sí"
      titulo="¿Qué tipo de apoyo buscas?"
    >
      {opciones.map((o) => (
        <OpcionPregunta
          key={o.valor}
          href={nextUrl("/test/q3", previas, { inclusion: o.valor })}
          detalle={o.detalle}
        >
          {o.label}
        </OpcionPregunta>
      ))}
    </PreguntaLayout>
  );
}
