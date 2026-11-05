"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Boton, BotonEnlace } from "@/components/ui/Boton";
import type { ColegioIndice } from "@/lib/types";
import { dependenciaGlosa, formatearDistancia, nivelesGlosa, type ReferenciaDistancia } from "@/lib/data/formatters";
import { atributosDestacados } from "@/lib/home/atributos";

/**
 * Tarjeta de colegio (v3, Figma «Tarjeta colegio», nodos 840:891 y 837:4440).
 * Anotación de Matías: «Se incorporaron más estados a las cards, hover es más
 * evidente, se incorpora el pressed».
 *
 * Estados de la tarjeta:
 * - Reposo: borde rdbu-02 de 2 px arriba e izquierda y 4 px a la derecha y
 *   abajo (el «volumen» en pixel art), elevación 2.
 * - Hover: borde cálido profundo y fondo gris.
 * - Presionado: borde de 4 px en rdbu-10 y el nombre subrayado.
 * - Foco: borde rdbu-11 y contorno exterior de 4 px en rdbu-11.
 *
 * Interacción (patrón «tarjeta con enlace extendido»): «Ver ficha» es el
 * enlace y su área cubre toda la tarjeta, así que un clic en cualquier parte
 * abre la ficha. «Comparar» queda por encima, como acción aparte. Así no hay
 * controles anidados (un botón dentro de un enlace), y el teclado recorre dos
 * paradas por tarjeta. Los estados de la tarjeta siguen al enlace (:has).
 *
 * Sin la imagen del diseño: los datos no traen fotos de los colegios.
 */
export function TarjetaColegio({
  colegio,
  distanciaKm,
  referencia,
  nombreComuna,
  enComparacion,
  comparacionLlena,
  maximoComparar,
  onComparar,
}: {
  colegio: ColegioIndice;
  distanciaKm?: number;
  referencia?: ReferenciaDistancia;
  nombreComuna?: string;
  /** El colegio ya está en la comparación. */
  enComparacion: boolean;
  /** Ya hay `maximoComparar` colegios elegidos. */
  comparacionLlena: boolean;
  maximoComparar: number;
  onComparar: () => void;
}) {
  const [avisoLleno, setAvisoLleno] = useState(false);
  const bloqueado = comparacionLlena && !enComparacion;
  const lugar =
    distanciaKm !== undefined && referencia ? formatearDistancia(distanciaKm, referencia) : (nombreComuna ?? "");

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col gap-m rounded-m border-b-4 border-l-2 border-r-4 border-t-2 border-rdbu-02 bg-superficie-base p-l transition-colors",
        "shadow-[0_0.47px_0.94px_rgba(0,0,0,0.3),0_0.94px_2.83px_0.94px_rgba(0,0,0,0.15)]",
        "hover:border-temp-calido-profundo hover:bg-superficie-hundida",
        "has-[a:active]:border-4 has-[a:active]:border-rdbu-10 has-[a:active]:bg-superficie-base",
        "has-[a:focus-visible]:border-rdbu-11 has-[a:focus-visible]:bg-superficie-base has-[a:focus-visible]:outline has-[a:focus-visible]:outline-4 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-rdbu-11"
      )}
    >
      <h3 className="font-heading text-sm font-semibold leading-snug tracking-[0.015em] text-texto-primario group-has-[a:active]:underline">
        {colegio.n}
      </h3>

      <ul className="flex flex-col gap-xs text-xs leading-snug text-texto-primario">
        <li className="flex items-center gap-xs">
          <Icon nombre="account_balance" size={16} />
          {dependenciaGlosa(colegio.d)}
        </li>
        <li className="flex items-center gap-xs">
          <Icon nombre="format_line_spacing" size={16} />
          {nivelesGlosa(!!colegio.b, !!colegio.m, !!colegio.e)}
        </li>
        {lugar && (
          <li className="flex items-center gap-xs">
            <Icon nombre="map" size={16} />
            {lugar}
          </li>
        )}
      </ul>

      <ul aria-label="Características del colegio" className="flex flex-wrap gap-xs">
        {atributosDestacados(colegio).map((a) => (
          <li
            key={a.texto}
            className="inline-flex items-center gap-xxs border border-borde-enfatico bg-superficie-base px-xs py-xxs text-2xs leading-none text-texto-primario"
          >
            <Icon nombre={a.icono} size={12} />
            {a.texto}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-xs">
        <div className="flex gap-xs">
          <BotonEnlace
            href={`/colegio/${colegio.rbd}`}
            // active:!filter-none: el oscurecimiento global de «presionado» usa
            // `filter`, que encerraría el área extendida dentro del botón y el
            // clic sobre la tarjeta no abriría la ficha.
            className="px-m after:absolute after:inset-0 after:rounded-m after:content-[''] focus-visible:outline-none active:!filter-none"
          >
            Ver ficha<span className="sr-only"> de {colegio.n}</span>
          </BotonEnlace>
          <Boton
            variante="contorno"
            aria-pressed={enComparacion}
            aria-disabled={bloqueado || undefined}
            onClick={() => {
              if (bloqueado) {
                setAvisoLleno(true);
                return;
              }
              setAvisoLleno(false);
              onComparar();
            }}
            className={cn(
              "relative z-10 flex-1 gap-xs px-m",
              enComparacion && "bg-interaccion-tinte hover:bg-rdbu-05",
              bloqueado && "cursor-not-allowed border-borde-definido text-texto-secundario hover:bg-superficie-base"
            )}
          >
            Comparar<span className="sr-only"> {colegio.n}</span>
            <Icon nombre={enComparacion ? "check_box" : "content_paste_search"} filled={enComparacion} size={24} />
          </Boton>
        </div>
        {/* La región de estado existe siempre, para que el lector de pantalla
            anuncie el aviso cuando aparece. */}
        <p role="status" className="relative z-10 text-2xs text-texto-secundario empty:hidden">
          {avisoLleno && bloqueado
            ? `Ya tienes ${maximoComparar} colegios para comparar. Quita uno para agregar este.`
            : ""}
        </p>
      </div>
    </article>
  );
}
