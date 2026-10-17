"use client";

import type { DetalleColegio } from "@/lib/types";
import { CURSOS, CURSO_GLOSA, grupoComparacion } from "@/lib/data/detalle";
import { construirColegio, MATERIAS, MATERIA_GLOSA, textoReferenciaGse } from "@/lib/data/comparacion";
import { conSigno } from "@/lib/viz";
import { ChipEstadoSimilares, LeyendaSimilares } from "@/components/viz/basicos";
import { TiraBrechas } from "@/components/viz/graficos";
import { ModuloBase } from "./ModuloBase";
import { InfoGrupo } from "./InfoGrupo";

/**
 * Académico — SIMCE 2025: diferencia con colegios similares (mismo grupo
 * socioeconómico de cada prueba, D18), por materia y curso. Escala fija ±56.
 *
 * Oct-2026 (mismas reglas que Comparar): el color depende solo de la
 * significancia de la Agencia (verde ↑ / mostaza ↓ con ±1; gris "a la par"
 * con 0, aunque la cifra no sea cero). La línea cero es "sus similares".
 * Estados sin comparación: sin SIMCE publicado (D19) o puntaje sin
 * comparación publicada por la Agencia (s/d con trama).
 */
export function ModuloAcademico({ detalle }: { detalle: DetalleColegio }) {
  const modelo = construirColegio(detalle, 1);
  const { materias, hayAlguno } = modelo.simce;
  const cursosConDato = CURSOS.filter((_, i) => MATERIAS.some((m) => materias[m][i].puntaje !== undefined));
  const hayComparacion = MATERIAS.some((m) => materias[m].some((c) => c.estado === "dato"));
  const referencia = textoReferenciaGse(modelo);

  return (
    <ModuloBase
      icono="menu_book"
      titulo="Académico"
      conclusion={detalle.traduccion.lo_esencial.Académico}
      fuente="Fuente: Agencia de Calidad de la Educación · SIMCE 2025 (4° y 8° básico, 2° medio)."
    >
      {!hayAlguno ? (
        <p className="text-xs text-texto-secundario">
          {detalle.tiene_gse
            ? "La Agencia de Calidad no publicó resultados SIMCE 2025 para este colegio."
            : "Este colegio no tiene SIMCE 2025 publicado, por eso no podemos compararlo con colegios similares. Suele pasar en colegios muy pequeños: la Agencia no publica resultados cuando rinden pocos estudiantes."}
        </p>
      ) : (
        <>
          {hayComparacion && (
            <div className="flex flex-col gap-m">
              <div className="flex flex-col gap-xs">
                <p className="text-xs text-texto-secundario">
                  Cada barra es la diferencia con colegios similares: sube = por sobre ellos, baja = por debajo.
                  Escala común a todos los colegios (±56 puntos).
                </p>
                {referencia && <p className="text-2xs text-texto-secundario">{referencia}</p>}
                <div aria-hidden className="flex flex-wrap gap-x-m gap-y-xxs text-2xs text-texto-secundario">
                  <LeyendaSimilares texto="sus similares (diferencia 0)" />
                  <span className="inline-flex items-center gap-xxs">
                    <span className="size-s bg-viz-sobre" />↑ sobre sus similares
                  </span>
                  <span className="inline-flex items-center gap-xxs">
                    <span className="size-s bg-viz-a-la-par" />= a la par
                  </span>
                  <span className="inline-flex items-center gap-xxs">
                    <span className="size-s bg-viz-bajo" />↓ bajo sus similares
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-xl lg:grid lg:grid-cols-2 lg:gap-x-xl">
                {MATERIAS.map((m) => (
                  <TiraBrechas
                    key={m}
                    tamano="ficha"
                    titulo={MATERIA_GLOSA[m]}
                    celdas={materias[m].filter((c) => cursosConDato.includes(c.curso))}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-s">
            <h4 className="text-sm font-bold text-texto-primario">Puntajes 2025</h4>
            {cursosConDato.map((curso) => {
              const i = CURSOS.indexOf(curso);
              return (
                <div key={curso} className="flex flex-col gap-xxs border-t border-borde-sutil pt-xs">
                  <div className="flex items-center gap-xs">
                    <p className="text-xs font-bold text-texto-primario">{CURSO_GLOSA[curso]}</p>
                    <InfoGrupo curso={CURSO_GLOSA[curso]} grupo={grupoComparacion(detalle, curso)} />
                  </div>
                  <ul className="flex flex-col gap-xs text-xs text-texto-primario">
                    {MATERIAS.map((m) => {
                      const c = materias[m][i];
                      if (c.puntaje === undefined) return null;
                      return (
                        <li key={m} className="grid grid-cols-[7rem_6rem_1fr] items-center gap-s">
                          <span>{MATERIA_GLOSA[m]}</span>
                          <span className="tabular-nums">
                            <strong>{c.puntaje}</strong> puntos
                          </span>
                          <span className="flex flex-wrap items-center gap-xs">
                            {c.dif !== undefined && (
                              <span className="tabular-nums text-texto-secundario">{conSigno(c.dif)} vs. similares</span>
                            )}
                            <ChipEstadoSimilares sig={c.estado === "dato" ? c.sig : null} />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </>
      )}
    </ModuloBase>
  );
}
