"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import type { Colegio, ConclusionesColegio } from "@/lib/types";
import { LAT_PUDAHUEL, LON_PUDAHUEL } from "@/lib/quiz/state";
import { distanciaKm } from "@/lib/motor/haversine";
import { useUbicacion } from "@/lib/ubicacion";

/**
 * Vista Mapa — Leaflet + tiles OpenStreetMap con los colegios como pines.
 * Espejo del frame Figma "Home — Mobile — Mapa" (69:135).
 *
 * Ubicación: si el usuario activó su ubicación, el mapa se centra en ella,
 * muestra un pin "tú estás aquí" y filtra los colegios por el radio elegido
 * medido desde ahí. Si no, usa el centro de Pudahuel como fallback.
 */

const pinIcon = L.divIcon({
  className: "edubig-pin",
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#fff;border:3px solid #67001f;box-shadow:0 2px 6px rgba(0,0,0,0.25);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -12],
});

const userIcon = L.divIcon({
  className: "edubig-user-pin",
  html: '<div style="width:18px;height:18px;border-radius:50%;background:#0958D9;border:3px solid #fff;box-shadow:0 0 0 2px rgba(9,88,217,0.4),0 2px 6px rgba(0,0,0,0.3);"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -12],
});

/** Recentra el mapa cuando cambia el punto de referencia (p. ej. al activar
 *  la ubicación del usuario). El `center` de MapContainer solo aplica al montar. */
function Recentrar({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon]);
  }, [lat, lon, map]);
  return null;
}

export function MapaLeaflet({
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

  const visibles =
    distanciaMaxKm === undefined
      ? colegios
      : colegios.filter(
          (c) => distanciaKm(c.LATITUD, c.LONGITUD, refLat, refLon) <= distanciaMaxKm
        );

  return (
    <div className="w-full h-[calc(100vh-260px)] relative">
      <MapContainer
        center={[refLat, refLon]}
        zoom={13}
        scrollWheelZoom
        className="w-full h-full"
      >
        <Recentrar lat={refLat} lon={refLon} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {ubicacion && (
          <Marker position={[ubicacion.lat, ubicacion.lon]} icon={userIcon}>
            <Popup>
              <p className="text-xs font-bold text-texto-primario m-0">Tú estás aquí</p>
            </Popup>
          </Marker>
        )}

        {visibles.map((c) => {
          const nombre = conclusionesIndex.get(c.rbd)?.identidad.nombre ?? c.NOM_RBD;
          return (
            <Marker key={c.rbd} position={[c.LATITUD, c.LONGITUD]} icon={pinIcon}>
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
