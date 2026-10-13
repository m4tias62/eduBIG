import type { ColegioIndice } from "@/lib/types";
import type {
  Alcance,
  Ampliacion,
  Referencia,
  RespuestasFamilia,
  ResultadoMotor,
  ScoredColegio,
  UniversoMotor,
} from "./types";
import { pasaAlcance, pasaFiltrosBase } from "./capa1";
import { calcularScoreFinal, calcularScores, getPercentiles } from "./capa2";
import { distanciaKm } from "./haversine";

export * from "./types";
export { pasaCopago, pasaNivel, pasaInclusion, pasaAlcance, pasaFiltrosBase } from "./capa1";
export { calcularScores, calcularScoreFinal, getPercentiles, percentiles, scoreDistancia } from "./capa2";
export { calcularPesos, dimensionesActivas } from "./pesos";
export { distanciaKm } from "./haversine";

export const TAMANO_SHORTLIST = 3;

/** Escalera de alcances según la precisión de la ubicación (D22, D26). */
export function escaleraAlcance(tipo: Referencia["tipo"]): Alcance[] {
  return tipo === "gps" ? ["1km", "3km", "cualquiera"] : ["comuna", "cercanas", "cualquiera"];
}

/**
 * Si la shortlist se abre con una ubicación de otra precisión que la usada al
 * responder (por ejemplo, un enlace compartido), el alcance se traduce al
 * equivalente: 1 km ↔ mi comuna, 3 km ↔ mi comuna y las cercanas.
 */
export function adaptarAlcance(alcance: Alcance, tipo: Referencia["tipo"]): Alcance {
  if (tipo === "gps") {
    if (alcance === "comuna") return "1km";
    if (alcance === "cercanas") return "3km";
  } else {
    if (alcance === "1km") return "comuna";
    if (alcance === "3km") return "cercanas";
  }
  return alcance;
}

export function incluyeSuperior(nivel: RespuestasFamilia["nivel"]): boolean {
  return nivel === "media" || nivel === "basica_y_media";
}

/**
 * Motor completo: Capa 1 + Capa 2 + shortlist de 3 + bloque sin datos +
 * ampliaciones de distancia.
 */
export function runMotor(
  universo: UniversoMotor,
  respuestas: RespuestasFamilia,
  ref: Referencia
): ResultadoMotor {
  const alcance = adaptarAlcance(respuestas.alcance, ref.tipo);
  const r = { ...respuestas, alcance };
  const superior = incluyeSuperior(r.nivel);
  const pct = getPercentiles(universo.colegios);

  // Candidatos que pasan los filtros independientes de la distancia.
  const base: Array<{ c: ColegioIndice; d: number }> = [];
  for (const c of universo.colegios) {
    if (!pasaFiltrosBase(c, r)) continue;
    base.push({ c, d: distanciaKm(c.lat, c.lon, ref.lat, ref.lon) });
  }

  const dentro = (a: Alcance) =>
    base.filter(({ c, d }) => pasaAlcance(c, d, ref, a, universo.regionPorComuna));

  const elegibles = dentro(alcance);
  const recomendables: ScoredColegio[] = [];
  const sinDatos: ScoredColegio[] = [];
  for (const { c, d } of elegibles) {
    const scores = calcularScores(c, d, pct);
    if (c.cmp) {
      recomendables.push({
        colegio: c,
        scores,
        distanciaKm: d,
        scoreFinal: calcularScoreFinal(c, scores, r, superior),
      });
    } else {
      sinDatos.push({ colegio: c, scores, distanciaKm: d, scoreFinal: 0 });
    }
  }
  // Desempate estable: menor distancia y luego RBD.
  recomendables.sort(
    (a, b) => b.scoreFinal - a.scoreFinal || a.distanciaKm - b.distanciaKm || a.colegio.rbd - b.colegio.rbd
  );
  sinDatos.sort((a, b) => a.distanciaKm - b.distanciaKm || a.colegio.rbd - b.colegio.rbd);

  // D26: si quedan menos de 3, cuántos se suman con cada alcance más amplio.
  const ampliaciones: Ampliacion[] = [];
  if (recomendables.length < TAMANO_SHORTLIST) {
    const escalera = escaleraAlcance(ref.tipo);
    for (const a of escalera.slice(escalera.indexOf(alcance) + 1)) {
      const total = dentro(a).filter(({ c }) => c.cmp).length;
      ampliaciones.push({ alcance: a, total, suma: total - recomendables.length });
    }
  }

  return {
    alcance,
    shortlist: recomendables.slice(0, TAMANO_SHORTLIST),
    totalRecomendables: recomendables.length,
    sinDatos: sinDatos.slice(0, TAMANO_SHORTLIST),
    totalSinDatos: sinDatos.length,
    ampliaciones,
  };
}
