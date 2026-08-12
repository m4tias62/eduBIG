/**
 * Gráfico de brecha SIMCE — barras verticales alrededor de una línea cero.
 *
 * Cada barra = diferencia del colegio vs. grupo de colegios similares
 * (mismo GSE) para un curso dado. Escala universal FIJA de ±56 puntos,
 * derivada del rango real entre los 57 colegios de Pudahuel (registrado
 * en bitácora original — mantiene comparabilidad entre fichas).
 *
 * Deliberadamente NO usa color para codificar signo (memoria: el eje RdBu
 * está reservado a temperatura frío/cálido). La posición arriba/abajo del
 * cero + el label numérico son la redundancia WCAG 1.4.1.
 */

const ESCALA_MAX = 56;

export function BarraBrechaSimce({
  titulo,
  brechas,
}: {
  titulo: string;
  brechas: Array<{ curso: string; valor: number | null }>;
}) {
  const visibles = brechas.filter((b) => b.valor !== null) as Array<{ curso: string; valor: number }>;
  if (visibles.length === 0) {
    return (
      <div className="flex flex-col gap-xs">
        <h5 className="text-xs font-bold text-texto-primario">{titulo}</h5>
        <p className="text-2xs text-texto-secundario">Sin datos publicados para este curso.</p>
      </div>
    );
  }

  const VB_W = 320;
  const VB_H = 200;
  const CERO_Y = 100;
  const BAR_MAX_H = 80; // 56 pts → 80 px
  const BAR_W = 28;
  const slotW = VB_W / visibles.length;

  return (
    <figure className="flex flex-col gap-xs">
      <figcaption className="text-xs font-bold text-texto-primario">{titulo}</figcaption>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label={`${titulo}: ${visibles.map((v) => `${v.curso} ${v.valor > 0 ? "+" : ""}${v.valor}`).join(", ")}`}
        className="w-full h-auto"
      >
        {/* Línea cero */}
        <line
          x1={0} x2={VB_W}
          y1={CERO_Y} y2={CERO_Y}
          className="stroke-borde-enfatico"
          strokeWidth={1}
        />
        {/* Etiqueta de escala */}
        <text
          x={4} y={12}
          className="fill-texto-terciario text-[10px]"
        >
          +{ESCALA_MAX}
        </text>
        <text
          x={4} y={VB_H - 24}
          className="fill-texto-terciario text-[10px]"
        >
          −{ESCALA_MAX}
        </text>

        {visibles.map((b, i) => {
          const cx = slotW * i + slotW / 2;
          const bx = cx - BAR_W / 2;
          const clamp = Math.max(-ESCALA_MAX, Math.min(ESCALA_MAX, b.valor));
          const h = Math.abs(clamp) / ESCALA_MAX * BAR_MAX_H;
          const y = b.valor >= 0 ? CERO_Y - h : CERO_Y;
          const labelY = b.valor >= 0 ? y - 4 : y + h + 12;
          const label = `${b.valor > 0 ? "+" : ""}${Math.round(b.valor)}`;
          return (
            <g key={b.curso}>
              <rect
                x={bx} y={y}
                width={BAR_W} height={Math.max(h, 1)}
                className="fill-superficie-inversa"
                rx={2}
              />
              <text
                x={cx} y={labelY}
                textAnchor="middle"
                className="fill-texto-primario text-[10px] font-bold"
              >
                {label}
              </text>
              <text
                x={cx} y={VB_H - 4}
                textAnchor="middle"
                className="fill-texto-secundario text-[10px]"
              >
                {b.curso}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
