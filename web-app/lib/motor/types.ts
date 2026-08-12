/**
 * Tipos del Motor de scoring.
 *
 * Espejo exacto de la lógica en data-pipeline/scripts/04_scoring_engine.ipynb.
 */

/** Techo máximo de copago que la familia acepta.
 *  Los rangos son los mismos códigos que usa PAGO_MENSUAL en Mineduc,
 *  mapeados a enteros por el pipeline (columna pago_mensual_rango). */
export type TechoCopago = 0 | 1 | 2 | 3 | 4 | 5;

/** Nivel educativo que necesita la familia. */
export type NivelFamilia = "basica" | "media" | "basica_y_media";

/** Modo del filtro de distancia.
 *  - "duro": descalifica colegios fuera del radio en Capa 1.
 *  - "flexible": no descalifica, se pondera negativamente en Capa 2. */
export type TipoDistancia = "duro" | "flexible";

/** Perfil de prioridad del quiz (Q5).
 *  Cada perfil pone 50% del peso en su dimensión, 5% en las demás,
 *  30% en distancia (a menos que sea 'duro' — entonces se renormaliza). */
export type Perfil =
  | "academico"
  | "autoestima"
  | "habitos"
  | "convivencia"
  | "participacion"
  | "todo_por_igual";

/** Respuestas del quiz de una familia. */
export interface RespuestasFamilia {
  techoCopago: TechoCopago;
  nivel: NivelFamilia;
  latSector: number;
  lonSector: number;
  tipoDistancia: TipoDistancia;
  /** Requerido si tipoDistancia === "duro". */
  radioKm?: number;
  perfil: Perfil;
  quiereInclusion: boolean;
}

/** Scores por dimensión, todos normalizados a [0, 1] sobre el universo. */
export interface ScoresPorDimension {
  academico: number;
  autoestima: number;
  habitos: number;
  participacion: number;
  convivencia: number;
  seguridad: number;
  distancia: number;
}

/** Colegio ya puntuado — resultado de Capa 2. */
export interface ScoredColegio {
  rbd: number;
  nombre: string;
  scores: ScoresPorDimension;
  distanciaKm: number;
  /** Score compuesto final. Rango [0, 1]. Mayor = mejor calce. */
  scoreFinal: number;
}

/** Resultado del Motor completo. */
export interface ResultadoMotor {
  /** Colegios elegibles ordenados de mejor a peor score. */
  shortlist: ScoredColegio[];
  /** Total de colegios que pasaron los filtros de Capa 1. */
  totalElegibles: number;
  /** Total del universo evaluado. */
  totalUniverso: number;
}
