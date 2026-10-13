import type { Metadata } from "next";
import { Exploracion } from "@/components/explorar/Exploracion";
import { Footer } from "@/components/platform/Footer";
import { parseFiltros } from "@/lib/home/filtros";
import { getComunas } from "@/lib/data/servidor";

/**
 * Exploración (D34). URL-driven: comuna, filtros, orden y vista son
 * compartibles; la ubicación GPS vive solo en el navegador.
 */
export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): Metadata {
  const f = parseFiltros(searchParams);
  const comuna = f.comuna ? getComunas().find((c) => c.cod === f.comuna) : undefined;
  return {
    title: comuna ? `Colegios en ${comuna.nombre} — Edubig` : "Explorar colegios — Edubig",
  };
}

export default function Explorar({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <>
      <main className="min-h-[70vh]">
        <Exploracion filtros={parseFiltros(searchParams)} />
      </main>
      <Footer />
    </>
  );
}
