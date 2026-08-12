import type { Perfil, TipoDistancia } from "./types";

/**
 * Distribución de pesos base por perfil de prioridad (Q5 del quiz).
 *
 * Cada perfil pone 50% en su dimensión, 5% en cada una de las otras cuatro
 * dimensiones IDPS/SIMCE, y 30% en distancia. El perfil "todo_por_igual"
 * reparte 14% × 5 dimensiones + 30% distancia (suma = 1.00).
 */
export const pesosBase: Record<Perfil, Record<string, number>> = {
  academico:      { academico: 0.50, autoestima: 0.05, habitos: 0.05, convivencia: 0.05, participacion: 0.05, distancia: 0.30 },
  autoestima:     { academico: 0.05, autoestima: 0.50, habitos: 0.05, convivencia: 0.05, participacion: 0.05, distancia: 0.30 },
  habitos:        { academico: 0.05, autoestima: 0.05, habitos: 0.50, convivencia: 0.05, participacion: 0.05, distancia: 0.30 },
  convivencia:    { academico: 0.05, autoestima: 0.05, habitos: 0.05, convivencia: 0.50, participacion: 0.05, distancia: 0.30 },
  participacion:  { academico: 0.05, autoestima: 0.05, habitos: 0.05, convivencia: 0.05, participacion: 0.50, distancia: 0.30 },
  todo_por_igual: { academico: 0.14, autoestima: 0.14, habitos: 0.14, convivencia: 0.14, participacion: 0.14, distancia: 0.30 },
};

/**
 * Calcula los pesos finales según perfil y tipo de distancia.
 * Si la distancia es dura, se remueve el peso de distancia (ya se filtró
 * en Capa 1) y se renormalizan los pesos restantes para que sumen 1.0.
 */
export function calcularPesosFinales(
  perfil: Perfil,
  tipoDistancia: TipoDistancia
): Record<string, number> {
  const pesos = { ...pesosBase[perfil] };
  if (tipoDistancia === "duro") {
    delete pesos.distancia;
    const total = Object.values(pesos).reduce((a, b) => a + b, 0);
    for (const k of Object.keys(pesos)) pesos[k] = pesos[k] / total;
  }
  return pesos;
}
