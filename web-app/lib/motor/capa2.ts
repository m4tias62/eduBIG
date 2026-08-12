import type { Colegio } from "@/lib/types";
import type { RespuestasFamilia, ScoresPorDimension } from "./types";
import { distanciaKm } from "./haversine";
import { calcularPesosFinales } from "./pesos";

/**
 * Capa 2 — Scoring ponderado.
 *
 * Espejo exacto del notebook 04_scoring_engine.ipynb. Diferencias intencionales
 * con Python son marcadas explícitamente con comentarios.
 */

const PESO_BONO_INCLUSION = 0.05;

/** Normaliza min-max sobre una serie. Si invertir, retorna 1-x (mayor = mejor). */
function normalizar(valores: number[], invertir = false): number[] {
  const validos = valores.filter((v) => Number.isFinite(v));
  if (validos.length === 0) return valores.map(() => NaN);
  const min = Math.min(...validos);
  const max = Math.max(...validos);
  const range = max - min;
  return valores.map((v) => {
    if (!Number.isFinite(v)) return NaN;
    if (range === 0) return 0.5;
    const n = (v - min) / range;
    return invertir ? 1 - n : n;
  });
}

/** Reemplaza NaN por un valor por defecto (equivalente a pandas .fillna). */
function fillna(valores: number[], defecto: number): number[] {
  return valores.map((v) => (Number.isFinite(v) ? v : defecto));
}

/** Promedio de columnas cuyo nombre comienza con prefijo + "_difgru_".
 *  Ignora NaN en el promedio (equivalente a df[cols].mean(axis=1) con skipna). */
function promedioDimension(colegio: Colegio, prefijo: string): number {
  const keys = Object.keys(colegio).filter((k) =>
    k.startsWith(`${prefijo}_difgru_`)
  );
  const vals = keys
    .map((k) => (colegio as unknown as Record<string, number | null>)[k])
    .filter((v): v is number => v !== null && Number.isFinite(v));
  if (vals.length === 0) return NaN;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/** Promedio SIMCE — todas las columnas difgru_* (todas las materias, todos los cursos). */
function promedioSimce(colegio: Colegio): number {
  const keys = Object.keys(colegio).filter((k) => k.startsWith("difgru_"));
  const vals = keys
    .map((k) => (colegio as unknown as Record<string, number | null>)[k])
    .filter((v): v is number => v !== null && Number.isFinite(v));
  if (vals.length === 0) return NaN;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/** Tasa de denuncias por 100 estudiantes, promedio 2024+2025.
 *  Denuncias null se tratan como 0 (mismo criterio que el pipeline). */
function tasaDenuncias(colegio: Colegio): number {
  const c24 = colegio.conteo_denuncias_24 ?? 0;
  const c25 = colegio.conteo_denuncias_25 ?? 0;
  const mat = colegio.MAT_TOTAL;
  if (!mat || mat === 0) return NaN;
  const tasa24 = (c24 / mat) * 100;
  const tasa25 = (c25 / mat) * 100;
  return (tasa24 + tasa25) / 2;
}

/**
 * Precalcula scores por dimensión sobre el universo completo.
 * Las normalizaciones se hacen sobre TODO el universo (min/max globales),
 * no sobre elegibles — esto es intencional: garantiza que un mismo colegio
 * tenga el mismo score independientemente del subset filtrado.
 *
 * La distancia depende de lat/lon del sector, por lo que scores DEBEN
 * recalcularse cada vez que corren distintas respuestas familiares.
 */
export function calcularScoresUniverso(
  universo: Colegio[],
  prefs: RespuestasFamilia
): Map<number, ScoresPorDimension & { distanciaKm: number }> {
  // 1. Valores crudos por colegio
  const distancias = universo.map((c) =>
    distanciaKm(c.LATITUD, c.LONGITUD, prefs.latSector, prefs.lonSector)
  );
  const simcePromedio = universo.map(promedioSimce);
  const tasasDenuncias = universo.map(tasaDenuncias);
  const autoestimaPromedio = universo.map((c) => promedioDimension(c, "autoestima"));
  const habitosPromedio = universo.map((c) => promedioDimension(c, "habitos"));
  const participacionPromedio = universo.map((c) => promedioDimension(c, "participacion"));
  const climaPromedio = universo.map((c) => promedioDimension(c, "clima"));

  // 2. Normalización (min-max sobre universo completo)
  const scoreAcademico = fillna(normalizar(simcePromedio), 0.5);
  const scoreSeguridad = normalizar(tasasDenuncias, true); // sin fillna — espejo Python
  const scoreDistancia = normalizar(distancias, true);
  const scoreAutoestima = fillna(normalizar(autoestimaPromedio), 0.5);
  const scoreHabitos = fillna(normalizar(habitosPromedio), 0.5);
  const scoreParticipacion = fillna(normalizar(participacionPromedio), 0.5);
  const scoreClima = fillna(normalizar(climaPromedio), 0.5);

  // 3. Convivencia = (clima IDPS + seguridad denuncias) / 2
  const scoreConvivencia = scoreClima.map((c, i) => (c + scoreSeguridad[i]) / 2);

  // 4. Empaquetar por RBD
  const out = new Map<number, ScoresPorDimension & { distanciaKm: number }>();
  universo.forEach((c, i) => {
    out.set(c.rbd, {
      academico: scoreAcademico[i],
      autoestima: scoreAutoestima[i],
      habitos: scoreHabitos[i],
      participacion: scoreParticipacion[i],
      convivencia: scoreConvivencia[i],
      seguridad: scoreSeguridad[i],
      distancia: scoreDistancia[i],
      distanciaKm: distancias[i],
    });
  });
  return out;
}

/** Score final compuesto para un colegio dado su set de scores + preferencias. */
export function calcularScoreFinal(
  colegio: Colegio,
  scores: ScoresPorDimension,
  prefs: RespuestasFamilia
): number {
  let pesos = calcularPesosFinales(prefs.perfil, prefs.tipoDistancia);
  // Reserva 5% para el bono de inclusión
  const pesosBonoAjustados: Record<string, number> = {};
  for (const [k, v] of Object.entries(pesos)) {
    pesosBonoAjustados[k] = v * (1 - PESO_BONO_INCLUSION);
  }
  let score = 0;
  for (const [dim, peso] of Object.entries(pesosBonoAjustados)) {
    score += (scores as unknown as Record<string, number>)[dim] * peso;
  }
  if (
    prefs.quiereInclusion &&
    (colegio.ofrece_educacion_especial || colegio.CONVENIO_PIE === 1)
  ) {
    score += PESO_BONO_INCLUSION;
  }
  return score;
}
