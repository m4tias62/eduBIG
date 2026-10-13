import type { CodDependencia, EstadoCosto } from "@/lib/types";

/**
 * Glosas legibles a partir de los códigos del dataset nacional.
 * Fuente única para tarjetas, ficha, comparación y filtros.
 */

const DEPENDENCIA: Record<CodDependencia, string> = {
  1: "Pública municipal",
  2: "Particular subvencionado",
  3: "Particular pagado",
  4: "Administración delegada",
  5: "Pública (Servicio Local)",
};

export function dependenciaGlosa(d: CodDependencia): string {
  return DEPENDENCIA[d] ?? "Dependencia no informada";
}

/** Agrupación para el filtro "Tipo de colegio" de la exploración. */
export type TipoColegio = "publica" | "part_subvencionado" | "part_pagado";

export function tipoColegio(d: CodDependencia): TipoColegio {
  if (d === 2) return "part_subvencionado";
  if (d === 3) return "part_pagado";
  return "publica"; // municipal, SLEP y administración delegada (financiamiento público)
}

export const TIPO_GLOSA: Record<TipoColegio, string> = {
  publica: "Pública",
  part_subvencionado: "Particular subvencionado",
  part_pagado: "Particular pagado",
};

/** "Básica y media", "Básica", "Media y educación especial"… */
export function nivelesGlosa(basica: boolean, media: boolean, especial: boolean): string {
  const partes: string[] = [];
  if (basica) partes.push("básica");
  if (media) partes.push("media");
  if (especial) partes.push("educación especial");
  if (partes.length === 0) return "Niveles no informados";
  const texto =
    partes.length === 1 ? partes[0] : partes.slice(0, -1).join(", ") + " y " + partes[partes.length - 1];
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const RANGO: Record<number, string> = {
  0: "Gratuito",
  1: "$1.000 a $10.000",
  2: "$10.001 a $25.000",
  3: "$25.001 a $50.000",
  4: "$50.001 a $100.000",
  5: "Más de $100.000",
};

export function rangoGlosa(r: number | undefined): string {
  return r === undefined ? "Sin información" : RANGO[r] ?? "Sin información";
}

/** Glosa del pago tal como viene del Directorio ("MAS DE $100.000" → "Más de $100.000"). */
export function pagoGlosa(crudo: string | undefined): string {
  if (!crudo) return "Sin información";
  const mapa: Record<string, string> = {
    GRATUITO: "Gratuito",
    "$1.000 A $10.000": RANGO[1],
    "$10.001 A $25.000": RANGO[2],
    "$25.001 A $50.000": RANGO[3],
    "$50.001 A $100.000": RANGO[4],
    "MAS DE $100.000": RANGO[5],
    "SIN INFORMACION": "Sin información",
  };
  return mapa[crudo.toUpperCase()] ?? crudo;
}

/** Etiqueta corta de costo para tarjetas y listas (D36). */
export function costoEtiqueta(k: EstadoCosto, r?: number): string {
  switch (k) {
    case "gratuito":
      return "Gratuito";
    case "gratuito_ley":
      return "Gratuito por ley";
    case "pago":
      return `${rangoGlosa(r)} al mes`;
    case "pago_sin_monto":
      return "Pagado, monto sin dato";
    default:
      return "Sin dato de costo";
  }
}

export function esGratuito(k: EstadoCosto): boolean {
  return k === "gratuito" || k === "gratuito_ley";
}

export function matriculaGlosa(mat: number): string {
  return `${mat.toLocaleString("es-CL")} estudiantes`;
}

/** Punto desde el que se mide la distancia. */
export type ReferenciaDistancia = { tipo: "gps" } | { tipo: "comuna"; nombre: string };

export function formatearDistancia(km: number, ref: ReferenciaDistancia): string {
  const sufijo = ref.tipo === "gps" ? "de tu ubicación" : `del centro de ${ref.nombre}`;
  if (km < 1) return `A ${Math.max(50, Math.round(km * 20) * 50)} m ${sufijo}`;
  return `A ${km.toFixed(1).replace(".", ",")} km ${sufijo}`;
}

/** 0,4242 → "42 %". */
export function pct(x: number): string {
  return `${Math.round(x * 100)}\u00a0%`;
}

/** Diferencia en puntos porcentuales con signo: 0,12 → "+12 pts.". */
export function puntosPct(x: number): string {
  const v = Math.round(x * 100);
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v)}\u00a0pts.`;
}
