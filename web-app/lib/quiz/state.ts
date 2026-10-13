import type {
  Alcance,
  Inclusion,
  NivelFamilia,
  Perfil,
  RespuestasFamilia,
  TechoCopago,
} from "@/lib/motor/types";

/**
 * Estado del Test de Calce codificado en la URL.
 *
 * Resiste recargas y se puede compartir: las mismas respuestas producen la
 * misma shortlist. La UBICACIÓN no va en la URL (dato sensible, vive en
 * sessionStorage): quien abre un enlace compartido elige la suya (D23).
 *
 * Parámetros: copago · inc · nivel · alc · perfil
 */

export interface RespuestasParciales {
  techoCopago?: TechoCopago;
  inclusion?: Inclusion;
  nivel?: NivelFamilia;
  alcance?: Alcance;
  perfil?: Perfil;
}

type Params = URLSearchParams | Record<string, string | string[] | undefined>;

const INCLUSIONES: Inclusion[] = ["no", "pie", "especial", "entorno"];
const NIVELES: NivelFamilia[] = ["basica", "media", "basica_y_media"];
const ALCANCES: Alcance[] = ["1km", "3km", "comuna", "cercanas", "cualquiera"];
const PERFILES: Perfil[] = [
  "academico",
  "autoestima",
  "habitos",
  "convivencia",
  "participacion",
  "superior",
  "todo_por_igual",
];

function lector(sp: Params) {
  return (k: string): string | undefined => {
    if (sp instanceof URLSearchParams) return sp.get(k) ?? undefined;
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
}

export function parseRespuestas(sp: Params): RespuestasParciales {
  const get = lector(sp);
  const r: RespuestasParciales = {};

  const copago = get("copago");
  if (copago !== undefined && /^[0-5]$/.test(copago)) r.techoCopago = Number(copago) as TechoCopago;

  const inc = get("inc");
  if (inc && (INCLUSIONES as string[]).includes(inc)) r.inclusion = inc as Inclusion;

  const nivel = get("nivel");
  if (nivel && (NIVELES as string[]).includes(nivel)) r.nivel = nivel as NivelFamilia;

  const alc = get("alc");
  if (alc && (ALCANCES as string[]).includes(alc)) r.alcance = alc as Alcance;

  const perfil = get("perfil");
  if (perfil && (PERFILES as string[]).includes(perfil)) {
    // "superior" solo existe si la familia eligió media o ambos niveles (D30)
    if (perfil !== "superior" || r.nivel === "media" || r.nivel === "basica_y_media") {
      r.perfil = perfil as Perfil;
    }
  }
  return r;
}

export function serializeRespuestas(r: RespuestasParciales): string {
  const p = new URLSearchParams();
  if (r.techoCopago !== undefined) p.set("copago", String(r.techoCopago));
  if (r.inclusion) p.set("inc", r.inclusion);
  if (r.nivel) p.set("nivel", r.nivel);
  if (r.alcance) p.set("alc", r.alcance);
  if (r.perfil) p.set("perfil", r.perfil);
  return p.toString();
}

/** Combina respuestas previas + nuevas y devuelve el path completo. */
export function nextUrl(path: string, previas: RespuestasParciales, nuevas: RespuestasParciales): string {
  const qs = serializeRespuestas({ ...previas, ...nuevas });
  return qs ? `${path}?${qs}` : path;
}

/** Respuestas completas listas para el motor, o null si falta alguna. */
export function toRespuestasFamilia(r: RespuestasParciales): RespuestasFamilia | null {
  if (
    r.techoCopago === undefined ||
    r.inclusion === undefined ||
    r.nivel === undefined ||
    r.alcance === undefined ||
    r.perfil === undefined
  ) {
    return null;
  }
  return {
    techoCopago: r.techoCopago,
    inclusion: r.inclusion,
    nivel: r.nivel,
    alcance: r.alcance,
    perfil: r.perfil,
  };
}

/* ---------- Glosas para el resumen de respuestas ---------- */

export const COPAGO_GLOSA: Record<TechoCopago, string> = {
  0: "Gratuito",
  1: "Hasta $10.000 al mes",
  2: "Hasta $25.000 al mes",
  3: "Hasta $50.000 al mes",
  4: "Hasta $100.000 al mes",
  5: "Más de $100.000 al mes",
};

export const INCLUSION_GLOSA: Record<Inclusion, string | null> = {
  no: null,
  pie: "Con PIE",
  especial: "Con educación especial",
  entorno: "Entorno inclusivo",
};

export const NIVEL_GLOSA: Record<NivelFamilia, string> = {
  basica: "Educación básica",
  media: "Educación media",
  basica_y_media: "Básica y media",
};

export const ALCANCE_GLOSA: Record<Alcance, string> = {
  "1km": "Hasta 1 km",
  "3km": "Hasta 3 km",
  comuna: "En tu comuna",
  cercanas: "Tu comuna y las cercanas",
  cualquiera: "Cualquier distancia",
};

export const PERFIL_GLOSA: Record<Perfil, string> = {
  academico: "Más peso en resultados académicos",
  autoestima: "Más peso en confianza y motivación",
  habitos: "Más peso en hábitos de vida saludable",
  convivencia: "Más peso en seguridad y clima escolar",
  participacion: "Más peso en participación y comunidad",
  superior: "Más peso en preparación para la educación superior",
  todo_por_igual: "Todo por igual",
};
