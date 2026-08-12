import type { Colegio, ConclusionesColegio } from "@/lib/types";
import universoRaw from "@/public/data/colegios_universo.json";
import conclusionesRaw from "@/public/data/colegios_conclusiones.json";

/**
 * Loaders type-safe para los JSON del pipeline.
 *
 * Import estático → Next.js incluye estos datos en el bundle en build-time,
 * habilitando generación estática total. Sin fetch, sin runtime overhead.
 */

const universo = universoRaw as unknown as Colegio[];
const conclusiones = conclusionesRaw as unknown as ConclusionesColegio[];

/** Todos los colegios del universo (57 en Pudahuel al 2026-08). */
export function getUniverso(): Colegio[] {
  return universo;
}

/** Un colegio específico por RBD, o null si no existe. */
export function getColegio(rbd: number): Colegio | null {
  return universo.find((c) => c.rbd === rbd) ?? null;
}

/** Todas las conclusiones (62 records — hay 5 más que universo por desfase de pipeline). */
export function getConclusiones(): ConclusionesColegio[] {
  return conclusiones;
}

/** Conclusiones de un colegio por RBD, o null si no existe. */
export function getConclusionesColegio(rbd: number): ConclusionesColegio | null {
  return conclusiones.find((c) => c.rbd === rbd) ?? null;
}

/**
 * Índices para acceso O(1) — útil en rutas estáticas por RBD.
 * Se computan una sola vez al importar el módulo.
 */
export const universoIndex: ReadonlyMap<number, Colegio> = new Map(
  universo.map((c) => [c.rbd, c])
);

export const conclusionesIndex: ReadonlyMap<number, ConclusionesColegio> = new Map(
  conclusiones.map((c) => [c.rbd, c])
);

/** Lista de RBDs disponibles para generateStaticParams. */
export function getAllRbds(): number[] {
  return universo.map((c) => c.rbd);
}
