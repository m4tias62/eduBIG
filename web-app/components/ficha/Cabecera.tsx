import type { DetalleColegio } from "@/lib/types";
import { dependenciaGlosa, matriculaGlosa, nivelesGlosa } from "@/lib/data/formatters";
import { Icon } from "@/components/ui/Icon";
import { BotonComparar } from "./BotonComparar";

/** Cabecera de la ficha: nombre + identidad + agregar a la comparación (D32). */
export function Cabecera({ detalle }: { detalle: DetalleColegio }) {
  return (
    <section className="flex flex-col gap-m">
      <div className="flex flex-col gap-xxs">
        <p className="text-2xs text-texto-secundario">
          {detalle.comuna} · Región {detalle.region_nombre} · RBD {detalle.rbd}
        </p>
        <h1 className="text-lg font-bold text-texto-primario">{detalle.nombre}</h1>
      </div>
      <ul className="flex flex-col gap-xs text-xs text-texto-secundario">
        <li className="flex items-center gap-xs">
          <Icon nombre="account_balance" size={16} />
          {dependenciaGlosa(detalle.dependencia_cod)}
        </li>
        <li className="flex items-center gap-xs">
          <Icon nombre="school" size={16} />
          {nivelesGlosa(detalle.ofrece_basica, detalle.ofrece_media, detalle.ofrece_especial)}
          {detalle.ofrece_media &&
            (detalle.ofrece_media_hc && detalle.ofrece_media_tp
              ? " · científico-humanista y técnico-profesional"
              : detalle.ofrece_media_tp
                ? " · técnico-profesional"
                : " · científico-humanista")}
        </li>
        <li className="flex items-center gap-xs">
          <Icon nombre="groups" size={16} />
          {matriculaGlosa(detalle.matricula_total)}
        </li>
        {detalle.pie && (
          <li className="flex items-center gap-xs">
            <Icon nombre="diversity_1" size={16} />
            Programa de Integración Escolar (PIE)
          </li>
        )}
      </ul>
      <BotonComparar rbd={detalle.rbd} nombre={detalle.nombre} />
    </section>
  );
}
