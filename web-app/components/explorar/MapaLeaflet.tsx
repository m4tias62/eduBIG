"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import type { ItemExploracion } from "@/lib/home/filtros";

/**
 * Vista Mapa de la exploración — Leaflet + OpenStreetMap. Muestra la misma
 * lista filtrada como pines y se encuadra sobre ellos.
 */

const pinIcon = L.divIcon({
  className: "edubig-pin",
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#fff;border:3px solid #2166ac;box-shadow:0 2px 6px rgba(0,0,0,0.25);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -12],
});

const refIcon = L.divIcon({
  className: "edubig-user-pin",
  html: '<div style="width:18px;height:18px;border-radius:50%;background:#0958D9;border:3px solid #fff;box-shadow:0 0 0 2px rgba(9,88,217,0.4),0 2px 6px rgba(0,0,0,0.3);"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -12],
});

function Encuadrar({ puntos }: { puntos: Array<[number, number]> }) {
  const map = useMap();
  const clave = puntos.length ? `${puntos.length}:${puntos[0][0]}:${puntos[0][1]}` : "0";
  useEffect(() => {
    if (puntos.length === 0) return;
    if (puntos.length === 1) map.setView(puntos[0], 15);
    else map.fitBounds(L.latLngBounds(puntos), { padding: [24, 24], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, map]);
  return null;
}

export function MapaLeaflet({
  items,
  referencia,
}: {
  items: ItemExploracion[];
  referencia?: { lat: number; lon: number; etiqueta: string };
}) {
  const puntos: Array<[number, number]> = items.map(({ c }) => [c.lat, c.lon]);
  if (referencia) puntos.push([referencia.lat, referencia.lon]);
  const centro: [number, number] = puntos[0] ?? [-33.45, -70.66];

  return (
    <div className="w-full h-[calc(100vh-300px)] min-h-[360px] relative">
      <MapContainer center={centro} zoom={13} scrollWheelZoom className="w-full h-full">
        <Encuadrar puntos={puntos} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {referencia && (
          <Marker position={[referencia.lat, referencia.lon]} icon={refIcon}>
            <Popup>
              <p className="text-xs font-bold text-texto-primario m-0">{referencia.etiqueta}</p>
            </Popup>
          </Marker>
        )}
        {items.map(({ c }) => (
          <Marker key={c.rbd} position={[c.lat, c.lon]} icon={pinIcon}>
            <Popup>
              <div className="flex flex-col gap-xs min-w-[200px]">
                <p className="text-xs font-bold text-texto-primario m-0">{c.n}</p>
                <p className="text-2xs text-texto-secundario m-0">RBD {c.rbd}</p>
                <Link
                  href={`/colegio/${c.rbd}`}
                  className="text-xs font-bold text-interaccion-enlace hover:text-interaccion-enlace-hover mt-xxs"
                >
                  Ver ficha →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
