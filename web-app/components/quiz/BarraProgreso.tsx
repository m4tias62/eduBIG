/**
 * Barra de progreso del quiz — 5 segmentos.
 * Espejo del component set Figma "Barra de progreso · Test de calce"
 * (variantes Progreso=1/5..5/5).
 *
 * Los segmentos completados son cálidos y los pendientes fríos: el eje RdBu
 * opera como metáfora de progreso, no como codificación de juicio.
 * v3 (2026-11-05): segmentos rectos, sin esquinas redondeadas (pixel art),
 * en rdbu-10 (lo hecho, el mismo rojo de lo elegido en los filtros) y
 * rdbu-05 (lo pendiente).
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
            className={`h-2 flex-1 ${completo ? "bg-rdbu-10" : "bg-rdbu-05"}`}
          />
        );
      })}
    </div>
  );
}
