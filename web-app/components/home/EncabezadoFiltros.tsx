import { Icon } from "@/components/ui/Icon";
import { FiltroChip } from "./FiltroChip";
import { ToggleListaMapa } from "./ToggleListaMapa";
import type { FiltrosHome } from "@/lib/home/filtros";
import { toggleFiltroUrl } from "@/lib/home/filtros";

/**
 * Encabezado de exploración — buscador + chips de filtro + toggle vista.
 * Espejo del frame Figma "Encabezado" (61:4).
 *
 * Los chips con `conChevron` (Nivel, Distancia, Tipo) son placeholders
 * hoy — al hacer click aplican el primer valor de su categoría. En una
 * iteración futura se puede convertir en dropdowns reales (Popover + Radio).
 *
 * TODO iteración 2: buscador funcional (hoy es placeholder visual, filtra
 * solo si se pasa ?q= en la URL manualmente).
 */
export function EncabezadoFiltros({
  vista,
  filtros,
}: {
  vista: "lista" | "mapa";
  filtros: FiltrosHome;
}) {
  return (
    <section className="bg-superficie-base px-l py-m flex flex-col gap-m border-b border-borde-sutil">
      {/* Buscador (visual — funcional por URL manual por ahora) */}
      <div className="flex items-center gap-xs rounded-s bg-superficie-elevada border border-borde-definido px-m py-xs">
        <Icon nombre="search" size={20} className="text-texto-secundario" />
        <span className="text-xs text-texto-secundario">
          {filtros.q ? `"${filtros.q}"` : "Buscar colegio o comuna"}
        </span>
      </div>

      {/* Chips de filtro */}
      <div className="flex flex-wrap gap-xs">
        <FiltroChip
          label="Gratuito"
          href={toggleFiltroUrl(filtros, vista, {
            gratuito: filtros.gratuito ? undefined : true,
          })}
          activo={!!filtros.gratuito}
        />
        <FiltroChip
          label={filtros.nivel === "basica" ? "Básica" : filtros.nivel === "media" ? "Media" : filtros.nivel === "basica_y_media" ? "Ambos" : "Nivel"}
          href={toggleFiltroUrl(filtros, vista, {
            nivel:
              filtros.nivel === undefined ? "basica"
              : filtros.nivel === "basica" ? "media"
              : filtros.nivel === "media" ? "basica_y_media"
              : undefined,
          })}
          activo={filtros.nivel !== undefined}
          conChevron
        />
        <FiltroChip
          label={filtros.distanciaMaxKm !== undefined ? `Hasta ${filtros.distanciaMaxKm} km` : "Distancia"}
          href={toggleFiltroUrl(filtros, vista, {
            distanciaMaxKm:
              filtros.distanciaMaxKm === undefined ? 1
              : filtros.distanciaMaxKm === 1 ? 2
              : filtros.distanciaMaxKm === 2 ? 5
              : undefined,
          })}
          activo={filtros.distanciaMaxKm !== undefined}
          conChevron
        />
        <FiltroChip
          label={
            filtros.dependencia === "publica" ? "Pública (SLEP)"
            : filtros.dependencia === "part_subvencionado" ? "Part. subvencionado"
            : filtros.dependencia === "part_pagado" ? "Part. pagado"
            : "Tipo de colegio"
          }
          href={toggleFiltroUrl(filtros, vista, {
            dependencia:
              filtros.dependencia === undefined ? "publica"
              : filtros.dependencia === "publica" ? "part_subvencionado"
              : filtros.dependencia === "part_subvencionado" ? "part_pagado"
              : undefined,
          })}
          activo={filtros.dependencia !== undefined}
          conChevron
        />
      </div>

      {/* Toggle Lista / Mapa */}
      <ToggleListaMapa vista={vista} filtros={filtros} />
    </section>
  );
}
