import type { ColegioIndice, Comuna } from "@/lib/types";
import { distanciaKm } from "@/lib/motor/haversine";
import { tipoColegio, type TipoColegio } from "@/lib/data/formatters";

/**
 * Exploración nacional (D33, D34) — filtros y orden, como funciones puras.
 *
 * Tres maneras de llegar a una lista:
 *  - comuna   ?comuna=13124 (+ ?cercanas=1): colegios de la comuna. La URL es
 *             compartible ("colegios de Pudahuel").
 *  - gps      ?desde=gps: colegios cerca de la ubicación (vive en el navegador).
 *  - nombre   ?q=…: búsqueda por nombre en todo el país, sin pedir ubicación.
 *
 * Orden: con GPS, por cercanía; con comuna, alfabético (no hay un orden con
 * sentido desde el centro de la comuna); con media, se puede ordenar por
 * ingreso a la U comparado con colegios similares (D33).
 */

export type Vista = "lista" | "mapa";
export type Orden = "cercania" | "nombre" | "ingreso_u";
export type NivelFiltro = "basica" | "media" | "basica_y_media";

export interface FiltrosExploracion {
  comuna?: number;
  cercanas?: boolean;
  desdeGps?: boolean;
  q?: string;
  gratuito?: boolean;
  nivel?: NivelFiltro;
  tipos?: TipoColegio[];
  /** Radio máximo en km (solo con GPS). */
  distanciaMaxKm?: number;
  orden?: Orden;
  vista: Vista;
}

type Params = URLSearchParams | Record<string, string | string[] | undefined>;

function lector(sp: Params) {
  return (k: string): string | undefined => {
    if (sp instanceof URLSearchParams) return sp.get(k) ?? undefined;
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
}

export function parseFiltros(sp: Params): FiltrosExploracion {
  const get = lector(sp);
  const f: FiltrosExploracion = { vista: get("vista") === "mapa" ? "mapa" : "lista" };
  const comuna = Number(get("comuna"));
  if (Number.isInteger(comuna) && comuna > 0) f.comuna = comuna;
  if (get("cercanas") === "1") f.cercanas = true;
  if (get("desde") === "gps") f.desdeGps = true;
  const q = get("q")?.trim();
  if (q) f.q = q.slice(0, 80);
  if (get("gratuito") === "1") f.gratuito = true;
  const n = get("nivel");
  if (n === "basica" || n === "media" || n === "basica_y_media") f.nivel = n;
  const tipos = (get("tipo") ?? "")
    .split(",")
    .filter((t): t is TipoColegio => t === "publica" || t === "part_subvencionado" || t === "part_pagado");
  if (tipos.length) f.tipos = tipos;
  const dist = Number(get("dist"));
  if (dist > 0) f.distanciaMaxKm = dist;
  const orden = get("orden");
  if (orden === "cercania" || orden === "nombre" || orden === "ingreso_u") f.orden = orden;
  return f;
}

export function serializeFiltros(f: FiltrosExploracion): string {
  const p = new URLSearchParams();
  if (f.comuna) p.set("comuna", String(f.comuna));
  if (f.cercanas) p.set("cercanas", "1");
  if (f.desdeGps) p.set("desde", "gps");
  if (f.q) p.set("q", f.q);
  if (f.gratuito) p.set("gratuito", "1");
  if (f.nivel) p.set("nivel", f.nivel);
  if (f.tipos?.length) p.set("tipo", f.tipos.join(","));
  if (f.distanciaMaxKm !== undefined) p.set("dist", String(f.distanciaMaxKm));
  if (f.orden) p.set("orden", f.orden);
  if (f.vista === "mapa") p.set("vista", "mapa");
  return p.toString();
}

export function urlExplorar(f: FiltrosExploracion): string {
  const qs = serializeFiltros(f);
  return qs ? `/explorar?${qs}` : "/explorar";
}

/** Minúsculas y sin tildes, para buscar "concepcion" y encontrar "Concepción". */
export function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function permiteOrdenIngresoU(f: FiltrosExploracion): boolean {
  return f.nivel === "media" || f.nivel === "basica_y_media";
}

/** Orden efectivo según el modo y lo que permite el filtro de nivel. */
export function ordenEfectivo(f: FiltrosExploracion, modo: "comuna" | "gps" | "nombre"): Orden {
  if (f.orden === "ingreso_u" && permiteOrdenIngresoU(f)) return "ingreso_u";
  if (f.orden === "cercania" && modo === "gps") return "cercania";
  if (f.orden === "nombre") return "nombre";
  return modo === "gps" ? "cercania" : "nombre";
}

export interface ItemExploracion {
  c: ColegioIndice;
  /** Distancia en km, si hay punto de referencia. */
  d?: number;
}

/** Filtros que no dependen del lugar (gratuito, nivel, tipo, nombre). */
export function pasaFiltros(c: ColegioIndice, f: FiltrosExploracion, qNorm?: string): boolean {
  // D36: "Gratuito" incluye "gratuito por ley"; los particulares subvencionados
  // sin dato pasan con la etiqueta "Sin dato de costo" (mismo trato que el Test).
  if (f.gratuito && !(c.k === "gratuito" || c.k === "gratuito_ley" || c.k === "sin_dato")) return false;
  if (f.nivel === "basica" && !c.b) return false;
  if (f.nivel === "media" && !c.m) return false;
  if (f.nivel === "basica_y_media" && !(c.b && c.m)) return false;
  if (f.tipos?.length && !f.tipos.includes(tipoColegio(c.d))) return false;
  if (qNorm && !normalizar(c.n).includes(qNorm) && String(c.rbd) !== qNorm) return false;
  return true;
}

export function explorar(
  indice: ColegioIndice[],
  f: FiltrosExploracion,
  ctx: {
    modo: "comuna" | "gps" | "nombre";
    ref?: { lat: number; lon: number };
    comunas?: Set<number>;
  }
): ItemExploracion[] {
  const qNorm = f.q ? normalizar(f.q) : undefined;
  const items: ItemExploracion[] = [];
  for (const c of indice) {
    if (ctx.comunas && !ctx.comunas.has(c.c)) continue;
    if (!pasaFiltros(c, f, qNorm)) continue;
    const d = ctx.ref ? distanciaKm(c.lat, c.lon, ctx.ref.lat, ctx.ref.lon) : undefined;
    if (ctx.modo === "gps" && f.distanciaMaxKm !== undefined && d !== undefined && d > f.distanciaMaxKm) continue;
    items.push({ c, d });
  }

  const orden = ordenEfectivo(f, ctx.modo);
  const porNombre = (a: ItemExploracion, b: ItemExploracion) => a.c.n.localeCompare(b.c.n, "es");
  if (orden === "ingreso_u") {
    items.sort((a, b) => {
      const ta = a.c.tr ?? -Infinity;
      const tb = b.c.tr ?? -Infinity;
      return tb - ta || porNombre(a, b);
    });
  } else if (orden === "cercania") {
    items.sort((a, b) => (a.d ?? 0) - (b.d ?? 0) || porNombre(a, b));
  } else if (ctx.modo === "nombre" && qNorm) {
    // búsqueda: primero los que empiezan con el texto buscado
    const empieza = (x: ItemExploracion) => (normalizar(x.c.n).startsWith(qNorm) ? 0 : 1);
    items.sort((a, b) => empieza(a) - empieza(b) || porNombre(a, b));
  } else {
    items.sort(porNombre);
  }
  return items;
}

/** Comunas cuyo nombre coincide con la búsqueda (para sugerir "Ver colegios de…"). */
export function comunasQueCoinciden(comunas: Comuna[], q: string, max = 3): Comuna[] {
  const qn = normalizar(q);
  if (qn.length < 3) return [];
  return comunas.filter((c) => normalizar(c.nombre).includes(qn)).slice(0, max);
}
