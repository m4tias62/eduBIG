"use client";

import type { Colegio, ConclusionesColegio } from "@/lib/types";
import { ModuloBase } from "./ModuloBase";
import { BarraAbsolutaIdps } from "./charts/BarraAbsolutaIdps";

/**
 * Módulo Bienestar — 4 dimensiones IDPS medidas por la Agencia de Calidad:
 * Clima escolar, Autoestima académica, Hábitos de vida saludable,
 * Participación y formación ciudadana.
 *
 * Cada dimensión tiene subsecciones por curso evaluado (4°b, 8°b, 2°m).
 * Cada subsección renderiza barras absolutas 0–100 comparando este colegio
 * vs. similares (prom − difgru) vs. nacional (prom − dif).
 *
 * Diseño confirmado en bitácora: barras absolutas (no brechas) —
 * la naturaleza del IDPS lo justifica.
 */

type Dim = "clima" | "autoestima" | "habitos" | "participacion";
type Curso = "4b" | "8b" | "2m";

const DIM_META: Record<Dim, { titulo: string; descripcion: string }> = {
  clima: {
    titulo: "Clima escolar",
    descripcion: "Qué tan respetuosa y segura sienten la convivencia los estudiantes.",
  },
  autoestima: {
    titulo: "Autoestima académica y motivación escolar",
    descripcion: "Qué tan capaces y motivados se sienten para aprender los estudiantes.",
  },
  habitos: {
    titulo: "Hábitos de vida saludable",
    descripcion: "Cuánto promueve el colegio la alimentación sana, la actividad física y la autonomía.",
  },
  participacion: {
    titulo: "Participación y formación ciudadana",
    descripcion: "Cuánto participan los estudiantes y se sienten parte del colegio.",
  },
};

const CURSO_LABEL: Record<Curso, string> = {
  "4b": "4° básico",
  "8b": "8° básico",
  "2m": "2° medio",
};

function valoresDimension(
  c: Colegio,
  dim: Dim,
  curso: Curso
): { este: number | null; similares: number | null; nacional: number | null } | null {
  const prom = c[`${dim}_prom_${curso}` as keyof Colegio] as number | null;
  const dif = c[`${dim}_dif_${curso}` as keyof Colegio] as number | null;
  const difgru = c[`${dim}_difgru_${curso}` as keyof Colegio] as number | null;
  if (prom === null) return null;
  return {
    este: prom,
    similares: difgru !== null ? prom - difgru : null,
    nacional: dif !== null ? prom - dif : null,
  };
}

export function ModuloBienestar({
  colegio,
  conclusiones,
}: {
  colegio: Colegio;
  conclusiones: ConclusionesColegio | null;
}) {
  const conclusion =
    conclusiones?.modulos.Bienestar?.conclusion ??
    conclusiones?.lo_esencial.Bienestar ??
    "Información no publicada.";

  const dimensiones: Dim[] = ["clima", "autoestima", "habitos", "participacion"];
  const cursos: Curso[] = ["4b", "8b", "2m"];

  return (
    <ModuloBase
      icono="mood"
      titulo="Bienestar"
      conclusion={conclusion}
      fuente={
        conclusiones?.modulos.Bienestar?.fuente ??
        "Fuente: Agencia de Calidad de la Educación · IDPS 4° y 8° básico, 2° medio."
      }
    >
      {dimensiones.map((dim) => {
        const meta = DIM_META[dim];
        // solo mostramos los cursos con al menos un dato
        const filas = cursos
          .map((curso) => ({ curso, valores: valoresDimension(colegio, dim, curso) }))
          .filter((f) => f.valores !== null);

        if (filas.length === 0) return null;

        return (
          <section key={dim} className="flex flex-col gap-m">
            <div className="flex flex-col gap-xxs">
              <h4 className="text-sm font-bold text-texto-primario">{meta.titulo}</h4>
              <p className="text-2xs text-texto-secundario">{meta.descripcion}</p>
            </div>
            {filas.map(({ curso, valores }) => (
              <div key={curso} className="flex flex-col gap-xs">
                <p className="text-xs font-bold text-texto-primario">{CURSO_LABEL[curso]}</p>
                <BarraAbsolutaIdps
                  este={valores!.este}
                  similares={valores!.similares}
                  nacional={valores!.nacional}
                />
              </div>
            ))}
          </section>
        );
      })}
    </ModuloBase>
  );
}
