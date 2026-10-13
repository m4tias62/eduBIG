import type { ColegioIndice } from "@/lib/types";
import type { Inclusion, Perfil, ScoresPorDimension, Alcance } from "./types";
import { calcularPesos } from "./pesos";

/**
 * Capa 2 — Puntaje ponderado (Weighted Sum Model).
 *
 * Normalización a escala nacional: percentil de cada colegio dentro de los
 * 8.250 colegios (0 = el valor más bajo del país, 1 = el más alto). El MVP
 * usaba min–max sobre 57 colegios; con miles de colegios el min–max queda
 * dominado por unos pocos extremos, y el percentil conserva la propiedad que
 * importaba: un mismo colegio tiene el mismo puntaje sin importar qué filtros
 * se aplicaron. Todos los insumos son diferencias con colegios similares
 * (D03), así que el percentil no premia el nivel socioeconómico.
 *
 * Datos faltantes: 0,5 (neutro), igual que el MVP. Los colegios sin ninguna
 * comparación no llegan acá: van al bloque aparte (D24).
 *
 * Distancia (solo con alcance "cualquiera"): e^(−d / 10 km). A 1 km vale 0,90;
 * a 5 km, 0,61; a 10 km, 0,37; a 30 km, 0,05.
 */

export const PESO_BONO_INCLUSION = 0.05;
export const ESCALA_DISTANCIA_KM = 10;
const NEUTRO = 0.5;

export interface Percentiles {
  academico: Float64Array;
  autoestima: Float64Array;
  habitos: Float64Array;
  participacion: Float64Array;
  clima: Float64Array;
  seguridad: Float64Array;
  superior: Float64Array;
  /** Posición de cada RBD en los arreglos. */
  posicion: Map<number, number>;
}

/** Percentil (0–1) de cada valor; empates comparten el rango promedio. NaN si falta. */
export function percentiles(valores: Array<number | undefined>, invertir = false): Float64Array {
  const out = new Float64Array(valores.length).fill(NaN);
  const idx: number[] = [];
  valores.forEach((v, i) => {
    if (v !== undefined && Number.isFinite(v)) idx.push(i);
  });
  const n = idx.length;
  if (n === 0) return out;
  if (n === 1) {
    out[idx[0]] = NEUTRO;
    return out;
  }
  idx.sort((a, b) => (valores[a] as number) - (valores[b] as number));
  let i = 0;
  while (i < n) {
    let j = i;
    while (j + 1 < n && valores[idx[j + 1]] === valores[idx[i]]) j++;
    const rango = (i + j) / 2 / (n - 1);
    for (let t = i; t <= j; t++) out[idx[t]] = invertir ? 1 - rango : rango;
    i = j + 1;
  }
  return out;
}

const cache = new WeakMap<ColegioIndice[], Percentiles>();

/** Percentiles sobre el universo completo (se calculan una vez por universo). */
export function getPercentiles(colegios: ColegioIndice[]): Percentiles {
  const previo = cache.get(colegios);
  if (previo) return previo;
  const p: Percentiles = {
    academico: percentiles(colegios.map((c) => c.s)),
    autoestima: percentiles(colegios.map((c) => c.ia)),
    habitos: percentiles(colegios.map((c) => c.ih)),
    participacion: percentiles(colegios.map((c) => c.ip)),
    clima: percentiles(colegios.map((c) => c.ic)),
    seguridad: percentiles(colegios.map((c) => c.dn), true),
    superior: percentiles(colegios.map((c) => c.tr)),
    posicion: new Map(colegios.map((c, i) => [c.rbd, i])),
  };
  cache.set(colegios, p);
  return p;
}

const fill = (v: number) => (Number.isFinite(v) ? v : NEUTRO);

export function scoreDistancia(distanciaKm: number): number {
  return Math.exp(-distanciaKm / ESCALA_DISTANCIA_KM);
}

export function calcularScores(
  c: ColegioIndice,
  distanciaKm: number,
  p: Percentiles
): ScoresPorDimension {
  const i = p.posicion.get(c.rbd);
  const at = (arr: Float64Array) => (i === undefined ? NEUTRO : fill(arr[i]));
  const clima = at(p.clima);
  const seguridad = at(p.seguridad);
  return {
    academico: at(p.academico),
    autoestima: at(p.autoestima),
    habitos: at(p.habitos),
    participacion: at(p.participacion),
    convivencia: (clima + seguridad) / 2,
    superior: at(p.superior),
    seguridad,
    distancia: scoreDistancia(distanciaKm),
  };
}

export function calcularScoreFinal(
  c: ColegioIndice,
  scores: ScoresPorDimension,
  r: { perfil: Perfil; inclusion: Inclusion; alcance: Alcance },
  incluyeSuperior: boolean
): number {
  const pesos = calcularPesos(r.perfil, incluyeSuperior, r.alcance);
  let score = 0;
  for (const [dim, peso] of Object.entries(pesos)) {
    score += (scores as unknown as Record<string, number>)[dim] * peso * (1 - PESO_BONO_INCLUSION);
  }
  if (r.inclusion === "entorno" && (c.p === 1 || c.e === 1)) score += PESO_BONO_INCLUSION;
  return score;
}
