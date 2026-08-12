import { getUniverso, conclusionesIndex } from "@/lib/data/schools";
import { Hero } from "@/components/home/Hero";
import { EncabezadoFiltros } from "@/components/home/EncabezadoFiltros";
import { VistaLista } from "@/components/home/VistaLista";
import { VistaMapa } from "@/components/home/VistaMapa";
import { Footer } from "@/components/platform/Footer";
import { filtrarUniverso, parseFiltros, parseVista } from "@/lib/home/filtros";

/**
 * Home — vista principal del sitio.
 *
 * URL-driven: filtros (?q, ?nivel, ?gratuito, ?dist, ?dep) y vista
 * (?vista=lista|mapa) son shareables. Server Component: filtra en render
 * y sirve HTML estático — sin runtime overhead.
 *
 * Layout adaptativo:
 *   - Vista Lista: Hero rojo → Encabezado (buscador+chips+toggle) → Lista → Footer
 *   - Vista Mapa: Encabezado → Mapa Leaflet fullscreen (sin Hero, sin Footer,
 *     para que el mapa aproveche toda la viewport)
 */
export default function Home({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const universo = getUniverso();
  const filtros = parseFiltros(searchParams);
  const vista = parseVista(searchParams);
  const colegios = filtrarUniverso(universo, filtros);

  if (vista === "mapa") {
    return (
      <>
        <EncabezadoFiltros vista={vista} filtros={filtros} />
        <VistaMapa colegios={colegios} conclusionesIndex={conclusionesIndex} />
      </>
    );
  }

  return (
    <>
      <Hero />
      <EncabezadoFiltros vista={vista} filtros={filtros} />
      <VistaLista colegios={colegios} conclusionesIndex={conclusionesIndex} />
      <Footer />
    </>
  );
}
