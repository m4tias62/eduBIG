"use client";

import type { DetalleColegio } from "@/lib/types";
import { num } from "@/lib/data/detalle";
import { ModuloBase } from "./ModuloBase";

/**
 * Seguridad — denuncias formales ante la Superintendencia de Educación.
 * Un 0 se lee como 0 denuncias; un vacío, como año sin datos publicados (D20).
 */
export function ModuloSeguridad({ detalle }: { detalle: DetalleColegio }) {
  const mat = detalle.matricula_total;
  const anios = [2025, 2024, 2023, 2022];

  return (
    <ModuloBase
      icono="shield"
      titulo="Seguridad"
      conclusion={detalle.traduccion.lo_esencial.Seguridad}
      fuente="Fuente: Superintendencia de Educación · Denuncias 2022–2025."
    >
      <div className="flex flex-col gap-s">
        <h4 className="text-sm font-bold text-texto-primario">Denuncias formales ante la Superintendencia</h4>
        <table className="w-full text-xs">
          <caption className="sr-only">Denuncias por año</caption>
          <thead>
            <tr className="text-left text-2xs text-texto-secundario">
              <th scope="col" className="py-xxs font-medium">Año</th>
              <th scope="col" className="py-xxs font-medium">Denuncias</th>
              <th scope="col" className="py-xxs font-medium">Por cada 1.000 estudiantes</th>
            </tr>
          </thead>
          <tbody>
            {anios.map((a) => {
              const n = num(detalle, `denuncias_total_${a}`);
              return (
                <tr key={a} className="border-t border-borde-sutil">
                  <th scope="row" className="py-xs text-left font-bold text-texto-primario">{a}</th>
                  {n === undefined ? (
                    <td colSpan={2} className="py-xs italic text-texto-secundario">Sin datos publicados</td>
                  ) : (
                    <>
                      <td className="py-xs text-texto-primario">{n}</td>
                      <td className="py-xs text-texto-primario">
                        {mat ? ((n / mat) * 1000).toFixed(1).replace(".", ",") : "—"}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-2xs text-texto-secundario">
          La tasa usa la matrícula 2025 ({mat.toLocaleString("es-CL")} estudiantes) para todos los
          años. Una denuncia no es un hecho comprobado: es un reclamo formal ante la Superintendencia.
        </p>
      </div>
    </ModuloBase>
  );
}
