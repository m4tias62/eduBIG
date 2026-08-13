"use client";

import { useMemo } from "react";
import type { Colegio, ConclusionesColegio } from "@/lib/types";
import { TarjetaColegioBrowse } from "./TarjetaColegioBrowse";
import { distanciaKm } from "@/lib/motor/haversine";
import { LAT_PUDAHUEL, LON_PUDAHUEL } from "@/lib/quiz/state";
import { useUbicacion } from "@/lib/ubicacion";

/**
 * Vista Lista de la Home — grid vertical de tarjetas.
 *
 * Client component: el filtro/orden por distancia se calcula desde la
 * ubicación del usuario (si la activó) o desde el centro de Pudahuel como
 * fallback. Los demás filtros ya vienen aplicados desde el server; acá solo
 * se resuelve la distancia (que depende de un punto de referencia cliente).
 */
export function VistaLista({
  colegios,
  conclusionesIndex,
  distanciaMaxKm,
}: {
  colegios: Colegio[];
  conclusionesIndex: ReadonlyMap<number, ConclusionesColegio>;
  distanciaMaxKm?: number;
}) {
  const { ubicacion } = useUbicacion();
  const refLat = ubicacion ? ubicacion.lat : LAT_PUDAHUEL;
  const refLon = ubicacion ? ubicacion.lon : LON_PUDAHUEL;
  const desdeUsuario = !!ubicacion;

  const items = useMemo(
    () =>
      colegios
        .map((c) => ({ c, d: distanciaKm(c.LATITUD, c.LONGITUD, refLat, refLon) }))
        .filter((x) => distanciaMaxKm === undefined || x.d <= distanciaMaxKm)
        .sort((a, b) => a.d - b.d),
    [colegios, refLat, refLon, distanciaMaxKm]
  );

  if (items.length === 0) {
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
        {items.length} {items.length === 1 ? "colegio" : "colegios"} en Pudahuel
        {distanciaMaxKm !== undefined &&
          (desdeUsuario ? " · a tu alcance" : " · desde el centro de la comuna")}
      </p>
      {items.map(({ c, d }) => (
        <TarjetaColegioBrowse
          key={c.rbd}
          colegio={c}
          conclusiones={conclusionesIndex.get(c.rbd) ?? null}
          distanciaKm={d}
          desdeUsuario={desdeUsuario}
        />
      ))}
    </section>
  );
}
