import { Icon } from "@/components/ui/Icon";
import { BarraFiltros } from "./BarraFiltros";
import { ToggleListaMapa } from "./ToggleListaMapa";
import type { FiltrosHome } from "@/lib/home/filtros";

/**
 * Encabezado de exploración — buscador + barra de filtros + toggle vista.
 * Espejo del frame Figma "Encabezado" (61:4).
 *
 * Los filtros viven en <BarraFiltros /> (client component): chips en una
 * sola línea, con acordeón desplegable multi-selección para Nivel, Distancia
 * y Tipo de colegio. "Gratuito" aplica al instante como toggle.
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

      {/* Chips de filtro + acordeón */}
      <BarraFiltros vista={vista} filtros={filtros} />

      {/* Toggle Lista / Mapa */}
      <ToggleListaMapa vista={vista} filtros={filtros} />
    </section>
  );
}
