import type { Colegio } from "@/lib/types";
import { distanciaKm } from "@/lib/motor/haversine";
import { LAT_PUDAHUEL, LON_PUDAHUEL } from "@/lib/quiz/state";

/**
 * Filtros aplicables en la Home (browse mode, no motor).
 *
 * URL-driven: se serializan como search params para que cada combinación
 * de filtros produzca una URL compartible.
 */

export type Dependencia = "publica" | "part_subvencionado" | "part_pagado";

export interface FiltrosHome {
  /** Búsqueda por nombre del colegio (case-insensitive, partial match). */
  q?: string;
  /** Solo colegios con PAGO_MENSUAL = GRATUITO. */
  gratuito?: boolean;
  /** Nivel educativo que debe ofrecer el colegio. */
  nivel?: "basica" | "media" | "basica_y_media";
  /** Distancia máxima en km desde el centro de Pudahuel. */
  distanciaMaxKm?: number;
  /** Tipos de sostenedor (multi-selección: pasa si coincide con cualquiera). */
  dependencias?: Dependencia[];
}

/** Map COD_DEPE → Dependencia enum */
const COD_A_DEP: Record<number, Dependencia> = {
  6: "publica",
  3: "part_subvencionado",
  4: "part_pagado",
};

/** Aplica todos los filtros a un colegio. */
export function pasaFiltros(c: Colegio, f: FiltrosHome): boolean {
  if (f.q) {
    const q = f.q.toLowerCase().trim();
    const nombre = c.NOM_RBD?.toLowerCase() ?? "";
    const comuna = c.NOM_COM_RBD?.toLowerCase() ?? "";
    if (q && !nombre.includes(q) && !comuna.includes(q)) return false;
  }
  if (f.gratuito && c.PAGO_MENSUAL !== "GRATUITO") return false;
  if (f.nivel === "basica" && !c.ofrece_basica) return false;
  if (f.nivel === "media" && !c.ofrece_media) return false;
  if (f.nivel === "basica_y_media" && !(c.ofrece_basica && c.ofrece_media)) return false;
  if (f.dependencias && f.dependencias.length > 0) {
    const dep = COD_A_DEP[c.COD_DEPE];
    if (!dep || !f.dependencias.includes(dep)) return false;
  }
  if (f.distanciaMaxKm !== undefined) {
    const d = distanciaKm(c.LATITUD, c.LONGITUD, LAT_PUDAHUEL, LON_PUDAHUEL);
    if (d > f.distanciaMaxKm) return false;
  }
  return true;
}

/** Aplica filtros a todo el universo y ordena por distancia al centro. */
export function filtrarUniverso(universo: Colegio[], f: FiltrosHome): Colegio[] {
  const filtrados = universo.filter((c) => pasaFiltros(c, f));
  return filtrados
    .map((c) => ({
      c,
      d: distanciaKm(c.LATITUD, c.LONGITUD, LAT_PUDAHUEL, LON_PUDAHUEL),
    }))
    .sort((a, b) => a.d - b.d)
    .map((x) => x.c);
}

/** Parsea filtros desde searchParams. */
export function parseFiltros(
  sp: URLSearchParams | Record<string, string | string[] | undefined>
): FiltrosHome {
  const get = (k: string): string | undefined => {
    if (sp instanceof URLSearchParams) return sp.get(k) ?? undefined;
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const f: FiltrosHome = {};
  const q = get("q");
  if (q) f.q = q;
  if (get("gratuito") === "1") f.gratuito = true;
  const n = get("nivel");
  if (n === "basica" || n === "media" || n === "basica_y_media") f.nivel = n;
  const d = get("dist");
  if (d !== undefined) {
    const num = Number(d);
    if (num > 0) f.distanciaMaxKm = num;
  }
  const dep = get("dep");
  if (dep) {
    const deps = dep.split(",").filter(
      (v): v is Dependencia =>
        v === "publica" || v === "part_subvencionado" || v === "part_pagado"
    );
    if (deps.length) f.dependencias = deps;
  }
  return f;
}

/** Serializa filtros a query string. */
export function serializeFiltros(f: FiltrosHome, extras: Record<string, string> = {}): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.gratuito) p.set("gratuito", "1");
  if (f.nivel) p.set("nivel", f.nivel);
  if (f.distanciaMaxKm !== undefined) p.set("dist", String(f.distanciaMaxKm));
  if (f.dependencias && f.dependencias.length) p.set("dep", f.dependencias.join(","));
  for (const [k, v] of Object.entries(extras)) p.set(k, v);
  return p.toString();
}

/** Devuelve la vista actual desde searchParams. */
export function parseVista(
  sp: URLSearchParams | Record<string, string | string[] | undefined>
): "lista" | "mapa" {
  const get = (k: string): string | undefined => {
    if (sp instanceof URLSearchParams) return sp.get(k) ?? undefined;
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  return get("vista") === "mapa" ? "mapa" : "lista";
}

/** Toggle filtro booleano y devuelve la URL nueva. */
export function toggleFiltroUrl(
  filtrosActuales: FiltrosHome,
  vista: "lista" | "mapa",
  cambio: Partial<FiltrosHome>
): string {
  const merged: FiltrosHome = { ...filtrosActuales, ...cambio };
  // Elimina undefined explícitos
  (Object.keys(cambio) as (keyof FiltrosHome)[]).forEach((k) => {
    if (cambio[k] === undefined) delete merged[k];
  });
  const qs = serializeFiltros(merged, { vista });
  return qs ? `/?${qs}` : "/";
}
