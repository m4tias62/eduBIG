import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { FiltrosHome } from "@/lib/home/filtros";
import { serializeFiltros } from "@/lib/home/filtros";

/**
 * Toggle segmentado Lista ↔ Mapa. Preserva filtros al cambiar de vista.
 * Espejo del component set "Toggle Lista-Mapa" del Figma.
 */
export function ToggleListaMapa({
  vista,
  filtros,
}: {
  vista: "lista" | "mapa";
  filtros: FiltrosHome;
}) {
  const hrefLista = "/?" + serializeFiltros(filtros, { vista: "lista" });
  const hrefMapa = "/?" + serializeFiltros(filtros, { vista: "mapa" });

  return (
    <div className="inline-flex self-start rounded-s bg-superficie-hundida p-xxs">
      <Link
        href={hrefLista}
        className={cn(
          "inline-flex items-center gap-xs rounded-s px-l py-xs text-xs font-bold",
          vista === "lista"
            ? "bg-superficie-base text-texto-primario"
            : "text-texto-secundario"
        )}
      >
        <Icon nombre="format_list_bulleted" size={18} />
        Lista
      </Link>
      <Link
        href={hrefMapa}
        className={cn(
          "inline-flex items-center gap-xs rounded-s px-l py-xs text-xs font-bold",
          vista === "mapa"
            ? "bg-superficie-base text-texto-primario"
            : "text-texto-secundario"
        )}
      >
        <Icon nombre="map" size={18} />
        Mapa
      </Link>
    </div>
  );
}
