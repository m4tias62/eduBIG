import { getUniverso, conclusionesIndex } from "@/lib/data/schools";
import { Hero } from "@/components/home/Hero";
import { EncabezadoFiltros } from "@/components/home/EncabezadoFiltros";
import { VistaLista } from "@/components/home/VistaLista";
import { VistaMapa } from "@/components/home/VistaMapa";
import { Footer } from "@/components/platform/Footer";
import { UbicacionProvider } from "@/lib/ubicacion";
import { filtrarUniverso, parseFiltros, parseVista } from "@/lib/home/filtros";

/**
 * Home — vista principal del sitio.
 *
 * URL-driven: filtros (?q, ?nivel, ?gratuito, ?dist, ?dep) y vista
 * (?vista=lista|mapa) son shareables. Server Component: filtra en render
 * y sirve HTML estático.
 *
 * Distancia: el radio (?dist) sí va en la URL, pero el PUNTO DE REFERENCIA
 * (la ubicación del usuario) es un dato sensible y vive solo en el cliente
 * (ver lib/ubicacion). Por eso el filtro por distancia se aplica en cliente
 * (VistaLista / VistaMapa) desde la ubicación del usuario o, como fallback,
 * el centro de Pudahuel. Server-side aplicamos todos los filtros MENOS la
 * distancia.
 *
 * Layout adaptativo:
 *   - Vista Lista: Hero rojo → Encabezado → Lista → Footer
 *   - Vista Mapa: Encabezado → Mapa Leaflet fullscreen
 */
export default function Home({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const universo = getUniverso();
  const filtros = parseFiltros(searchParams);
  const vista = parseVista(searchParams);
  const colegios = filtrarUniverso(universo, { ...filtros, distanciaMaxKm: undefined });

  if (vista === "mapa") {
    return (
      <UbicacionProvider>
        <EncabezadoFiltros vista={vista} filtros={filtros} />
        <VistaMapa
          colegios={colegios}
          conclusionesIndex={conclusionesIndex}
          distanciaMaxKm={filtros.distanciaMaxKm}
        />
      </UbicacionProvider>
    );
  }

  return (
    <UbicacionProvider>
      <Hero />
      <EncabezadoFiltros vista={vista} filtros={filtros} />
      <VistaLista
        colegios={colegios}
        conclusionesIndex={conclusionesIndex}
        distanciaMaxKm={filtros.distanciaMaxKm}
      />
      <Footer />
    </UbicacionProvider>
  );
}
