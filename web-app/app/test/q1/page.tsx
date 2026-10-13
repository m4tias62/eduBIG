import { PreguntaLayout } from "@/components/quiz/PreguntaLayout";
import { OpcionPregunta } from "@/components/quiz/OpcionPregunta";
import { nextUrl, parseRespuestas } from "@/lib/quiz/state";
import type { TechoCopago } from "@/lib/motor/types";

/** Q1 — Copago. Tope de mensualidad (tramos del Directorio Mineduc). */
export default function Q1({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const previas = parseRespuestas(searchParams);
  const opciones: Array<{ label: string; valor: TechoCopago }> = [
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
        <OpcionPregunta key={o.valor} href={nextUrl("/test/q2a", previas, { techoCopago: o.valor })}>
          {o.label}
        </OpcionPregunta>
      ))}
    </PreguntaLayout>
  );
}
