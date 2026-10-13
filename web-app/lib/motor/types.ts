import type { ColegioIndice } from "@/lib/types";

/**
 * Tipos del Motor del Test de Calce — versión nacional (2026-10-13).
 *
 * Cambios frente al motor del MVP (decisiones de la bitácora):
 *  D21  Inclusión: "necesito PIE" o "necesito educación especial" filtran
 *       (Capa 1); "valoro un entorno inclusivo" suma el bono de 5 %.
 *  D22  Sin ubicación por defecto: la distancia se mide desde el GPS o desde
 *       el centro de la comuna elegida; Q4 adapta sus opciones a esa precisión.
 *  D24  Colegios sin comparación oficial: fuera de la shortlist, en un bloque
 *       aparte ordenado por distancia.
 *  D26  Si quedan menos de 3, se ofrece ampliar la distancia paso a paso.
 *  D27  La shortlist muestra 3 colegios.
 *  D30  Nueva prioridad "Preparación para la educación superior" (tasa de
 *       ingreso a la U relativa a colegios similares), solo con media.
 *  D35  "Todo por igual" reparte 70 % entre las dimensiones disponibles.
 *  D36  Colegios sin dato de copago, según dependencia.
 */

/** Tope de mensualidad que acepta la familia (tramos del Directorio Mineduc). */
export type TechoCopago = 0 | 1 | 2 | 3 | 4 | 5;

export type NivelFamilia = "basica" | "media" | "basica_y_media";

/** Q2: no necesita / necesita PIE / necesita educación especial / valora entorno inclusivo. */
export type Inclusion = "no" | "pie" | "especial" | "entorno";

/**
 * Q4: alcance de la búsqueda.
 *  - Con GPS:    1km · 3km · cualquiera
 *  - Con comuna: comuna · cercanas · cualquiera
 * "cualquiera" no descarta por distancia, pero la cercanía pesa 30 % y la
 * búsqueda se limita a la región de la familia.
 */
export type Alcance = "1km" | "3km" | "comuna" | "cercanas" | "cualquiera";

export type Dimension =
  | "academico"
  | "autoestima"
  | "habitos"
  | "convivencia"
  | "participacion"
  | "superior";

/** Q5: dimensión con más peso, o "todo_por_igual". */
export type Perfil = Dimension | "todo_por_igual";

/** Punto desde el que se mide la distancia. */
export interface Referencia {
  tipo: "gps" | "comuna";
  lat: number;
  lon: number;
  /** Comuna elegida, o la más cercana al GPS. */
  codComuna: number;
  nombreComuna: string;
  region: string;
  cercanas: number[];
}

export interface RespuestasFamilia {
  techoCopago: TechoCopago;
  inclusion: Inclusion;
  nivel: NivelFamilia;
  alcance: Alcance;
  perfil: Perfil;
}

/** Scores por dimensión, en [0, 1]. */
export interface ScoresPorDimension {
  academico: number;
  autoestima: number;
  habitos: number;
  participacion: number;
  convivencia: number;
  superior: number;
  seguridad: number;
  distancia: number;
}

export interface ScoredColegio {
  colegio: ColegioIndice;
  scores: ScoresPorDimension;
  distanciaKm: number;
  /** Score compuesto. Mayor = mejor calce. */
  scoreFinal: number;
}

export interface Ampliacion {
  alcance: Alcance;
  /** Colegios recomendables con ese alcance. */
  total: number;
  /** Cuántos se suman frente al alcance actual. */
  suma: number;
}

export interface ResultadoMotor {
  alcance: Alcance;
  /** Hasta 3 colegios recomendables, del mejor al peor calce (D27). */
  shortlist: ScoredColegio[];
  /** Colegios que pasan los filtros y tienen datos para comparar. */
  totalRecomendables: number;
  /** Hasta 3 colegios que pasan los filtros pero no tienen comparación (D24), por distancia. */
  sinDatos: ScoredColegio[];
  totalSinDatos: number;
  /** Alcances más amplios disponibles cuando quedan menos de 3 (D26). */
  ampliaciones: Ampliacion[];
}

export interface UniversoMotor {
  colegios: ColegioIndice[];
  regionPorComuna: ReadonlyMap<number, string>;
}
