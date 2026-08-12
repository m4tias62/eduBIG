import type { Colegio, RangoCopago } from "@/lib/types";

/**
 * Helpers de formateo y derivación de strings human-readable a partir de
 * los campos crudos del pipeline. Mismos códigos + glosas que produce
 * `identidad.dependencia` en colegios_conclusiones.json.
 */

/** COD_DEPE → glosa oficial (misma que usa el pipeline en identidad.dependencia). */
export function dependenciaGlosa(codDepe: number): string {
  switch (codDepe) {
    case 3:
      return "Particular subvencionado";
    case 4:
      return "Particular pagado";
    case 6:
      return "Educación pública (SLEP)";
    default:
      return "Dependencia sin clasificar";
  }
}

/** Niveles ofrecidos → glosa corta. */
export function nivelesGlosa(ofreceBasica: boolean, ofreceMedia: boolean): string {
  if (ofreceBasica && ofreceMedia) return "Básica y Media";
  if (ofreceBasica) return "Básica";
  if (ofreceMedia) return "Media";
  return "Niveles no informados";
}

/**
 * Normaliza los rangos crudos de Mineduc (ALL-CAPS) a sentence case.
 * Ejemplo: "MAS DE $100.000" → "Más de $100.000".
 * Observación registrada en bitácora — a futuro conviene hacerlo en el pipeline.
 */
export function formatearCopago(rango: RangoCopago): string {
  const mapa: Record<RangoCopago, string> = {
    GRATUITO: "Gratuito",
    "$1.000 A $10.000": "$1.000 a $10.000",
    "$10.001 A $25.000": "$10.001 a $25.000",
    "$25.001 A $50.000": "$25.001 a $50.000",
    "$50.001 A $100.000": "$50.001 a $100.000",
    "MAS DE $100.000": "Más de $100.000",
    SIN_INFORMACION: "Sin información",
    "SIN INFORMACION": "Sin información",
  } as Record<RangoCopago, string>;
  return mapa[rango] ?? String(rango);
}

/** Matrícula total → "445 estudiantes". */
export function matriculaGlosa(mat: number): string {
  return `${mat.toLocaleString("es-CL")} estudiantes`;
}

/** Determina el "Estado" visual del Módulo Costo según los datos. */
export type EstadoCosto = "gratuito" | "con_copago" | "sin_informacion";
export function estadoCosto(c: Colegio): EstadoCosto {
  if (c.PAGO_MENSUAL === "SIN INFORMACION" && c.PAGO_MATRICULA === "SIN INFORMACION") {
    return "sin_informacion";
  }
  if (c.PAGO_MENSUAL === "GRATUITO" && c.PAGO_MATRICULA === "GRATUITO") {
    return "gratuito";
  }
  return "con_copago";
}

/** Conclusión del costo en 1 línea (misma lógica que lo_esencial.Costo del pipeline). */
export function conclusionCosto(c: Colegio): string {
  const est = estadoCosto(c);
  if (est === "gratuito") return "Gratuito, sin copago.";
  if (est === "sin_informacion") return "Sin información de copago publicada.";
  return `Copago mensual: ${formatearCopago(c.PAGO_MENSUAL)}.`;
}
