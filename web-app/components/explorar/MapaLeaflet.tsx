"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { BotonEnlace } from "@/components/ui/Boton";
import "leaflet/dist/leaflet.css";
import type { ItemExploracion } from "@/lib/home/filtros";
import { atributosDestacados } from "@/lib/home/atributos";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * Vista Mapa de la exploración — Leaflet + OpenStreetMap. Muestra la misma
 * lista filtrada como pines y se encuadra sobre ellos.
 */

// Cada pin ocupa un área de toque de 24 × 24 px (WCAG 2.5.8) con el punto
// visible centrado: se ve igual que antes, pero es más fácil de tocar.
const pinIcon = L.divIcon({
  className: "edubig-pin",
  html: '<div style="width:20px;height:20px;margin:2px;border-radius:50%;background:#fff;border:3px solid #2166ac;box-shadow:0 2px 6px rgba(0,0,0,0.25);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
});

// Pin resaltado al pasar por su tarjeta en la lista (escritorio): cálido,
// porque la familia lo tiene "en foco" (mismo criterio que el hover de la card).
const pinResaltado = L.divIcon({
  className: "edubig-pin-foco",
  html: '<div style="width:28px;height:28px;border-radius:50%;background:#d6604d;border:4px solid #fff;box-shadow:0 0 0 2px #b2181f,0 2px 8px rgba(0,0,0,0.35);"></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

const refIcon = L.divIcon({
  className: "edubig-user-pin",
  html: '<div style="width:18px;height:18px;margin:3px;border-radius:50%;background:#1D70B8;border:3px solid #fff;box-shadow:0 0 0 2px rgba(29,112,184,0.4),0 2px 6px rgba(0,0,0,0.3);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
});

/**
 * Foco con teclado en el globo (WCAG 2.1.1 y 2.4.3): al abrirse, el foco pasa
 * al botón «Ver ficha del colegio»; Escape lo cierra; al cerrarse, el foco
 * vuelve al pin que lo abrió. El botón de cerrar de Leaflet viene en inglés.
 */
function FocoGlobo() {
  const map = useMapEvents({
    popupopen(e) {
      const globo = e.popup.getElement();
      if (!globo) return;
      const cerrar = globo.querySelector<HTMLElement>(".leaflet-popup-close-button");
      cerrar?.setAttribute("aria-label", "Cerrar");
      cerrar?.setAttribute("title", "Cerrar");
      // react-leaflet pinta el contenido un instante después de abrir el globo.
      requestAnimationFrame(() => {
        const destino = globo.querySelector<HTMLElement>(".leaflet-popup-content a[href]") ?? cerrar;
        destino?.focus({ preventScroll: true });
      });
      globo.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape") {
          ev.stopPropagation();
          map.closePopup(e.popup);
        }
      });
    },
    popupclose(e) {
      const globo = e.popup.getElement();
      const activo = document.activeElement;
      const focoAdentro = !activo || activo === document.body || (globo?.contains(activo) ?? false);
      // @ts-expect-error _source es interno de Leaflet: la capa que abrió el globo
      const origen: L.Layer | undefined = e.popup._source;
      if (focoAdentro && origen instanceof L.Marker) origen.getElement()?.focus({ preventScroll: true });
    },
  });
  return null;
}

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
  resaltado = null,
  className,
}: {
  items: ItemExploracion[];
  referencia?: { lat: number; lon: number; etiqueta: string };
  /** RBD cuyo pin se resalta (sincronía con la lista en escritorio). */
  resaltado?: number | null;
  /** Por defecto, alto pensado para la vista Mapa de móvil. */
  className?: string;
}) {
  const puntos: Array<[number, number]> = items.map(({ c }) => [c.lat, c.lon]);
  if (referencia) puntos.push([referencia.lat, referencia.lon]);
  const centro: [number, number] = puntos[0] ?? [-33.45, -70.66];

  return (
    // `isolate`: las capas de Leaflet (z-index 400 a 1000) quedan dentro del
    // mapa, así los desplegables y la barra fija pasan por encima de él.
    <div className={cn("relative isolate", className ?? "w-full h-[calc(100vh-300px)] min-h-[360px]")}>
      <MapContainer center={centro} zoom={13} scrollWheelZoom className="w-full h-full">
        <Encuadrar puntos={puntos} />
        <FocoGlobo />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {referencia && (
          <Marker position={[referencia.lat, referencia.lon]} icon={refIcon} title={referencia.etiqueta}>
            <Popup>
              <p className="text-xs font-bold text-texto-primario m-0">{referencia.etiqueta}</p>
            </Popup>
          </Marker>
        )}
        {items.map(({ c }) => (
          <Marker
            key={c.rbd}
            position={[c.lat, c.lon]}
            icon={c.rbd === resaltado ? pinResaltado : pinIcon}
            zIndexOffset={c.rbd === resaltado ? 1000 : 0}
            // Nombre accesible del pin (WCAG 4.1.2). Va en `title` porque Leaflet
            // lo vuelve a poner cuando el pin cambia de ícono (resaltado).
            title={c.n}
          >
            <Popup className="edubig-popup" minWidth={240} maxWidth={240} autoPanPaddingTopLeft={[56, 16]}>
              <div className="w-[240px] font-body">
                <p className="m-0 py-s pl-l pr-xl font-heading text-sm font-bold uppercase leading-tight tracking-[0.015em] text-rdbu-01">
                  {c.n}
                </p>
                <hr className="mx-l my-0 border-0 border-t border-borde-definido" />
                <ul className="m-0 flex list-none flex-col items-start gap-xs px-l py-m" aria-label="Características del colegio">
                  {atributosDestacados(c).map((a) => (
                    <li
                      key={a.texto}
                      className="inline-flex items-center gap-xxs border border-borde-enfatico bg-superficie-base px-xs py-xxs text-2xs leading-none text-texto-primario"
                    >
                      <Icon nombre={a.icono} size={12} />
                      {a.texto}
                    </li>
                  ))}
                </ul>
                <div className="px-l pb-s">
                  {/* !text: Leaflet pinta los enlaces del globo de otro azul. */}
                  <BotonEnlace href={`/colegio/${c.rbd}`} className="w-full whitespace-nowrap !text-texto-sobre-oscuro">
                    Ver ficha del colegio
                  </BotonEnlace>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
