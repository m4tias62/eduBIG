import type { RespuestasFamilia } from "@/lib/motor";

/**
 * Estado del quiz codificado en URL search params.
 *
 * Por qué URL y no Context/localStorage:
 *  - Resiste refresh del navegador.
 *  - Compartible por link (útil para testing con familias — mismos inputs
 *    producen misma shortlist).
 *  - Server Components pueden leer directamente `searchParams` sin
 *    hidratación adicional.
 *  - Simplifica el componente: cada página es 100% función pura de la URL.
 */

/** Centro geográfico de Pudahuel usado por el pipeline como sector default.
 *  A futuro se sustituye por geocoding de la dirección real de la familia. */
export const LAT_PUDAHUEL = -33.43913;
export const LON_PUDAHUEL = -70.7411;

/** Sub-tipo de inclusión — Q2b lo captura pero el motor actual sólo usa el
 *  boolean quiereInclusion. Se guarda por si a futuro se refina el scoring. */
export type IncTipo = "pie" | "especial" | "entorno";

/** Respuestas parciales acumuladas durante el quiz. */
export interface RespuestasParciales {
  techoCopago?: RespuestasFamilia["techoCopago"];
  quiereInclusion?: boolean;
  incTipo?: IncTipo;
  nivel?: RespuestasFamilia["nivel"];
  tipoDistancia?: RespuestasFamilia["tipoDistancia"];
  radioKm?: number;
  perfil?: RespuestasFamilia["perfil"];
}

/** Lee todas las respuestas parciales desde los search params de una URL. */
export function parseRespuestas(sp: URLSearchParams | Record<string, string | string[] | undefined>): RespuestasParciales {
  const get = (k: string): string | undefined => {
    if (sp instanceof URLSearchParams) return sp.get(k) ?? undefined;
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const r: RespuestasParciales = {};

  const copago = get("copago");
  if (copago !== undefined) {
    const n = Number(copago);
    if (n >= 0 && n <= 5) r.techoCopago = n as RespuestasFamilia["techoCopago"];
  }

  const incl = get("incl");
  if (incl === "si") r.quiereInclusion = true;
  else if (incl === "no") r.quiereInclusion = false;

  const incTipo = get("incTipo");
  if (incTipo === "pie" || incTipo === "especial" || incTipo === "entorno") {
    r.incTipo = incTipo;
  }

  const nivel = get("nivel");
  if (nivel === "basica" || nivel === "media" || nivel === "basica_y_media") {
    r.nivel = nivel;
  }

  const dist = get("dist");
  if (dist === "duro" || dist === "flexible") r.tipoDistancia = dist;

  const radio = get("radio");
  if (radio !== undefined) {
    const n = Number(radio);
    if (n > 0) r.radioKm = n;
  }

  const perfil = get("perfil");
  const perfiles = ["academico", "autoestima", "habitos", "convivencia", "participacion", "todo_por_igual"];
  if (perfil !== undefined && perfiles.includes(perfil)) {
    r.perfil = perfil as RespuestasFamilia["perfil"];
  }

  return r;
}

/** Serializa respuestas parciales a una query string. */
export function serializeRespuestas(r: RespuestasParciales): string {
  const params = new URLSearchParams();
  if (r.techoCopago !== undefined) params.set("copago", String(r.techoCopago));
  if (r.quiereInclusion !== undefined) params.set("incl", r.quiereInclusion ? "si" : "no");
  if (r.incTipo) params.set("incTipo", r.incTipo);
  if (r.nivel) params.set("nivel", r.nivel);
  if (r.tipoDistancia) params.set("dist", r.tipoDistancia);
  if (r.radioKm !== undefined) params.set("radio", String(r.radioKm));
  if (r.perfil) params.set("perfil", r.perfil);
  return params.toString();
}

/** Combina respuestas previas + nuevas y devuelve el path completo. */
export function nextUrl(path: string, previas: RespuestasParciales, nuevas: RespuestasParciales): string {
  const combinado = { ...previas, ...nuevas };
  const qs = serializeRespuestas(combinado);
  return qs ? `${path}?${qs}` : path;
}

/** Convierte respuestas parciales completas + coordenadas del sector en
 *  input listo para runMotor. Devuelve null si falta algún campo obligatorio.
 *
 *  `coords` define el punto de referencia para la distancia: la ubicación real
 *  del usuario si la activó, o el centro de Pudahuel como fallback. La ubicación
 *  es un dato sensible → llega desde el cliente (sessionStorage), nunca por URL. */
export function toRespuestasFamilia(
  r: RespuestasParciales,
  coords?: { lat: number; lon: number }
): RespuestasFamilia | null {
  if (
    r.techoCopago === undefined ||
    r.quiereInclusion === undefined ||
    r.nivel === undefined ||
    r.tipoDistancia === undefined ||
    r.perfil === undefined
  ) {
    return null;
  }
  if (r.tipoDistancia === "duro" && r.radioKm === undefined) return null;

  return {
    techoCopago: r.techoCopago,
    nivel: r.nivel,
    latSector: coords ? coords.lat : LAT_PUDAHUEL,
    lonSector: coords ? coords.lon : LON_PUDAHUEL,
    tipoDistancia: r.tipoDistancia,
    radioKm: r.radioKm,
    perfil: r.perfil,
    quiereInclusion: r.quiereInclusion,
  };
}
