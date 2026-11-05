import { BotonEnlace } from "@/components/ui/Boton";
import { Icon } from "@/components/ui/Icon";
import type { ColegioIndice } from "@/lib/types";
import {
  costoEtiqueta,
  dependenciaGlosa,
  formatearDistancia,
  nivelesGlosa,
  type ReferenciaDistancia,
} from "@/lib/data/formatters";

/**
 * Tarjeta de la shortlist. Nace CÁLIDA (D08): el sistema la trajo para la
 * familia, y recién ahí aparecen las razones del calce.
 *
 * v3 (2026-11-05): tipografía, insignias y botón como la tarjeta de colegio
 * de la Home; conserva el borde cálido con volumen (D08).
 *
 * Variante `sinDatos` (D24): misma información de identidad, sin razones ni
 * puntaje, en tono neutro: el colegio pasa los filtros pero no tiene
 * comparación oficial con colegios similares.
 */
export function TarjetaColegio({
  colegio,
  distanciaKm,
  referencia,
  razones = [],
  sinDatos = false,
  posicion,
}: {
  colegio: ColegioIndice;
  distanciaKm: number;
  referencia: ReferenciaDistancia;
  razones?: string[];
  sinDatos?: boolean;
  posicion?: number;
}) {
  const costoSinDato = colegio.k === "sin_dato" || colegio.k === "pago_sin_monto" || colegio.k === "gratuito_ley";

  return (
    <article
      className={
        sinDatos
          ? "h-full rounded-m border border-borde-definido bg-superficie-base p-l flex flex-col gap-m"
          : "h-full rounded-m border-t-2 border-l-2 border-r-4 border-b-4 border-temp-calido-profundo bg-superficie-base p-l flex flex-col gap-m"
      }
    >
      <div className="flex items-start gap-s">
        {posicion !== undefined && (
          <span
            aria-hidden
            className="mt-xxs inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-temp-calido-suave text-2xs font-bold text-texto-primario"
          >
            {posicion}
          </span>
        )}
        <h3 className="font-heading text-sm font-semibold leading-snug tracking-[0.015em] text-texto-primario">{colegio.n}</h3>
      </div>

      <ul className="flex flex-col gap-xs text-xs text-texto-secundario">
        <li className="flex items-center gap-xs">
          <Icon nombre="account_balance" size={16} />
          {dependenciaGlosa(colegio.d)}
        </li>
        <li className="flex items-center gap-xs">
          <Icon nombre="school" size={16} />
          {nivelesGlosa(!!colegio.b, !!colegio.m, !!colegio.e)}
        </li>
        <li className="flex items-center gap-xs">
          <Icon nombre="place" size={16} />
          {formatearDistancia(distanciaKm, referencia)}
        </li>
        <li className="flex items-center gap-xs">
          <Icon nombre="monetization_on" size={16} />
          <span className={costoSinDato ? "italic" : undefined}>{costoEtiqueta(colegio.k, colegio.r)}</span>
        </li>
      </ul>

      {!sinDatos && razones.length > 0 && (
        <ul className="flex flex-wrap gap-xs" aria-label="Razones del calce">
          {razones.map((b) => (
            <li
              key={b}
              className="inline-flex items-center border border-borde-enfatico bg-superficie-base px-xs py-xxs text-2xs leading-none text-texto-primario"
            >
              {b}
            </li>
          ))}
        </ul>
      )}

      <BotonEnlace href={`/colegio/${colegio.rbd}`} className="mt-auto">
        Ver ficha<span className="sr-only"> de {colegio.n}</span>
      </BotonEnlace>
    </article>
  );
}
