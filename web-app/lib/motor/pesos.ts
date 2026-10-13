import type { Alcance, Dimension, Perfil } from "./types";

/**
 * Pesos del Weighted Sum Model.
 *
 * - La dimensión elegida en Q5 lleva 50 %; las demás se reparten 20 %;
 *   la distancia, 30 %. Sin media: 5 dimensiones (50 + 4 × 5 + 30).
 *   Con media o ambos niveles: se suma "superior" (D30) → 50 + 5 × 4 + 30.
 * - "Todo por igual" reparte 70 % en partes iguales (D35): 14 % con 5
 *   dimensiones, ~11,7 % con 6.
 * - Si el alcance es un filtro duro (1 km, 3 km, mi comuna, cercanas), la
 *   distancia ya se aplicó en Capa 1: su peso se retira y el resto se
 *   renormaliza (igual que el MVP).
 */

export const PESO_DISTANCIA = 0.3;
export const PESO_ELEGIDA = 0.5;

const BASE: Dimension[] = ["academico", "autoestima", "habitos", "convivencia", "participacion"];

export function dimensionesActivas(incluyeSuperior: boolean): Dimension[] {
  return incluyeSuperior ? [...BASE, "superior"] : BASE;
}

export function esAlcanceDuro(alcance: Alcance): boolean {
  return alcance !== "cualquiera";
}

export function calcularPesos(
  perfil: Perfil,
  incluyeSuperior: boolean,
  alcance: Alcance
): Record<string, number> {
  const dims = dimensionesActivas(incluyeSuperior);
  const pesos: Record<string, number> = {};
  const elegida = perfil !== "todo_por_igual" && dims.includes(perfil) ? perfil : null;
  const resto = 1 - PESO_DISTANCIA;
  for (const d of dims) {
    if (!elegida) pesos[d] = resto / dims.length;
    else pesos[d] = d === elegida ? PESO_ELEGIDA : (resto - PESO_ELEGIDA) / (dims.length - 1);
  }
  pesos.distancia = PESO_DISTANCIA;

  if (esAlcanceDuro(alcance)) {
    delete pesos.distancia;
    const total = Object.values(pesos).reduce((a, b) => a + b, 0);
    for (const k of Object.keys(pesos)) pesos[k] = pesos[k] / total;
  }
  return pesos;
}
