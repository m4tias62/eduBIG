import { BuscadorInput } from "./BuscadorInput";
import { BarraFiltros } from "./BarraFiltros";
import { ToggleListaMapa } from "./ToggleListaMapa";
import { BotonVolver } from "@/components/ficha/BotonVolver";
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
      {/* Volver — solo en vista Mapa (en Lista, arriba va el Hero) */}
      {vista === "mapa" && <BotonVolver href="/" />}

      {/* Buscador funcional — filtra por ?q= (nombre o comuna) con debounce */}
      <BuscadorInput vista={vista} filtros={filtros} />

      {/* Chips de filtro + acordeón */}
      <BarraFiltros vista={vista} filtros={filtros} />

      {/* Toggle Lista / Mapa */}
      <ToggleListaMapa vista={vista} filtros={filtros} />
    </section>
  );
}
