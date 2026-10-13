/**
 * Barras absolutas IDPS (0–100): este colegio vs. colegios similares.
 *
 * La barra del promedio nacional se retiró (Fase B, §5): la comparación justa
 * es contra colegios como este. Color = identidad de serie (Carril C), no
 * valoración; la etiqueta de cada barra da la redundancia (WCAG 1.4.1).
 */
const IDPS_MAX = 100;

export function BarraAbsolutaIdps({
  este,
  similares,
  descripcion,
}: {
  este: number | null;
  similares: number | null;
  descripcion: string;
}) {
  const filas = [
    { label: "Este colegio", valor: este, colorClass: "fill-viz-serie-este" },
    { label: "Colegios similares", valor: similares, colorClass: "fill-viz-serie-similares" },
  ];
  const VB_W = 320;
  const ROW_H = 32;
  const VB_H = filas.length * ROW_H;
  const LABEL_W = 124;
  const BAR_MAX_W = VB_W - LABEL_W - 36;

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} role="img" aria-label={descripcion} className="w-full h-auto">
      {filas.map((f, i) => {
        const y = i * ROW_H;
        const w = f.valor !== null ? (Math.max(0, Math.min(IDPS_MAX, f.valor)) / IDPS_MAX) * BAR_MAX_W : 0;
        return (
          <g key={f.label}>
            <text x={0} y={y + ROW_H / 2 + 4} className="fill-texto-primario text-[11px]">
              {f.label}
            </text>
            <rect x={LABEL_W} y={y + ROW_H / 2 - 6} width={BAR_MAX_W} height={12} className="fill-superficie-hundida" rx={2} />
            {f.valor !== null ? (
              <>
                <rect x={LABEL_W} y={y + ROW_H / 2 - 6} width={w} height={12} className={f.colorClass} rx={2} />
                <text x={LABEL_W + w + 6} y={y + ROW_H / 2 + 4} className="fill-texto-primario text-[11px] font-bold">
                  {Math.round(f.valor)}
                </text>
              </>
            ) : (
              <text x={LABEL_W + 8} y={y + ROW_H / 2 + 4} className="fill-texto-secundario text-[11px] italic">
                sin comparación publicada
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
