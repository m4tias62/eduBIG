import type { DetalleColegio } from "@/lib/types";
import { dependenciaGlosa, matriculaGlosa, nivelesGlosa } from "@/lib/data/formatters";
import { Icon } from "@/components/ui/Icon";
import { BotonComparar } from "./BotonComparar";

/**
 * Cabecera de la ficha: nombre + identidad + agregar a la comparación (D32).
 *
 * v3 (Matías, 2026-11-09, Figma «Rediseño de información izq de la ficha»,
 * 980:3556): nombre primero, en Work Sans 32 negrita; debajo, comuna, región y
 * RBD en 14 px gris (16 px de separación). Datos del colegio en 16 px y color
 * de texto principal, con su ícono (anotación: «deben tener sus respectivos
 * íconos»), 8 px entre ítems y 24 px entre bloques.
 */
export function Cabecera({ detalle }: { detalle: DetalleColegio }) {
  return (
    <section className="flex flex-col gap-l">
      <div className="flex flex-col gap-m">
        <h1 className="text-lg font-bold tracking-[0.015em] text-texto-primario lg:text-xl">{detalle.nombre}</h1>
        <p className="text-xs tracking-[0.015em] text-texto-secundario">
          {detalle.comuna} · Región {detalle.region_nombre} · RBD {detalle.rbd}
        </p>
      </div>
      <ul className="flex flex-col gap-xs text-sm tracking-[0.015em] text-texto-primario">
        <li className="flex items-center gap-xs">
          <Icon nombre="account_balance" size={20} />
          {dependenciaGlosa(detalle.dependencia_cod)}
        </li>
        <li className="flex items-center gap-xs">
          <Icon nombre="school" size={20} />
          {nivelesGlosa(detalle.ofrece_basica, detalle.ofrece_media, detalle.ofrece_especial)}
          {detalle.ofrece_media &&
            (detalle.ofrece_media_hc && detalle.ofrece_media_tp
              ? " · científico-humanista y técnico-profesional"
              : detalle.ofrece_media_tp
                ? " · técnico-profesional"
                : " · científico-humanista")}
        </li>
        <li className="flex items-center gap-xs">
          <Icon nombre="groups" size={20} />
          {matriculaGlosa(detalle.matricula_total)}
        </li>
        {detalle.pie && (
          <li className="flex items-center gap-xs">
            <Icon nombre="diversity_1" size={20} />
            Programa de Integración Escolar (PIE)
          </li>
        )}
      </ul>
      <BotonComparar rbd={detalle.rbd} nombre={detalle.nombre} />
    </section>
  );
}
