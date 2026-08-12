import { PreguntaLayout } from "@/components/quiz/PreguntaLayout";
import { OpcionPregunta } from "@/components/quiz/OpcionPregunta";
import { nextUrl, parseRespuestas } from "@/lib/quiz/state";
import type { IncTipo } from "@/lib/quiz/state";

/**
 * Q2 Paso 2 — Tipo de inclusión (solo si Q2a=Sí).
 * Hoy el motor sólo usa el boolean quiereInclusion; el sub-tipo se guarda
 * en la URL para uso futuro si el scoring se refina. No avanza el contador
 * (sigue en 2/5) — es refinement de la misma pregunta.
 */
export default function Q2b({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const previas = parseRespuestas(searchParams);

  const opciones: Array<{ label: string; valor: IncTipo }> = [
    { label: "PIE en colegio regular", valor: "pie" },
    { label: "Colegio de educación especial", valor: "especial" },
    { label: "No tengo una necesidad específica, pero valoro un entorno inclusivo", valor: "entorno" },
  ];

  return (
    <PreguntaLayout
      paso={2}
      esPaso2
      volverHref={nextUrl("/test/q2a", previas, {})}
      contexto="Dijiste que sí"
      titulo="¿Qué tipo de inclusión buscas?"
    >
      {opciones.map((o) => (
        <OpcionPregunta
          key={o.valor}
          href={nextUrl("/test/q3", previas, { incTipo: o.valor })}
        >
          {o.label}
        </OpcionPregunta>
      ))}
    </PreguntaLayout>
  );
}
