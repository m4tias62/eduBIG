/**
 * Barra de progreso del quiz — 5 segmentos.
 * Espejo del component set Figma "Barra de progreso · Test de calce"
 * (variantes Progreso=1/5..5/5).
 *
 * Los segmentos completados son cálidos (temperatura/calido-profundo),
 * los pendientes son fríos (temperatura/frio-suave). Único uso permitido
 * del eje RdBu fuera de la firma de marca — aquí opera como metáfora de
 * progreso, no como codificación de juicio.
 */
export function BarraProgreso({ paso, total = 5 }: { paso: number; total?: number }) {
  return (
    <div
      className="flex gap-1"
      role="progressbar"
      aria-valuenow={paso}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Progreso: pregunta ${paso} de ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const completo = i < paso;
        return (
          <div
            key={i}
            className={`h-2 flex-1 rounded-s ${completo ? "bg-temp-calido-profundo" : "bg-temp-frio-suave"}`}
          />
        );
      })}
    </div>
  );
}
