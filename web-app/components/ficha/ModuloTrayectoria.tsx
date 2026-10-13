"use client";

import type { DetalleColegio } from "@/lib/types";
import { num } from "@/lib/data/detalle";
import { pct, puntosPct } from "@/lib/data/formatters";
import { ModuloBase } from "./ModuloBase";

/**
 * Trayectoria — ingreso a la universidad (D28): tasa bruta y relativa a
 * colegios similares (mismo grupo socioeconómico de 2° medio, D30).
 * La relativa la calcula Edubig con el GSE oficial; no tiene prueba de
 * significancia, por eso no se afirma "sobre" ni "bajo".
 */
export function ModuloTrayectoria({ detalle }: { detalle: DetalleColegio }) {
  const tasa = num(detalle, "tasa_ingreso_u_2025");
  const similares = num(detalle, "tasa_ingreso_u_similares_2025");
  const relativa = num(detalle, "tasa_ingreso_u_relativa_2025");
  const paes = num(detalle, "paes_prom_2025");
  const historia = [2022, 2023, 2024, 2025]
    .map((a) => ({ a, t: num(detalle, `tasa_ingreso_u_${a}`) }))
    .filter((x) => x.t !== undefined) as Array<{ a: number; t: number }>;

  return (
    <ModuloBase
      icono="trending_up"
      titulo="Ingreso a la universidad"
      conclusion={detalle.traduccion.lo_esencial.Trayectoria ?? "Sin datos publicados."}
      fuente="Fuente: PAES e ingreso a la universidad 2022–2025, compilados por Israel Rubilar a partir de datos públicos. Promedio de colegios similares: cálculo de Edubig con el grupo socioeconómico de 2° medio (Agencia de Calidad)."
    >
      {tasa === undefined ? (
        <p className="text-xs text-texto-secundario">
          No hay datos publicados de ingreso a la universidad para este colegio.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-s">
            <BarraTasa label="Este colegio" valor={tasa} clase="bg-viz-serie-este" />
            {similares !== undefined && (
              <BarraTasa label="Colegios similares" valor={similares} clase="bg-viz-serie-similares" />
            )}
            {relativa !== undefined && (
              <p className="text-xs text-texto-primario">
                Diferencia con colegios similares: <strong>{puntosPct(relativa)}</strong>
              </p>
            )}
            {similares === undefined && (
              <p className="text-2xs text-texto-secundario">
                Sin grupo socioeconómico de 2° medio: no podemos calcular el promedio de colegios similares.
              </p>
            )}
          </div>
          {historia.length > 1 && (
            <div className="flex flex-col gap-xxs">
              <h4 className="text-sm font-bold text-texto-primario">Tasa por año</h4>
              <p className="text-xs text-texto-primario">
                {historia.map((h) => `${h.a}: ${pct(h.t)}`).join(" · ")}
              </p>
            </div>
          )}
          {paes !== undefined && (
            <p className="text-xs text-texto-primario">
              Puntaje PAES promedio 2025: <strong>{Math.round(paes)}</strong>
            </p>
          )}
          <p className="text-2xs text-texto-secundario">
            Puede variar mucho en colegios con pocos egresados: el dato público no informa cuántos
            egresaron.
          </p>
        </>
      )}
    </ModuloBase>
  );
}

function BarraTasa({ label, valor, clase }: { label: string; valor: number; clase: string }) {
  return (
    <div className="flex items-center gap-s">
      <span className="w-[124px] shrink-0 text-[11px] text-texto-primario">{label}</span>
      <div className="relative h-3 flex-1 rounded-s bg-superficie-hundida" aria-hidden>
        <div className={`absolute inset-y-0 left-0 rounded-s ${clase}`} style={{ width: `${Math.min(100, valor * 100)}%` }} />
      </div>
      <span className="w-10 text-right text-[11px] font-bold text-texto-primario">{pct(valor)}</span>
    </div>
  );
}
