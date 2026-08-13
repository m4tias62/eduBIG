import { redirect } from "next/navigation";
import { getUniverso, conclusionesIndex } from "@/lib/data/schools";
import { parseRespuestas, toRespuestasFamilia } from "@/lib/quiz/state";
import { UbicacionProvider } from "@/lib/ubicacion";
import { ShortlistResultado } from "@/components/quiz/ShortlistResultado";

/**
 * Resultado del quiz — Shortlist.
 *
 * Espejo del frame Figma "Shortlist — Colegios que calzan" (368:6).
 *
 * El motor corre en CLIENTE (ver ShortlistResultado) para poder usar la
 * ubicación real del usuario como centro de la distancia — un dato sensible
 * que no viaja por la URL. Acá, server-side, solo validamos que el quiz esté
 * completo (si no, se redirige a q1) y pasamos el universo + conclusiones.
 * El fallback sin ubicación es el centro de Pudahuel (comportamiento previo).
 */
export default function Resultado({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const previas = parseRespuestas(searchParams);
  if (!toRespuestasFamilia(previas)) redirect("/test/q1");

  const universo = getUniverso();

  return (
    <UbicacionProvider>
      <ShortlistResultado
        previas={previas}
        universo={universo}
        conclusionesIndex={conclusionesIndex}
      />
    </UbicacionProvider>
  );
}
