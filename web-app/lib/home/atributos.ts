import type { ColegioIndice } from "@/lib/types";
import { costoEtiqueta } from "@/lib/data/formatters";

/**
 * Atributos destacados del globo del mapa (rediseño 2026-11-03, Figma
 * «Rediseño cards del mapa», nodo 828:5878).
 *
 * Solo hechos que el índice permite afirmar sin interpretar: costo, PIE,
 * educación especial y denuncias en 2024–2025. Los atributos que comparan
 * con colegios similares (SIMCE, convivencia) quedan fuera hasta definir su
 * regla con la significancia oficial (D45).
 */
export interface Atributo {
  icono: string;
  texto: string;
}

export function atributosDestacados(c: ColegioIndice): Atributo[] {
  const lista: Atributo[] = [{ icono: "monetization_on", texto: costoEtiqueta(c.k, c.r) }];
  if (c.p === 1) lista.push({ icono: "accessibility_new", texto: "Con programa PIE" });
  if (c.e === 1) lista.push({ icono: "diversity_3", texto: "Educación especial" });
  // D20: un 0 se lee como 0 denuncias. El rango de años va explícito porque
  // la ficha muestra 2022–2025.
  if (c.dn === 0) lista.push({ icono: "shield", texto: "Sin denuncias 2024–2025" });
  return lista;
}
