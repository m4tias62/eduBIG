"use client";

import type { DetalleColegio } from "@/lib/types";
import { dependenciaGlosa, pagoGlosa } from "@/lib/data/formatters";
import { ModuloBase } from "./ModuloBase";

/**
 * Costo — Directorio Oficial 2025 (Mineduc). Sin dato de copago, el trato
 * depende de la dependencia (D36): gratuito por ley, pagado sin monto o
 * "sin dato de costo".
 */
export function ModuloCosto({ detalle }: { detalle: DetalleColegio }) {
  const k = detalle.estado_costo;
  const notaD36: Record<string, string> = {
    gratuito_ley:
      "El Mineduc no informa el pago de este colegio. Por ser público, la Ley de Inclusión (20.845) no le permite cobrar copago.",
    pago_sin_monto: "El Mineduc no informa el monto de la mensualidad de este colegio particular pagado.",
    sin_dato: "El Mineduc no informa si este colegio cobra copago. Consulta directamente en el colegio.",
  };

  return (
    <ModuloBase
      icono="monetization_on"
      titulo="Costo"
      conclusion={detalle.traduccion.lo_esencial.Costo}
      fuente="Fuente: Directorio Oficial de Establecimientos 2025 (Mineduc)."
    >
      <div className="flex flex-col gap-s">
        <div className="flex flex-col gap-xxs">
          <p className="text-xs font-bold text-texto-primario">Mensualidad</p>
          <p className="text-xs text-texto-primario">
            {k === "gratuito_ley" ? "Gratuito por ley" : pagoGlosa(detalle.pago_mensual)}
          </p>
        </div>
        <div className="flex flex-col gap-xxs">
          <p className="text-xs font-bold text-texto-primario">Matrícula</p>
          <p className="text-xs text-texto-primario">{pagoGlosa(detalle.pago_matricula)}</p>
        </div>
        {notaD36[k] && <p className="text-2xs text-texto-secundario">{notaD36[k]}</p>}
      </div>
      <div className="flex flex-col gap-xxs">
        <p className="text-xs font-bold text-texto-primario">Financiamiento</p>
        <p className="text-xs text-texto-primario">{dependenciaGlosa(detalle.dependencia_cod)}</p>
      </div>
    </ModuloBase>
  );
}
