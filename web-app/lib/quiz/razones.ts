import type { ColegioIndice } from "@/lib/types";
import type { Referencia, RespuestasFamilia, ScoredColegio } from "@/lib/motor/types";

/**
 * "Razones del calce": hasta 3 etiquetas por tarjeta de la shortlist,
 * priorizando la que responde a la dimensión elegida en Q5.
 *
 * Umbral 0,6: el colegio está sobre el 60 % de los colegios del país en su
 * diferencia con colegios similares (percentil nacional, ver motor/capa2).
 */

const UMBRAL_FUERTE = 0.6;

export function razonesCalce(
  scored: ScoredColegio,
  respuestas: RespuestasFamilia,
  ref: Referencia
): string[] {
  const s = scored.scores;
  const c: ColegioIndice = scored.colegio;
  const candidatas: Array<{ label: string; peso: number }> = [];

  const porPerfil: Record<string, { dim: keyof typeof s; label: string }> = {
    academico: { dim: "academico", label: "Fuerte en lo académico" },
    autoestima: { dim: "autoestima", label: "Fuerte en autoestima" },
    habitos: { dim: "habitos", label: "Fuerte en hábitos saludables" },
    convivencia: { dim: "convivencia", label: "Buena convivencia" },
    participacion: { dim: "participacion", label: "Fuerte participación" },
    superior: { dim: "superior", label: "Ingreso a la U sobre similares" },
  };
  const match = porPerfil[respuestas.perfil];
  const crudoPositivo = match?.dim === "academico" ? (c.s ?? 0) > 0 : match?.dim === "superior" ? (c.tr ?? 0) > 0 : true;
  if (match && s[match.dim] >= UMBRAL_FUERTE && crudoPositivo) candidatas.push({ label: match.label, peso: 100 });

  if (ref.tipo === "gps") {
    if (scored.distanciaKm <= 1) candidatas.push({ label: "Cerca de ti", peso: 80 });
    else if (scored.distanciaKm <= 2) candidatas.push({ label: "En tu barrio", peso: 70 });
  } else if (c.c === ref.codComuna && respuestas.alcance !== "comuna") {
    candidatas.push({ label: "En tu comuna", peso: 70 });
  }

  if (c.k === "gratuito" || c.k === "gratuito_ley") {
    candidatas.push({ label: "Sin copago", peso: respuestas.techoCopago === 0 ? 60 : 50 });
  }
  if (respuestas.inclusion !== "no" && c.p === 1) candidatas.push({ label: "Programa PIE", peso: 85 });
  if (respuestas.inclusion !== "no" && c.e === 1) candidatas.push({ label: "Educación especial", peso: 86 });

  if (s.academico >= UMBRAL_FUERTE && (c.s ?? 0) > 0 && respuestas.perfil !== "academico") {
    candidatas.push({ label: "SIMCE sobre similares", peso: 40 });
  }
  if (s.seguridad >= UMBRAL_FUERTE && respuestas.perfil !== "convivencia") {
    candidatas.push({ label: "Pocas denuncias", peso: 35 });
  }

  candidatas.sort((a, b) => b.peso - a.peso);
  return candidatas.slice(0, 3).map((x) => x.label);
}
