"use client";

import type { Colegio, ConclusionesColegio } from "@/lib/types";
import { ModuloBase } from "./ModuloBase";

/**
 * Módulo Seguridad — denuncias formales ante la Superintendencia (Supereduc).
 * Muestra 2025 (año en curso) y 2024 (año anterior), incluyendo casos "sin dato".
 *
 * Tasa = conteo_denuncias / MAT_TOTAL × 100. Se agrega la nota de cautela
 * cuando la matrícula es baja — replicada del pipeline Python.
 */
export function ModuloSeguridad({
  colegio,
  conclusiones,
}: {
  colegio: Colegio;
  conclusiones: ConclusionesColegio | null;
}) {
  const conclusion =
    conclusiones?.modulos.Seguridad?.conclusion ??
    conclusiones?.lo_esencial.Seguridad ??
    "Información no publicada.";

  function fila(anio: number, conteo: number | null) {
    if (conteo === null) {
      return (
        <div className="flex flex-col gap-xxs px-m py-xs bg-superficie-elevada rounded-s">
          <p className="text-2xs text-texto-secundario">
            {anio}: la Superintendencia no publicó datos para este año
          </p>
        </div>
      );
    }
    const tasa = (conteo / colegio.MAT_TOTAL) * 100;
    return (
      <div className="flex flex-col gap-xxs">
        <p className="text-xs font-bold text-texto-primario">{anio}</p>
        <p className="text-xs text-texto-primario">
          {conteo} {conteo === 1 ? "denuncia" : "denuncias"} · {tasa.toFixed(2)} por cada 100 estudiantes ({colegio.MAT_TOTAL} matriculados)
        </p>
        {colegio.MAT_TOTAL < 300 && (
          <p className="text-2xs text-texto-secundario">
            En colegios con pocos estudiantes, una o dos denuncias pueden verse
            como una tasa alta. Considera el número junto a la tasa.
          </p>
        )}
      </div>
    );
  }

  return (
    <ModuloBase
      icono="shield"
      titulo="Seguridad"
      conclusion={conclusion}
      fuente="Fuente: Superintendencia de Educación · Denuncias 2024–2025"
    >
      <div className="flex flex-col gap-m">
        <h4 className="text-sm font-bold text-texto-primario">
          Denuncias formales ante la Superintendencia
        </h4>
        {fila(2025, colegio.conteo_denuncias_25)}
        {fila(2024, colegio.conteo_denuncias_24)}
      </div>
    </ModuloBase>
  );
}
