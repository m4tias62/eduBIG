import { PreguntaLayout } from "@/components/quiz/PreguntaLayout";
import { OpcionPregunta } from "@/components/quiz/OpcionPregunta";
import { nextUrl, parseRespuestas } from "@/lib/quiz/state";
import type { NivelFamilia } from "@/lib/motor/types";

/** Q3 — Nivel educativo (filtro duro). */
export default function Q3({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const previas = parseRespuestas(searchParams);
  const volverA = previas.inclusion && previas.inclusion !== "no" ? "/test/q2b" : "/test/q2a";
  const opciones: Array<{ label: string; valor: NivelFamilia }> = [
    { label: "Educación básica (1° a 8°)", valor: "basica" },
    { label: "Educación media (I° a IV°)", valor: "media" },
    { label: "Ambos niveles", valor: "basica_y_media" },
  ];

  return (
    <PreguntaLayout paso={3} volverHref={nextUrl(volverA, previas, {})} titulo="¿Qué nivel están buscando?">
      {opciones.map((o) => (
        <OpcionPregunta
          key={o.valor}
          // Si cambia el nivel, una prioridad "superior" previa puede dejar de aplicar.
          href={nextUrl("/test/q4", { ...previas, perfil: undefined }, { nivel: o.valor })}
        >
          {o.label}
        </OpcionPregunta>
      ))}
    </PreguntaLayout>
  );
}
