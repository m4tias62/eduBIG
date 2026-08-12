"use client";

import type { Colegio, ConclusionesColegio } from "@/lib/types";
import { ModuloBase } from "./ModuloBase";
import { BarraBrechaSimce } from "./charts/BarraBrechaSimce";

/**
 * Módulo Académico — brechas SIMCE vs. grupo de colegios similares
 * (mismo GSE), por materia y por curso.
 *
 * Cada barra: cuánto sube o baja el colegio respecto a sus similares
 * en Lectura y Matemática, en los cursos con datos.
 *
 * Escala universal FIJA de ±56 pts (registrada en bitácora): permite
 * comparar cualquier ficha con cualquier otra sin recalibrar la vista.
 */

type Curso = "4b" | "6b" | "8b" | "2m";

const CURSO_LABEL: Record<Curso, string> = {
  "4b": "4°b",
  "6b": "6°b",
  "8b": "8°b",
  "2m": "2°m",
};

function brechas(c: Colegio, materia: "lect" | "mate") {
  const cursos: Curso[] = ["4b", "6b", "8b", "2m"];
  return cursos.map((curso) => ({
    curso: CURSO_LABEL[curso],
    valor: c[`difgru_${materia}${curso}_rbd` as keyof Colegio] as number | null,
  }));
}

export function ModuloAcademico({
  colegio,
  conclusiones,
}: {
  colegio: Colegio;
  conclusiones: ConclusionesColegio | null;
}) {
  const conclusion =
    conclusiones?.modulos.Académico?.conclusion ??
    conclusiones?.lo_esencial.Académico ??
    "Información no publicada.";

  return (
    <ModuloBase
      icono="school"
      titulo="Académico"
      conclusion={conclusion}
      fuente={
        conclusiones?.modulos.Académico?.fuente ??
        "Fuente: Agencia de Calidad de la Educación · SIMCE 2024–2025."
      }
    >
      <p className="text-xs text-texto-secundario">
        Cada barra es la diferencia con colegios similares (mismo grupo socioeconómico):
        sube = por sobre ellos, baja = por debajo. Escala común a todos los colegios (±56 pts).
      </p>
      <BarraBrechaSimce titulo="Lectura" brechas={brechas(colegio, "lect")} />
      <BarraBrechaSimce titulo="Matemática" brechas={brechas(colegio, "mate")} />
    </ModuloBase>
  );
}
