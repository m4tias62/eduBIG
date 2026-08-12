"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import type { Colegio, ConclusionesColegio } from "@/lib/types";
import { LAT_PUDAHUEL, LON_PUDAHUEL } from "@/lib/quiz/state";

/**
 * Vista Mapa — Leaflet + tiles OpenStreetMap con los colegios como pines.
 * Espejo del frame Figma "Home — Mobile — Mapa" (69:135).
 *
 * Stack open-source total:
 *  - Leaflet: motor de mapas
 *  - OpenStreetMap tiles: sin API key ni costo
 *  - react-leaflet: bindings React
 *
 * Pin custom (divIcon): círculo blanco con borde rdbu-11 — coherente
 * con el patrón visual del Figma sin depender de las imágenes por defecto
 * de Leaflet (que rompen con muchos bundlers).
 */

const pinIcon = L.divIcon({
  className: "edubig-pin",
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#fff;border:3px solid #67001f;box-shadow:0 2px 6px rgba(0,0,0,0.25);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -12],
});

export function MapaLeaflet({
  colegios,
  conclusionesIndex,
}: {
  colegios: Colegio[];
  conclusionesIndex: ReadonlyMap<number, ConclusionesColegio>;
}) {
  return (
    <div className="w-full h-[calc(100vh-260px)] relative">
      <MapContainer
        center={[LAT_PUDAHUEL, LON_PUDAHUEL]}
        zoom={13}
        scrollWheelZoom
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {colegios.map((c) => {
          const nombre = conclusionesIndex.get(c.rbd)?.identidad.nombre ?? c.NOM_RBD;
          return (
            <Marker
              key={c.rbd}
              position={[c.LATITUD, c.LONGITUD]}
              icon={pinIcon}
            >
              <Popup>
                <div className="flex flex-col gap-xs min-w-[200px]">
                  <p className="text-xs font-bold text-texto-primario m-0">{nombre}</p>
                  <p className="text-2xs text-texto-secundario m-0">
                    RBD {c.rbd} · {c.NOM_COM_RBD}
                  </p>
                  <Link
                    href={`/colegio/${c.rbd}`}
                    className="text-xs font-bold text-interaccion-enlace hover:text-interaccion-enlace-hover mt-xxs"
                  >
                    Ver ficha →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
