import { PreguntaLayout } from "@/components/quiz/PreguntaLayout";
import { OpcionPregunta } from "@/components/quiz/OpcionPregunta";
import { nextUrl, parseRespuestas } from "@/lib/quiz/state";

/**
 * Q4 — Distancia. Captura tipo (duro/flexible) + radio_km.
 * lat/lon del sector se hardcodean en `runMotor` al centro de Pudahuel
 * (LAT_PUDAHUEL, LON_PUDAHUEL). A futuro reemplazar por geocoding de dirección.
 *
 * Mapeo desde las opciones humanas del quiz a parámetros del motor:
 *   "Cerca"     → duro, 1 km  (pie/bici)
 *   "Un poco más lejos" → duro, 3 km  (transporte público corto)
 *   "Cualquier distancia" → flexible (sin radio)
 */
export default function Q4({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const previas = parseRespuestas(searchParams);

  return (
    <PreguntaLayout
      paso={4}
      volverHref={nextUrl("/test/q3", previas, {})}
      titulo="¿Qué tan lejos puede estar el colegio de tu casa?"
    >
      <OpcionPregunta
        href={nextUrl("/test/q5a", previas, { tipoDistancia: "duro", radioKm: 1 })}
      >
        Cerca — a pie o en bicicleta
      </OpcionPregunta>
      <OpcionPregunta
        href={nextUrl("/test/q5a", previas, { tipoDistancia: "duro", radioKm: 3 })}
      >
        Un poco más lejos — en transporte público corto
      </OpcionPregunta>
      <OpcionPregunta
        href={nextUrl("/test/q5a", previas, { tipoDistancia: "flexible" })}
      >
        Estamos abiertos a cualquier distancia
      </OpcionPregunta>
    </PreguntaLayout>
  );
}
