import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { ColegioIndice } from "@/lib/types";
import {
  costoEtiqueta,
  dependenciaGlosa,
  formatearDistancia,
  nivelesGlosa,
  pct,
  puntosPct,
  type ReferenciaDistancia,
} from "@/lib/data/formatters";

/**
 * Tarjeta de exploración (estado "preview", FRÍA): la familia la encontró
 * navegando. Toda la tarjeta es un enlace a la ficha.
 *
 * Con el orden por ingreso a la U (D33) muestra la tasa bruta y su
 * diferencia con colegios similares.
 */
export function TarjetaColegioBrowse({
  colegio,
  distanciaKm,
  referencia,
  nombreComuna,
  mostrarIngresoU = false,
}: {
  colegio: ColegioIndice;
  distanciaKm?: number;
  referencia?: ReferenciaDistancia;
  nombreComuna?: string;
  mostrarIngresoU?: boolean;
}) {
  return (
    <Link
      href={`/colegio/${colegio.rbd}`}
      className="rounded-m border-t-2 border-l-2 border-r-4 border-b-4 border-info-fuerte bg-superficie-base p-l flex flex-col gap-s hover:border-temp-calido-profundo focus-visible:border-temp-calido-profundo transition-colors"
    >
      <h3 className="text-sm font-bold text-texto-primario">{colegio.n}</h3>
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
          {distanciaKm !== undefined && referencia
            ? formatearDistancia(distanciaKm, referencia)
            : nombreComuna ?? ""}
        </li>
        <li className="flex items-center gap-xs">
          <Icon nombre="monetization_on" size={16} />
          {costoEtiqueta(colegio.k, colegio.r)}
        </li>
        {mostrarIngresoU && (
          <li className="flex items-center gap-xs text-texto-primario">
            <Icon nombre="trending_up" size={16} />
            {colegio.tu !== undefined ? (
              <span>
                Ingreso a la U: <strong>{pct(colegio.tu)}</strong>
                {colegio.tr !== undefined && (
                  <span className="text-texto-secundario"> · {puntosPct(colegio.tr)} vs. similares</span>
                )}
              </span>
            ) : (
              <span className="italic text-texto-secundario">Ingreso a la U: sin dato</span>
            )}
          </li>
        )}
      </ul>
    </Link>
  );
}
