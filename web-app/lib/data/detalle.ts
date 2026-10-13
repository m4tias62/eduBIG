import type { Curso, DetalleColegio, DimensionIdps } from "@/lib/types";

/** Lectura tipada de campos numéricos del detalle (ausente = sin dato). */
export function num(d: DetalleColegio, campo: string): number | undefined {
  const v = d[campo];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

export function texto(d: DetalleColegio, campo: string): string | undefined {
  const v = d[campo];
  return typeof v === "string" && v ? v : undefined;
}

export const CURSOS: Curso[] = ["4b", "8b", "2m"];

export const CURSO_GLOSA: Record<Curso, string> = {
  "4b": "4° básico",
  "8b": "8° básico",
  "2m": "2° medio",
};

export const DIMENSIONES: DimensionIdps[] = ["clima", "autoestima", "habitos", "participacion"];

/** Etiqueta del grupo socioeconómico con el que la Agencia compara cada prueba. */
export function grupoComparacion(d: DetalleColegio, curso: Curso): string | undefined {
  return texto(d, `gse_${curso}_etiqueta`);
}
