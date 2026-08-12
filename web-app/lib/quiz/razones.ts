import type { Colegio } from "@/lib/types";
import type { ScoredColegio, RespuestasFamilia } from "@/lib/motor";

/**
 * Deriva las "razones del calce" que se muestran como badges en la
 * TarjetaColegio del Shortlist. Máximo 3, priorizando las que responden
 * al perfil elegido por la familia.
 *
 * Regla de umbral 0.6: la normalización es sobre el universo completo,
 * así que 0.6 significa "en el tercio superior del universo".
 */

export interface RazonCalce {
  label: string;
  /** Prioridad para ordenar razones (más alta primero). */
  peso: number;
}

const UMBRAL_FUERTE = 0.6;

export function razonesCalce(
  scored: ScoredColegio,
  colegio: Colegio,
  respuestas: RespuestasFamilia
): string[] {
  const s = scored.scores;
  const candidatas: RazonCalce[] = [];

  // Razón principal si matchea con el perfil elegido
  const matchPerfil: Record<RespuestasFamilia["perfil"], { dim: keyof typeof s; label: string } | null> = {
    academico:      { dim: "academico",     label: "Fuerte académico" },
    autoestima:     { dim: "autoestima",    label: "Fuerte en autoestima" },
    habitos:        { dim: "habitos",       label: "Fuerte en hábitos saludables" },
    convivencia:    { dim: "convivencia",   label: "Buena convivencia" },
    participacion:  { dim: "participacion", label: "Fuerte participación" },
    todo_por_igual: null,
  };
  const match = matchPerfil[respuestas.perfil];
  if (match && s[match.dim] >= UMBRAL_FUERTE) {
    candidatas.push({ label: match.label, peso: 100 });
  }

  // Distancia (siempre relevante en móvil urbano)
  if (scored.distanciaKm <= 1) candidatas.push({ label: "Cerca de tu casa", peso: 80 });
  else if (scored.distanciaKm <= 2) candidatas.push({ label: "En tu barrio", peso: 70 });

  // Copago gratuito (relevante siempre si la familia lo eligió)
  if (colegio.PAGO_MENSUAL === "GRATUITO") {
    const peso = respuestas.techoCopago === 0 ? 90 : 50;
    candidatas.push({ label: "Sin copago", peso });
  }

  // Convenio PIE cuando familia quiere inclusión
  if (respuestas.quiereInclusion && colegio.CONVENIO_PIE === 1) {
    candidatas.push({ label: "Convenio PIE", peso: 85 });
  }
  if (respuestas.quiereInclusion && colegio.ofrece_educacion_especial) {
    candidatas.push({ label: "Educación especial", peso: 85 });
  }

  // Razones secundarias — otras dimensiones fuertes
  if (s.academico >= UMBRAL_FUERTE && respuestas.perfil !== "academico") {
    candidatas.push({ label: "Sobre similares en SIMCE", peso: 40 });
  }
  if (s.seguridad >= UMBRAL_FUERTE) {
    candidatas.push({ label: "Pocas denuncias", peso: 35 });
  }

  candidatas.sort((a, b) => b.peso - a.peso);
  return candidatas.slice(0, 3).map((c) => c.label);
}

/** Formatea distancia en metros/km según magnitud. */
export function formatearDistancia(km: number): string {
  if (km < 1) return `A ${Math.round(km * 1000)} m de tu casa`;
  return `A ${km.toFixed(1).replace(".", ",")} km de tu casa`;
}
