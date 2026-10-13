import fs from "node:fs";
import path from "node:path";
import type { ColegioIndice, Comuna, DetalleColegio } from "@/lib/types";

/**
 * Acceso a los datos nacionales desde el SERVIDOR (fichas y comparación).
 *
 * Lee los JSON de public/data/nacional con fs y los guarda en memoria del
 * proceso. Las fichas están separadas por comuna (345 archivos de ~70 KB)
 * para no cargar los 25 MB del detalle completo en cada request.
 * En Vercel, next.config.mjs incluye estos archivos en las funciones que los
 * usan (outputFileTracingIncludes).
 */

const DIR = path.join(process.cwd(), "public", "data", "nacional");

let indice: ColegioIndice[] | null = null;
let indicePorRbd: Map<number, ColegioIndice> | null = null;
let comunas: Comuna[] | null = null;
const fichasPorComuna = new Map<number, Map<number, DetalleColegio>>();

function leerJson<T>(archivo: string): T {
  return JSON.parse(fs.readFileSync(path.join(DIR, archivo), "utf-8")) as T;
}

export function getIndice(): ColegioIndice[] {
  if (!indice) indice = leerJson<ColegioIndice[]>("indice.json");
  return indice;
}

export function getColegioIndice(rbd: number): ColegioIndice | null {
  if (!indicePorRbd) indicePorRbd = new Map(getIndice().map((c) => [c.rbd, c]));
  return indicePorRbd.get(rbd) ?? null;
}

export function getComunas(): Comuna[] {
  if (!comunas) comunas = leerJson<Comuna[]>("comunas.json");
  return comunas;
}

/** Detalle de un colegio por RBD, o null si no existe en el universo nacional. */
export function getDetalle(rbd: number): DetalleColegio | null {
  const c = getColegioIndice(rbd);
  if (!c) return null;
  let fichas = fichasPorComuna.get(c.c);
  if (!fichas) {
    const lista = leerJson<DetalleColegio[]>(path.join("fichas", `${c.c}.json`));
    fichas = new Map(lista.map((f) => [f.rbd, f]));
    fichasPorComuna.set(c.c, fichas);
  }
  return fichas.get(rbd) ?? null;
}
