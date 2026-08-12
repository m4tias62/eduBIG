"use client";

import type { Colegio } from "@/lib/types";
import { ModuloBase } from "./ModuloBase";
import {
  conclusionCosto,
  dependenciaGlosa,
  estadoCosto,
  formatearCopago,
} from "@/lib/data/formatters";

/**
 * Módulo Costo — espejo del component set Figma "Módulo Costo".
 * Datos: PAGO_MENSUAL, PAGO_MATRICULA, COD_DEPE del universo.
 * PIE excluido intencionalmente (será módulo mínimo aparte — decisión
 * registrada en bitácora 2026-08-12).
 */
export function ModuloCosto({ colegio }: { colegio: Colegio }) {
  const est = estadoCosto(colegio);
  const conclusion = conclusionCosto(colegio);
  const gratuito = est === "gratuito";

  return (
    <ModuloBase
      icono="monetization_on"
      titulo="Costo"
      conclusion={conclusion}
      fuente="Fuente: Directorio oficial Mineduc · Actualizado marzo 2026"
    >
      <div className="flex flex-col gap-m">
        <h4 className="text-sm font-bold text-texto-primario">Copago</h4>

        <div className="flex flex-col gap-xxs">
          <p className="text-xs font-bold text-texto-primario">Mensualidad</p>
          <p className="text-xs text-texto-primario">
            {gratuito ? "Gratuito" : formatearCopago(colegio.PAGO_MENSUAL)}
          </p>
        </div>

        <div className="flex flex-col gap-xxs">
          <p className="text-xs font-bold text-texto-primario">Matrícula</p>
          <p className="text-xs text-texto-primario">
            {gratuito ? "Gratuito" : formatearCopago(colegio.PAGO_MATRICULA)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-m">
        <h4 className="text-sm font-bold text-texto-primario">Financiamiento</h4>
        <p className="text-xs text-texto-primario">
          {dependenciaGlosa(colegio.COD_DEPE)}
        </p>
      </div>
    </ModuloBase>
  );
}
