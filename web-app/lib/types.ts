/**
 * Tipos del dominio Edubig a escala nacional.
 *
 * Reflejan lo que produce data-pipeline/scripts/06_datos_web.py a partir del
 * dataset nacional 2025 (8.250 colegios):
 *   public/data/nacional/indice.json          → ColegioIndice[]
 *   public/data/nacional/comunas.json         → Comuna[]
 *   public/data/nacional/fichas/<comuna>.json → DetalleColegio[]
 */

/** Códigos de dependencia del dataset nacional (distintos a los del MVP). */
export type CodDependencia = 1 | 2 | 3 | 4 | 5;
// 1 Municipal · 2 Particular subvencionado · 3 Particular pagado
// 4 Administración delegada · 5 Servicio Local de Educación

/**
 * Estado de costo según D36:
 *  - gratuito        el Directorio dice GRATUITO
 *  - gratuito_ley    sin dato, pero municipal o SLEP (Ley 20.845)
 *  - pago            hay un tramo de pago mensual informado
 *  - pago_sin_monto  sin dato, particular pagado
 *  - sin_dato        sin dato, particular subvencionado (u otra dependencia)
 */
export type EstadoCosto = "gratuito" | "gratuito_ley" | "pago" | "pago_sin_monto" | "sin_dato";

/** Registro compacto de un colegio (exploración, búsqueda y motor). */
export interface ColegioIndice {
  rbd: number;
  /** Nombre en formato título. */
  n: string;
  /** Código de comuna. */
  c: number;
  lat: number;
  lon: number;
  /** Dependencia (CodDependencia). */
  d: CodDependencia;
  /** Ofrece básica / media / educación especial (0 | 1). */
  b: 0 | 1;
  m: 0 | 1;
  e: 0 | 1;
  /** Convenio PIE (0 | 1). */
  p: 0 | 1;
  /** Estado de costo (D36). */
  k: EstadoCosto;
  /** Tramo de pago mensual 0..5 (0 = gratuito), ausente si no hay dato. */
  r?: number;
  /** Matrícula total 2025. */
  mt: number;
  /** 1 = tiene alguna comparación oficial con colegios similares (SIMCE o IDPS). */
  cmp: 0 | 1;
  /** SIMCE 2025: promedio de las diferencias con colegios similares. */
  s?: number;
  /** IDPS 2025: promedio de las diferencias con similares por dimensión. */
  ia?: number;
  ic?: number;
  ip?: number;
  ih?: number;
  /** Denuncias por 100 estudiantes (promedio de los años con dato, 2024–2025). */
  dn?: number;
  /** Tasa de ingreso a la universidad 2025 (0–1). */
  tu?: number;
  /** Tasa de ingreso relativa a colegios similares (D30), en proporción. */
  tr?: number;
}

export interface Comuna {
  cod: number;
  nombre: string;
  /** Código corto de región (RM, VALPO…). */
  region: string;
  /** Centro: mediana de las coordenadas de sus colegios (D22). */
  lat: number;
  lon: number;
  /** Colegios en el universo. */
  n: number;
  /** Comunas cercanas (las más próximas de la misma región). */
  cercanas: number[];
}

/** Frases de la capa de traducción (capa_traduccion.traducir_nacional). */
export interface Traduccion {
  lo_esencial: {
    Seguridad: string;
    Bienestar: string;
    Académico: string;
    Costo: string;
    Trayectoria?: string;
  };
  bienestar_detalle: Record<string, string>;
}

/**
 * Detalle completo de un colegio (ficha). Usa los nombres de columna del
 * dataset nacional; los campos sin dato no vienen en el JSON.
 */
export interface DetalleColegio {
  rbd: number;
  nombre: string;
  comuna: string;
  cod_comuna: number;
  region: string;
  region_nombre: string;
  dependencia_cod: CodDependencia;
  dependencia: string;
  latitud: number;
  longitud: number;
  rural: boolean;
  matricula_total: number;
  ofrece_parvularia: boolean;
  ofrece_basica: boolean;
  ofrece_especial: boolean;
  ofrece_media_hc: boolean;
  ofrece_media_tp: boolean;
  ofrece_media: boolean;
  pie: boolean;
  pago_mensual: string;
  pago_matricula: string;
  gratuito: "si" | "no" | "sin_dato";
  estado_costo: EstadoCosto;
  tiene_gse: boolean;
  tiene_comparacion_simce: boolean;
  tiene_comparacion_idps: boolean;
  traduccion: Traduccion;
  /** Resto de campos numéricos y etiquetas (SIMCE, IDPS, GSE, PAES, denuncias…). */
  [campo: string]: unknown;
}

export type Curso = "4b" | "8b" | "2m";
export type DimensionIdps = "clima" | "autoestima" | "habitos" | "participacion";
