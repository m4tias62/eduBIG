import type { Colegio } from "@/lib/types";
import type { RespuestasFamilia } from "./types";
import { distanciaKm } from "./haversine";

/**
 * Capa 1 — Filtros duros. Un colegio pasa si cumple los tres:
 * copago, nivel y distancia (si el modo es "duro").
 *
 * Reglas de bypass:
 * - Copago sin información (pago_mensual_rango == null) → pasa (no se
 *   penaliza por falta de dato oficial; principio del pipeline).
 * - Educación especial pura (no ofrece básica ni media) → pasa el filtro
 *   de nivel automáticamente.
 * - Distancia "flexible" → no descalifica; se pondera en Capa 2.
 */
export function pasaFiltroCopago(
  rangoColegio: number | null,
  techoFamilia: number
): boolean {
  if (rangoColegio === null || Number.isNaN(rangoColegio)) return true;
  return rangoColegio <= techoFamilia;
}

export function pasaFiltroNivel(
  ofreceBasica: boolean,
  ofreceMedia: boolean,
  nivelFamilia: RespuestasFamilia["nivel"]
): boolean {
  if (!ofreceBasica && !ofreceMedia) return true; // educación especial pura
  if (nivelFamilia === "basica") return ofreceBasica;
  if (nivelFamilia === "media") return ofreceMedia;
  return ofreceBasica && ofreceMedia; // "basica_y_media"
}

export function pasaFiltroDistancia(
  latColegio: number,
  lonColegio: number,
  latSector: number,
  lonSector: number,
  tipo: RespuestasFamilia["tipoDistancia"],
  radioKm?: number
): boolean {
  if (tipo === "flexible") return true;
  if (radioKm === undefined) {
    throw new Error("radioKm es requerido cuando tipoDistancia = 'duro'");
  }
  return distanciaKm(latColegio, lonColegio, latSector, lonSector) <= radioKm;
}

/** Orquestador — un colegio pasa Capa 1 si cumple los tres filtros. */
export function pasaFiltrosDuros(colegio: Colegio, prefs: RespuestasFamilia): boolean {
  if (!pasaFiltroCopago(colegio.pago_mensual_rango, prefs.techoCopago)) return false;
  if (!pasaFiltroNivel(colegio.ofrece_basica, colegio.ofrece_media, prefs.nivel)) return false;
  if (!pasaFiltroDistancia(
    colegio.LATITUD, colegio.LONGITUD,
    prefs.latSector, prefs.lonSector,
    prefs.tipoDistancia, prefs.radioKm
  )) return false;
  return true;
}
