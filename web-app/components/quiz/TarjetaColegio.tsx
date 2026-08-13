import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { Colegio, ConclusionesColegio } from "@/lib/types";
import type { ScoredColegio, RespuestasFamilia } from "@/lib/motor";
import { dependenciaGlosa, nivelesGlosa } from "@/lib/data/formatters";
import { razonesCalce, formatearDistancia } from "@/lib/quiz/razones";

/**
 * Tarjeta de resultado en el Shortlist. Espejo del componente Figma
 * "Tarjeta colegio / Estado=Calce":
 *   Nombre → Imagen → Meta (sostenedor, niveles, distancia) →
 *   Razones del calce (badges) → Acciones (Ver ficha / Comparar).
 *
 * Fondo superficie/base + borde temperatura/calido-profundo (2px) — el
 * borde cálido cumple función estructural sobre el fondo gris del
 * contenedor del Shortlist (confirmado por Matías post-rediseño).
 */
export function TarjetaColegio({
  scored,
  colegio,
  conclusiones,
  respuestas,
  desdeUsuario = false,
}: {
  scored: ScoredColegio;
  colegio: Colegio;
  conclusiones: ConclusionesColegio | null;
  respuestas: RespuestasFamilia;
  /** true → distancia medida desde la ubicación del usuario; false → desde Pudahuel. */
  desdeUsuario?: boolean;
}) {
  const nombre = conclusiones?.identidad.nombre ?? colegio.NOM_RBD;
  const badges = razonesCalce(scored, colegio, respuestas);

  return (
    <article className="rounded-m border-2 border-temp-calido-profundo bg-superficie-base p-l flex flex-col gap-m">
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
          {formatearDistancia(scored.distanciaKm, desdeUsuario ? "casa" : "pudahuel")}
        </li>
      </ul>

      {badges.length > 0 && (
        <ul className="flex flex-wrap gap-xs">
          {badges.map((b) => (
            <li
              key={b}
              className="rounded-s border border-borde-enfatico bg-superficie-base px-s py-xxs text-2xs text-texto-primario"
            >
              {b}
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-xs">
        <Link
          href={`/colegio/${colegio.rbd}`}
          className="flex-1 rounded-s bg-interaccion-enlace px-m py-xs text-center text-xs font-bold text-texto-sobre-oscuro hover:bg-interaccion-enlace-hover"
        >
          Ver ficha
        </Link>
        <button
          type="button"
          disabled
          className="rounded-s border border-borde-definido bg-superficie-base px-m py-xs text-xs font-medium text-texto-terciario cursor-not-allowed"
          title="Función pendiente"
        >
          Comparar
        </button>
      </div>
    </article>
  );
}
