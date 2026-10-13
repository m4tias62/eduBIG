import type { ColegioIndice } from "@/lib/types";
import type { Alcance, Inclusion, NivelFamilia, Referencia, TechoCopago } from "./types";

/**
 * Capa 1 — Filtros duros: copago, nivel, inclusión y alcance.
 */

/** D36: colegios sin dato de copago se tratan según su dependencia. */
export function pasaCopago(c: ColegioIndice, techo: TechoCopago): boolean {
  switch (c.k) {
    case "gratuito":
    case "gratuito_ley":
      return true;
    case "pago":
      return (c.r ?? 5) <= techo;
    case "pago_sin_monto":
      return techo > 0; // pasa con etiqueta si la familia eligió un tope de pago
    default:
      return true; // particular subvencionado sin dato: pasa con "Sin dato de costo"
  }
}

/** Los colegios solo de educación especial no tienen nivel y pasan siempre. */
export function pasaNivel(c: ColegioIndice, nivel: NivelFamilia): boolean {
  if (!c.b && !c.m) return true;
  if (nivel === "basica") return c.b === 1;
  if (nivel === "media") return c.m === 1;
  return c.b === 1 && c.m === 1;
}

/** D21: "necesitar" filtra; "valorar un entorno inclusivo" no filtra (suma en Capa 2). */
export function pasaInclusion(c: ColegioIndice, inclusion: Inclusion): boolean {
  if (inclusion === "pie") return c.p === 1;
  if (inclusion === "especial") return c.e === 1;
  return true;
}

/** Filtros que no dependen de la distancia. */
export function pasaFiltrosBase(
  c: ColegioIndice,
  r: { techoCopago: TechoCopago; nivel: NivelFamilia; inclusion: Inclusion }
): boolean {
  return pasaCopago(c, r.techoCopago) && pasaNivel(c, r.nivel) && pasaInclusion(c, r.inclusion);
}

export function pasaAlcance(
  c: ColegioIndice,
  distanciaKm: number,
  ref: Referencia,
  alcance: Alcance,
  regionPorComuna: ReadonlyMap<number, string>
): boolean {
  switch (alcance) {
    case "1km":
      return distanciaKm <= 1;
    case "3km":
      return distanciaKm <= 3;
    case "comuna":
      return c.c === ref.codComuna;
    case "cercanas":
      return c.c === ref.codComuna || ref.cercanas.includes(c.c);
    case "cualquiera":
      return regionPorComuna.get(c.c) === ref.region;
  }
}
