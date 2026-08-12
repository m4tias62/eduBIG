/**
 * Gráfico de barras absolutas IDPS — 3 barras horizontales para comparar
 * este colegio contra colegios similares y contra el promedio nacional.
 *
 * Decisión de diseño explícita del pipeline (registrado en bitácora):
 * Bienestar mantiene barras absolutas en escala 0–100, mientras que
 * Académico usa brechas ±56. No es inconsistencia — es coherente con la
 * naturaleza distinta de cada dato (IDPS es índice absoluto; SIMCE se
 * lee mejor en diferencia contra pares).
 */

const IDPS_MAX = 100;

export function BarraAbsolutaIdps({
  este,
  similares,
  nacional,
  labelEste = "Este colegio",
  labelSimilares = "Colegios similares",
  labelNacional = "Promedio nacional",
}: {
  este: number | null;
  similares: number | null;
  nacional: number | null;
  labelEste?: string;
  labelSimilares?: string;
  labelNacional?: string;
}) {
  const filas = [
    { label: labelEste, valor: este, destacar: true },
    { label: labelSimilares, valor: similares, destacar: false },
    { label: labelNacional, valor: nacional, destacar: false },
  ];

  const VB_W = 320;
  const ROW_H = 36;
  const VB_H = filas.length * ROW_H;
  const LABEL_W = 130;
  const BAR_MAX_W = VB_W - LABEL_W - 40; // 40 = espacio para el valor numérico

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      role="img"
      className="w-full h-auto"
    >
      {filas.map((f, i) => {
        const y = i * ROW_H;
        const bx = LABEL_W;
        const w = f.valor !== null ? (Math.max(0, Math.min(IDPS_MAX, f.valor)) / IDPS_MAX) * BAR_MAX_W : 0;
        return (
          <g key={f.label}>
            <text
              x={0} y={y + ROW_H / 2 + 4}
              className="fill-texto-primario text-[11px]"
            >
              {f.label}
            </text>
            <rect
              x={bx} y={y + ROW_H / 2 - 6}
              width={BAR_MAX_W} height={12}
              className="fill-superficie-hundida"
              rx={2}
            />
            {f.valor !== null ? (
              <>
                <rect
                  x={bx} y={y + ROW_H / 2 - 6}
                  width={w} height={12}
                  className={f.destacar ? "fill-superficie-inversa" : "fill-borde-enfatico"}
                  rx={2}
                />
                <text
                  x={bx + w + 6} y={y + ROW_H / 2 + 4}
                  className="fill-texto-primario text-[11px] font-bold"
                >
                  {Math.round(f.valor)}
                </text>
              </>
            ) : (
              <text
                x={bx + 8} y={y + ROW_H / 2 + 4}
                className="fill-texto-terciario text-[11px] italic"
              >
                sin dato
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
