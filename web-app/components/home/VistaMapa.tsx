"use client";

import dynamic from "next/dynamic";
import type { Colegio, ConclusionesColegio } from "@/lib/types";

/**
 * Wrapper client-side de la Vista Mapa. Leaflet no puede renderizarse en
 * SSR (usa `window` en su initializer), así que el componente real se
 * carga dinámicamente con ssr:false — el chunk de Leaflet solo llega al
 * navegador cuando el usuario abre esta vista.
 */
const MapaLeaflet = dynamic(() => import("./MapaLeaflet").then((m) => m.MapaLeaflet), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-260px)] flex items-center justify-center bg-superficie-hundida text-texto-secundario text-xs">
      Cargando mapa...
    </div>
  ),
});

export function VistaMapa({
  colegios,
  conclusionesIndex,
  distanciaMaxKm,
}: {
  colegios: Colegio[];
  conclusionesIndex: ReadonlyMap<number, ConclusionesColegio>;
  distanciaMaxKm?: number;
}) {
  return (
    <MapaLeaflet
      colegios={colegios}
      conclusionesIndex={conclusionesIndex}
      distanciaMaxKm={distanciaMaxKm}
    />
  );
}
