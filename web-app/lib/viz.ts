/**
 * Reglas de visualización de datos de Edubig (Comparar colegios, oct-2026).
 * Fuente única para la comparación y la ficha.
 *
 * - Color por POSICIÓN del colegio (1–4): dice de quién es el dato, nunca juicio.
 * - "Sus similares" es una marca neutra (negra), no una serie de color.
 * - Verde / mostaza solo cuando la Agencia marca una diferencia significativa
 *   (significancia ±1). Con 0 la marca va en gris "a la par", aunque la cifra
 *   no sea cero.
 * - Escalas fijas, iguales para todos los colegios: nunca se autoescala.
 */

/** Escala fija de la brecha SIMCE (±56 puntos). */
export const VIZ_ESCALA_SIMCE = 56;
/** Tope común de puntos por año en Seguridad (cubre el 95 % de los colegios). */
export const VIZ_TOPE_PUNTOS = 10;
/** Bajo este total de denuncias (2024 + 2025) la tasa es volátil (regla de la capa de traducción). */
export const UMBRAL_POCOS_CASOS = 5;

export type Posicion = 1 | 2 | 3 | 4;

/** Clases completas (Tailwind no detecta clases armadas por concatenación). */
export const COLOR_COLEGIO: Record<Posicion, { bg: string; borde: string; texto: string }> = {
  1: { bg: "bg-viz-colegio-1", borde: "border-viz-colegio-1", texto: "text-viz-colegio-1" },
  2: { bg: "bg-viz-colegio-2", borde: "border-viz-colegio-2", texto: "text-viz-colegio-2" },
  3: { bg: "bg-viz-colegio-3", borde: "border-viz-colegio-3", texto: "text-viz-colegio-3" },
  4: { bg: "bg-viz-colegio-4", borde: "border-viz-colegio-4", texto: "text-viz-colegio-4" },
};

/** Significancia oficial de la Agencia: 1 sobre, 0 a la par, −1 bajo; null = sin comparación. */
export type Significancia = 1 | 0 | -1 | null;

export function significancia(v: unknown): Significancia {
  return v === 1 || v === 0 || v === -1 ? v : null;
}

export const ESTADO_SIG: Record<"1" | "0" | "-1" | "null", { glifo: string; texto: string; bg: string; color: string }> = {
  "1": { glifo: "↑", texto: "sobre sus similares", bg: "bg-viz-sobre", color: "text-viz-sobre" },
  "0": { glifo: "=", texto: "a la par", bg: "bg-viz-a-la-par", color: "text-viz-a-la-par" },
  "-1": { glifo: "↓", texto: "bajo sus similares", bg: "bg-viz-bajo", color: "text-viz-bajo" },
  null: { glifo: "", texto: "Sin comparación publicada", bg: "bg-viz-a-la-par", color: "text-texto-secundario" },
};

export function estadoSig(s: Significancia) {
  return ESTADO_SIG[String(s) as keyof typeof ESTADO_SIG];
}

/** Diferencia con signo tipográfico: 12 → "+12", −8 → "−8", 0 → "0". */
export function conSigno(v: number): string {
  const r = Math.round(v);
  return `${r > 0 ? "+" : r < 0 ? "−" : ""}${Math.abs(r)}`;
}

/** Alto (en % del trazado) de una barra de brecha centrada en cero; se recorta en la escala. */
export function altoBrecha(dif: number, escala = VIZ_ESCALA_SIMCE): number {
  return (Math.min(Math.abs(dif), escala) / escala) * 50;
}

/** Porcentaje 0–100 acotado, para barras absolutas. */
export function pctAcotado(v: number, max = 100): number {
  return Math.max(0, Math.min(max, v)) / max * 100;
}

/** "1 denuncia" / "3 denuncias". */
export function plural(n: number, uno: string, varios: string): string {
  return `${n.toLocaleString("es-CL")} ${n === 1 ? uno : varios}`;
}
