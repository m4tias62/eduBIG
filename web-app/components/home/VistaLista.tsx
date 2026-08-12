import type { Colegio, ConclusionesColegio } from "@/lib/types";
import { TarjetaColegioBrowse } from "./TarjetaColegioBrowse";
import { distanciaKm } from "@/lib/motor/haversine";
import { LAT_PUDAHUEL, LON_PUDAHUEL } from "@/lib/quiz/state";

/**
 * Vista Lista de la Home — grid vertical de tarjetas.
 * Espejo del frame Figma "Lista de resultados" (61:7).
 *
 * Fondo `superficie/elevada` para separar visualmente las tarjetas
 * (que son superficie/base) del contenedor.
 */
export function VistaLista({
  colegios,
  conclusionesIndex,
}: {
  colegios: Colegio[];
  conclusionesIndex: ReadonlyMap<number, ConclusionesColegio>;
}) {
  if (colegios.length === 0) {
    return (
      <section className="bg-superficie-elevada px-l py-l">
        <div className="rounded-m border border-borde-sutil bg-superficie-base p-l text-center">
          <p className="text-sm font-bold text-texto-primario">
            No hay colegios que coincidan con tus filtros.
          </p>
          <p className="text-xs text-texto-secundario mt-xs">
            Prueba ampliando la distancia o quitando algún filtro.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-superficie-elevada px-l py-l flex flex-col gap-m">
      <p className="text-xs text-texto-secundario">
        {colegios.length} {colegios.length === 1 ? "colegio" : "colegios"} en Pudahuel
      </p>
      {colegios.map((c) => {
        const d = distanciaKm(c.LATITUD, c.LONGITUD, LAT_PUDAHUEL, LON_PUDAHUEL);
        return (
          <TarjetaColegioBrowse
            key={c.rbd}
            colegio={c}
            conclusiones={conclusionesIndex.get(c.rbd) ?? null}
            distanciaKm={d}
          />
        );
      })}
    </section>
  );
}
