"use client";

import type { Curso, DetalleColegio } from "@/lib/types";
import { CURSOS, CURSO_GLOSA, grupoComparacion, num } from "@/lib/data/detalle";
import { ModuloBase } from "./ModuloBase";
import { BarraBrechaSimce } from "./charts/BarraBrechaSimce";
import { InfoGrupo } from "./InfoGrupo";

/**
 * Académico — SIMCE 2025: diferencia con colegios similares (mismo grupo
 * socioeconómico de cada prueba, D18), por materia y curso. Escala fija ±56.
 * Estados sin comparación: sin SIMCE publicado (D19) o puntaje sin
 * comparación publicada por la Agencia.
 */
type Materia = "lect" | "mate";
const MATERIA_GLOSA: Record<Materia, string> = { lect: "Lectura", mate: "Matemática" };
const CURSO_CORTO: Record<Curso, string> = { "4b": "4° b", "8b": "8° b", "2m": "2° m" };

export function ModuloAcademico({ detalle }: { detalle: DetalleColegio }) {
  const celdas = CURSOS.flatMap((curso) =>
    (["lect", "mate"] as Materia[]).map((m) => ({
      curso,
      m,
      puntaje: num(detalle, `simce_${m}_${curso}_2025`),
      dif: num(detalle, `simce_${m}_${curso}_2025_difgru`),
    }))
  );
  const conPuntaje = celdas.filter((c) => c.puntaje !== undefined);
  const cursosConDato = CURSOS.filter((c) => conPuntaje.some((x) => x.curso === c));
  const hayComparacion = celdas.some((c) => c.dif !== undefined);

  return (
    <ModuloBase
      icono="menu_book"
      titulo="Académico"
      conclusion={detalle.traduccion.lo_esencial.Académico}
      fuente="Fuente: Agencia de Calidad de la Educación · SIMCE 2025 (4° y 8° básico, 2° medio)."
    >
      {conPuntaje.length === 0 ? (
        <p className="text-xs text-texto-secundario">
          {detalle.tiene_gse
            ? "La Agencia de Calidad no publicó resultados SIMCE 2025 para este colegio."
            : "Este colegio no tiene SIMCE 2025 publicado, por eso no podemos compararlo con colegios similares. Suele pasar en colegios muy pequeños: la Agencia no publica resultados cuando rinden pocos estudiantes."}
        </p>
      ) : (
        <>
          {hayComparacion && (
            <>
              <p className="text-xs text-texto-secundario">
                Cada barra es la diferencia con colegios similares: sube = por sobre ellos, baja = por
                debajo. Escala común a todos los colegios (±56 puntos).
              </p>
              {(["lect", "mate"] as Materia[]).map((m) => (
                <BarraBrechaSimce
                  key={m}
                  titulo={MATERIA_GLOSA[m]}
                  brechas={cursosConDato.map((curso) => ({
                    curso: CURSO_CORTO[curso],
                    valor: celdas.find((c) => c.curso === curso && c.m === m)?.dif ?? null,
                  }))}
                />
              ))}
            </>
          )}

          <div className="flex flex-col gap-s">
            <h4 className="text-sm font-bold text-texto-primario">Puntajes 2025</h4>
            {cursosConDato.map((curso) => (
              <div key={curso} className="flex flex-col gap-xxs border-t border-borde-sutil pt-xs">
                <div className="flex items-center justify-between gap-xs">
                  <p className="text-xs font-bold text-texto-primario">{CURSO_GLOSA[curso]}</p>
                  <InfoGrupo curso={CURSO_GLOSA[curso]} grupo={grupoComparacion(detalle, curso)} />
                </div>
                <ul className="flex flex-col gap-xxs text-xs text-texto-primario">
                  {(["lect", "mate"] as Materia[]).map((m) => {
                    const c = celdas.find((x) => x.curso === curso && x.m === m)!;
                    if (c.puntaje === undefined) return null;
                    return (
                      <li key={m} className="flex justify-between gap-s">
                        <span>
                          {MATERIA_GLOSA[m]}: <strong>{c.puntaje}</strong> puntos
                        </span>
                        <span className="text-texto-secundario">
                          {c.dif === undefined
                            ? "sin comparación publicada"
                            : `${c.dif > 0 ? "+" : c.dif < 0 ? "−" : ""}${Math.abs(c.dif)} vs. similares`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </ModuloBase>
  );
}
