import type { Colegio } from "@/lib/types";
import type { RespuestasFamilia, ResultadoMotor, ScoredColegio } from "./types";
import { pasaFiltrosDuros } from "./capa1";
import { calcularScoresUniverso, calcularScoreFinal } from "./capa2";

export * from "./types";
export { pasaFiltroCopago, pasaFiltroNivel, pasaFiltroDistancia, pasaFiltrosDuros } from "./capa1";
export { calcularScoresUniverso, calcularScoreFinal } from "./capa2";
export { distanciaKm } from "./haversine";
export { calcularPesosFinales, pesosBase } from "./pesos";

/**
 * Ejecuta el motor completo — Capa 1 + Capa 2 + ranking.
 *
 * @param universo Todos los colegios (evaluados como pool completo para
 *                 normalizar scores; NO precortar por Capa 1 antes).
 * @param respuestas Respuestas del quiz de la familia.
 * @returns Shortlist ordenada por score_final descendente + metadatos.
 */
export function runMotor(
  universo: Colegio[],
  respuestas: RespuestasFamilia
): ResultadoMotor {
  // Pre-cálculo sobre universo completo (necesario para normalización min-max)
  const scoresMap = calcularScoresUniverso(universo, respuestas);

  // Filtrar por Capa 1 y puntuar
  const elegibles: ScoredColegio[] = [];
  for (const colegio of universo) {
    if (!pasaFiltrosDuros(colegio, respuestas)) continue;
    const s = scoresMap.get(colegio.rbd)!;
    const { distanciaKm, ...scores } = s;
    const scoreFinal = calcularScoreFinal(colegio, scores, respuestas);
    elegibles.push({
      rbd: colegio.rbd,
      nombre: colegio.NOM_RBD,
      scores,
      distanciaKm,
      scoreFinal,
    });
  }

  elegibles.sort((a, b) => b.scoreFinal - a.scoreFinal);

  return {
    shortlist: elegibles,
    totalElegibles: elegibles.length,
    totalUniverso: universo.length,
  };
}
