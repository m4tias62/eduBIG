"use client";

import { forwardRef, type ReactNode } from "react";
import { CURSOS, CURSO_GLOSA } from "@/lib/data/detalle";
import { DIMS_COMPARAR, MATERIAS, MATERIA_GLOSA, type CeldaSimce, type ColegioComparado } from "@/lib/data/comparacion";
import { pct } from "@/lib/data/formatters";
import { conSigno, estadoSig } from "@/lib/viz";
import { Icon } from "@/components/ui/Icon";

/**
 * "Ver como tabla de datos": todos los valores por curso en tablas simples,
 * equivalente textual de los gráficos (WCAG 1.1.1).
 */

function textoSimce(c: CeldaSimce): string {
  if (c.estado === "no_imparte") return "No imparte";
  if (c.estado === "sin_dato") return "Sin datos publicados";
  if (c.estado === "sin_comparacion") return `${c.puntaje} · sin comparación publicada`;
  return `${c.puntaje} · ${conSigno(c.dif!)} (${estadoSig(c.sig).texto})`;
}

function Tabla({
  titulo,
  colegios,
  filas,
}: {
  titulo: string;
  colegios: ColegioComparado[];
  filas: Array<{ label: string; valores: ReactNode[] }>;
}) {
  return (
    <div className="overflow-x-auto" role="region" aria-label={titulo} tabIndex={0}>
      <table className="w-full min-w-[40rem] border-collapse text-xs">
        <caption className="pb-m text-left font-heading text-sm font-bold">{titulo}</caption>
        <thead>
          <tr className="border-b-2 border-texto-primario">
            <th scope="col" className="py-xs pr-m text-left font-medium text-texto-secundario">
              Dato
            </th>
            {colegios.map((c) => (
              <th key={c.rbd} scope="col" className="py-xs pr-m text-left font-bold">
                {c.posicion}. {c.nombre}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.label} className="border-b border-borde-sutil">
              <th scope="row" className="py-xs pr-m text-left font-normal text-texto-secundario">
                {f.label}
              </th>
              {f.valores.map((v, i) => (
                <td key={i} className="py-xs pr-m tabular-nums">
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const TablaDatos = forwardRef<HTMLDetailsElement, { colegios: ColegioComparado[] }>(function TablaDatos(
  { colegios },
  ref
) {
  const seguridad = [2022, 2023, 2024, 2025].map((ano, i) => ({
    label: `Denuncias ${ano}`,
    valores: colegios.map((c) => c.seguridad.anos[i].n ?? "Sin datos publicados"),
  }));
  const bienestar = CURSOS.flatMap((curso) =>
    DIMS_COMPARAR.map(({ dim, label }) => ({
      label: `${label} · ${CURSO_GLOSA[curso]}`,
      valores: colegios.map((c) => {
        const b = c.bienestar[curso];
        if (b.estado === "no_imparte") return "No imparte";
        const d = b.dims.find((x) => x.dim === dim);
        if (!d) return "Sin datos publicados";
        return d.similares === null
          ? `${d.valor} · sin comparación publicada`
          : `${d.valor} · similares ${Math.round(d.similares)} (${estadoSig(d.sig).texto})`;
      }),
    }))
  );
  const simce = CURSOS.flatMap((curso, ci) =>
    MATERIAS.map((m) => ({
      label: `${MATERIA_GLOSA[m]} · ${CURSO_GLOSA[curso]}`,
      valores: colegios.map((c) => textoSimce(c.simce.materias[m][ci])),
    }))
  );
  const universidad = [
    {
      label: "Ingreso a la universidad 2025",
      valores: colegios.map((c) =>
        c.universidad.estado === "no_imparte" ? "No imparte media" : c.universidad.tasa !== undefined ? pct(c.universidad.tasa) : "Sin datos publicados"
      ),
    },
    {
      label: "Sus similares",
      valores: colegios.map((c) => (c.universidad.similares !== undefined ? pct(c.universidad.similares) : "—")),
    },
    {
      label: "PAES promedio 2025",
      valores: colegios.map((c) => (c.universidad.paes !== undefined ? Math.round(c.universidad.paes) : "—")),
    },
  ];
  const costo = [
    { label: "Mensualidad", valores: colegios.map((c) => c.costo.mensualGlosa) },
    { label: "Matrícula", valores: colegios.map((c) => c.costo.matriculaGlosa) },
  ];

  return (
    <details ref={ref} id="tabla-datos" className="mt-xl border-t border-borde-sutil pt-l">
      <summary className="inline-flex min-h-objetivo-tactil cursor-pointer list-none items-center gap-xs -ml-xs rounded-s px-xs font-heading text-md font-bold transition-colors hover:bg-superficie-elevada [&::-webkit-details-marker]:hidden">
        <Icon nombre="table_view" size={24} />
        Tabla de datos
        <Icon nombre="expand_more" size={20} />
      </summary>
      <div className="mt-l flex flex-col gap-xxl">
        <Tabla titulo="Seguridad" colegios={colegios} filas={seguridad} />
        <Tabla titulo="Bienestar (IDPS 2025)" colegios={colegios} filas={bienestar} />
        <Tabla titulo="Académico (SIMCE 2025): puntaje y diferencia con sus similares" colegios={colegios} filas={simce} />
        {colegios.some((c) => c.ofreceMedia) && (
          <Tabla titulo="Ingreso a la universidad" colegios={colegios} filas={universidad} />
        )}
        <Tabla titulo="Costo" colegios={colegios} filas={costo} />
      </div>
    </details>
  );
});
