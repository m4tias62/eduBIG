"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

/**
 * Selector Lista / Mapa (v3, Figma «Toggle Lista-Mapa», nodo 837:3868).
 * Fondo rdbu-05; el segmento elegido en rdbu-10 con texto blanco y una
 * elevación leve. Hover del segmento sin elegir: fondo blanco al 60 %.
 * Foco: contorno de 2 px en rdbu-10.
 */
export type VistaResultados = "lista" | "mapa";

export function ToggleVista({
  vista,
  onCambiar,
  className,
}: {
  vista: VistaResultados;
  onCambiar: (v: VistaResultados) => void;
  className?: string;
}) {
  const segmento = (v: VistaResultados, icono: string, etiqueta: string) => (
    <button
      type="button"
      onClick={() => onCambiar(v)}
      aria-pressed={vista === v}
      className={cn(
        "inline-flex min-h-objetivo-tactil flex-1 items-center gap-xs rounded-s px-l text-xs font-bold transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rdbu-10",
        vista === v
          ? "bg-rdbu-10 text-texto-sobre-oscuro shadow-[0_0.47px_1.41px_0.47px_rgba(0,0,0,0.15),0_0.47px_0.94px_rgba(0,0,0,0.3)]"
          : "text-texto-primario hover:bg-white/60"
      )}
    >
      <Icon nombre={icono} size={18} />
      {etiqueta}
    </button>
  );

  return (
    <div role="group" aria-label="Ver resultados como" className={cn("flex w-full gap-xxs rounded-s bg-rdbu-05 p-xxs sm:w-[406px]", className)}>
      {segmento("lista", "format_list_bulleted", "Lista")}
      {segmento("mapa", "map", "Mapa")}
    </div>
  );
}
