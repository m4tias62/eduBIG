import { PreguntaLayout } from "@/components/quiz/PreguntaLayout";
import { OpcionPregunta } from "@/components/quiz/OpcionPregunta";
import { nextUrl, parseRespuestas } from "@/lib/quiz/state";

/**
 * Q1 — Copago. Mapea a techoCopago (0..5, siguiendo los rangos Mineduc).
 * Sin nota de legitimación: no hay riesgo de deseabilidad social aquí.
 */
export default function Q1({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const previas = parseRespuestas(searchParams);

  const opciones: Array<{ label: string; valor: number }> = [
    { label: "Gratuito", valor: 0 },
    { label: "Hasta $10.000", valor: 1 },
    { label: "Hasta $25.000", valor: 2 },
    { label: "Hasta $50.000", valor: 3 },
    { label: "Hasta $100.000", valor: 4 },
    { label: "Más de $100.000", valor: 5 },
  ];

  return (
    <PreguntaLayout
      paso={1}
      volverHref="/"
      titulo="¿Hasta cuánto pueden pagar de mensualidad?"
      subtitulo="Verás opciones de ese monto y menores, incluidas las gratuitas."
    >
      {opciones.map((o) => (
        <OpcionPregunta
          key={o.valor}
          href={nextUrl("/test/q2a", previas, { techoCopago: o.valor as never })}
        >
          {o.label}
        </OpcionPregunta>
      ))}
    </PreguntaLayout>
  );
}
