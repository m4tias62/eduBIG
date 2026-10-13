"use client";

import type { Curso, DetalleColegio, DimensionIdps } from "@/lib/types";
import { CURSOS, CURSO_GLOSA, DIMENSIONES, grupoComparacion, num } from "@/lib/data/detalle";
import { ModuloBase } from "./ModuloBase";
import { BarraAbsolutaIdps } from "./charts/BarraAbsolutaIdps";
import { InfoGrupo } from "./InfoGrupo";

/**
 * Bienestar — 4 dimensiones IDPS (Agencia de Calidad), por curso evaluado
 * (4° y 8° básico, 2° medio). Barras absolutas 0–100: este colegio y
 * colegios similares (valor − diferencia con el grupo).
 * Las dimensiones se muestran por separado, nunca promediadas (D04).
 */
const DIM_META: Record<DimensionIdps, { titulo: string; tituloDetalle: string; descripcion: string }> = {
  clima: {
    titulo: "Clima escolar",
    tituloDetalle: "Clima escolar",
    descripcion: "Qué tan respetuosa y segura sienten la convivencia los estudiantes.",
  },
  autoestima: {
    titulo: "Autoestima académica y motivación escolar",
    tituloDetalle: "Autoestima académica",
    descripcion: "Qué tan capaces y motivados se sienten para aprender los estudiantes.",
  },
  habitos: {
    titulo: "Hábitos de vida saludable",
    tituloDetalle: "Hábitos de vida saludable",
    descripcion: "Cuánto promueve el colegio la alimentación sana, la actividad física y el autocuidado.",
  },
  participacion: {
    titulo: "Participación y formación ciudadana",
    tituloDetalle: "Participación y formación ciudadana",
    descripcion: "Cuánto participan los estudiantes y se sienten parte del colegio.",
  },
};

function valores(d: DetalleColegio, dim: DimensionIdps, curso: Curso) {
  const este = num(d, `idps_${dim}_${curso}_2025`);
  if (este === undefined) return null;
  const difgru = num(d, `idps_${dim}_${curso}_2025_difgru`);
  return { este, similares: difgru !== undefined ? este - difgru : null };
}

export function ModuloBienestar({ detalle }: { detalle: DetalleColegio }) {
  const hayAlguno = DIMENSIONES.some((dim) => CURSOS.some((c) => valores(detalle, dim, c)));

  return (
    <ModuloBase
      icono="mood"
      titulo="Bienestar"
      conclusion={detalle.traduccion.lo_esencial.Bienestar}
      fuente="Fuente: Agencia de Calidad de la Educación · IDPS 4° y 8° básico y 2° medio, 2025."
    >
      {!hayAlguno ? (
        <p className="text-xs text-texto-secundario">
          La Agencia de Calidad no publicó indicadores de desarrollo personal y social (IDPS) 2025
          para este colegio, por eso no podemos compararlo con colegios similares.
        </p>
      ) : (
        DIMENSIONES.map((dim) => {
          const meta = DIM_META[dim];
          const filas = CURSOS.map((curso) => ({ curso, v: valores(detalle, dim, curso) })).filter((f) => f.v);
          if (filas.length === 0) return null;
          const frase = detalle.traduccion.bienestar_detalle[meta.tituloDetalle];
          return (
            <section key={dim} className="flex flex-col gap-m">
              <div className="flex flex-col gap-xxs">
                <h4 className="text-sm font-bold text-texto-primario">{meta.titulo}</h4>
                <p className="text-2xs text-texto-secundario">{meta.descripcion}</p>
                {frase && <p className="text-xs text-texto-primario">{frase}</p>}
              </div>
              {filas.map(({ curso, v }) => (
                <div key={curso} className="flex flex-col gap-xxs">
                  <div className="flex items-center justify-between gap-xs">
                    <p className="text-xs font-bold text-texto-primario">{CURSO_GLOSA[curso]}</p>
                    <InfoGrupo curso={CURSO_GLOSA[curso]} grupo={grupoComparacion(detalle, curso)} />
                  </div>
                  <BarraAbsolutaIdps
                    este={v!.este}
                    similares={v!.similares}
                    descripcion={`${meta.titulo}, ${CURSO_GLOSA[curso]}: este colegio ${Math.round(v!.este)}${
                      v!.similares !== null ? `, colegios similares ${Math.round(v!.similares)}` : ", sin comparación publicada"
                    }.`}
                  />
                </div>
              ))}
            </section>
          );
        })
      )}
    </ModuloBase>
  );
}
