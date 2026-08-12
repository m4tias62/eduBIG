/**
 * Tipos para el dominio Edubig — reflejan colegios_universo.json
 * y colegios_conclusiones.json que produce el pipeline.
 */

/** Categorías de copago crudas del Directorio Mineduc. */
export type RangoCopago =
  | "GRATUITO"
  | "$1.000 A $10.000"
  | "$10.001 A $25.000"
  | "$25.001 A $50.000"
  | "$50.001 A $100.000"
  | "MAS DE $100.000"
  | "SIN INFORMACION"
  | "SIN_INFORMACION";

/**
 * Fila cruda de colegios_universo.json.
 * Campos con `| null` cuando el pipeline pudo no traerlos (SIMCE/IDPS por curso).
 */
export interface Colegio {
  // Identidad + directorio Mineduc
  rbd: number;
  NOM_RBD: string;
  ESTADO_ESTAB: number;
  NOM_COM_RBD: string;
  ORI_RELIGIOSA: number;
  ORI_OTRO_GLOSA: string;
  PAGO_MATRICULA: RangoCopago;
  PAGO_MENSUAL: RangoCopago;
  COD_DEPE: number;         // 3=Part. subvencionado, 4=Part. pagado, 6=SLEP público
  LATITUD: number;
  LONGITUD: number;
  RURAL_RBD: number;
  MAT_TOTAL: number;

  // Filtros duros y niveles ofrecidos (motor Capa 1)
  pago_mensual_rango: number | null;   // 0..5 (paralelo a PAGO_MENSUAL), null = sin info
  ofrece_educacion_regular: boolean;
  ofrece_educacion_especial: boolean;
  ofrece_basica: boolean;
  ofrece_media: boolean;
  CONVENIO_PIE: number;                // 0 | 1

  // SIMCE — por curso (4°b, 6°b, 8°b, 2°m) x materia (lect, mate, hist)
  // Ver notebook 04 para semántica exacta. dif = vs. grupo, prom = absoluto.
  cod_grupo_2m: number | null;
  prom_lect2m_rbd: number | null;
  prom_mate2m_rbd: number | null;
  difgru_lect2m_rbd: number | null;
  difgru_mate2m_rbd: number | null;
  siggru_lect2m_rbd: number | null;
  siggru_mate2m_rbd: number | null;
  cod_grupo_4b: number | null;
  prom_lect4b_rbd: number | null;
  prom_mate4b_rbd: number | null;
  difgru_lect4b_rbd: number | null;
  difgru_mate4b_rbd: number | null;
  siggru_lect4b_rbd: number | null;
  siggru_mate4b_rbd: number | null;
  cod_grupo_6b: number | null;
  prom_lect6b_rbd: number | null;
  prom_mate6b_rbd: number | null;
  difgru_lect6b_rbd: number | null;
  difgru_mate6b_rbd: number | null;
  siggru_lect6b_rbd: number | null;
  siggru_mate6b_rbd: number | null;
  cod_grupo_8b: number | null;
  prom_lect8b_rbd: number | null;
  prom_mate8b_rbd: number | null;
  prom_hist8b_rbd: number | null;
  difgru_lect8b_rbd: number | null;
  difgru_mate8b_rbd: number | null;
  difgru_hist8b_rbd: number | null;
  siggru_lect8b_rbd: number | null;
  siggru_mate8b_rbd: number | null;
  siggru_hist8b_rbd: number | null;

  // Supereduc — denuncias por año
  conteo_denuncias_24: number | null;
  conteo_denuncias_25: number | null;

  // IDPS 2° medio (4 dimensiones, dif vs. par-establecimiento y difgru vs. grupo)
  autoestima_dif_2m: number | null;
  clima_dif_2m: number | null;
  participacion_dif_2m: number | null;
  habitos_dif_2m: number | null;
  autoestima_difgru_2m: number | null;
  clima_difgru_2m: number | null;
  participacion_difgru_2m: number | null;
  habitos_difgru_2m: number | null;
  autoestima_prom_2m: number | null;
  clima_prom_2m: number | null;
  participacion_prom_2m: number | null;
  habitos_prom_2m: number | null;

  // IDPS 4° básico
  autoestima_dif_4b: number | null;
  clima_dif_4b: number | null;
  participacion_dif_4b: number | null;
  habitos_dif_4b: number | null;
  autoestima_difgru_4b: number | null;
  clima_difgru_4b: number | null;
  participacion_difgru_4b: number | null;
  habitos_difgru_4b: number | null;
  autoestima_prom_4b: number | null;
  clima_prom_4b: number | null;
  participacion_prom_4b: number | null;
  habitos_prom_4b: number | null;

  // IDPS 8° básico
  autoestima_dif_8b: number | null;
  clima_dif_8b: number | null;
  participacion_dif_8b: number | null;
  habitos_dif_8b: number | null;
  autoestima_difgru_8b: number | null;
  clima_difgru_8b: number | null;
  participacion_difgru_8b: number | null;
  habitos_difgru_8b: number | null;
  autoestima_prom_8b: number | null;
  clima_prom_8b: number | null;
  participacion_prom_8b: number | null;
  habitos_prom_8b: number | null;
}

/**
 * Fila de colegios_conclusiones.json — conclusiones humanas
 * generadas por la capa de traducción (capa_traduccion.py).
 */
export interface ConclusionesColegio {
  rbd: number;
  identidad: {
    nombre: string;
    dependencia: string;   // "Educación pública (SLEP)", "Particular subvencionado", "Particular pagado"
    matricula: string;     // ej. "445 estudiantes"
    niveles: string;       // "Básica" | "Media" | "Básica y Media" | "Niveles no informados"
  };
  lo_esencial: {
    Seguridad: string;
    Bienestar: string;
    Académico: string;
    Costo: string;
  };
  modulos: {
    Bienestar?: {
      conclusion: string;
      detalle: Record<string, string>;
      fuente: string;
    };
    Académico?: {
      conclusion: string;
      fuente: string;
    };
    Seguridad?: {
      conclusion: string;
    };
    // Costo aún no genera módulo detallado en el pipeline; se puede
    // renderizar directamente desde los campos del universo.
  };
}
