import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { Colegio, ConclusionesColegio } from "@/lib/types";
import { dependenciaGlosa, nivelesGlosa } from "@/lib/data/formatters";
import { formatearDistancia } from "@/lib/quiz/razones";

/**
 * Tarjeta de colegio para vista Lista de la Home (browse mode).
 * Espejo del componente Figma "Tarjeta colegio / Estado=Preview":
 *   Nombre → Imagen → Meta (sostenedor, niveles, distancia).
 *
 * Diferencia con TarjetaColegio del Shortlist:
 *  - Sin badges "razones del calce" (no viene del motor).
 *  - Sin fondo/borde cálido (fondo base sobre gris del contenedor).
 *  - Card completa es un Link a la ficha (no botones separados).
 */
export function TarjetaColegioBrowse({
  colegio,
  conclusiones,
  distanciaKm,
}: {
  colegio: Colegio;
  conclusiones?: ConclusionesColegio | null;
  distanciaKm: number;
}) {
  const nombre = conclusiones?.identidad.nombre ?? colegio.NOM_RBD;

  return (
    <Link
      href={`/colegio/${colegio.rbd}`}
      className="rounded-m border border-borde-sutil bg-superficie-base p-l flex flex-col gap-m hover:border-borde-definido transition-colors"
    >
      <h3 className="text-sm font-bold text-texto-primario">{nombre}</h3>

      <div className="w-full aspect-video rounded-s bg-superficie-hundida border border-borde-sutil flex items-center justify-center">
        <Icon nombre="apartment" size={40} className="text-texto-terciario" />
      </div>

      <ul className="flex flex-col gap-xs text-xs text-texto-secundario">
        <li className="flex items-center gap-xs">
          <Icon nombre="monetization_on" size={16} />
          {dependenciaGlosa(colegio.COD_DEPE)}
        </li>
        <li className="flex items-center gap-xs">
          <Icon nombre="school" size={16} />
          {nivelesGlosa(colegio.ofrece_basica, colegio.ofrece_media)}
        </li>
        <li className="flex items-center gap-xs">
          <Icon nombre="place" size={16} />
          {formatearDistancia(distanciaKm)}
        </li>
      </ul>
    </Link>
  );
}
