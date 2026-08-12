import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FichaColegio } from "@/components/ficha/FichaColegio";
import {
  getAllRbds,
  getColegio,
  getConclusionesColegio,
} from "@/lib/data/schools";

/**
 * Ruta estática por RBD — Next 14 App Router.
 *
 * `generateStaticParams` pre-renderiza los 57 colegios del universo al
 * build. Cada ficha resultante es un HTML estático servible directamente
 * desde CDN — carga instantánea, indexable por buscadores, compartible
 * por URL a familias reales.
 */

interface PageProps {
  params: { rbd: string };
}

export function generateStaticParams(): Array<{ rbd: string }> {
  return getAllRbds().map((rbd) => ({ rbd: String(rbd) }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const rbd = Number(params.rbd);
  const colegio = getColegio(rbd);
  const conclusiones = getConclusionesColegio(rbd);
  if (!colegio) return { title: "Colegio no encontrado — Edubig" };

  const descripcionCorta =
    conclusiones?.lo_esencial.Académico ??
    "Ficha del colegio con datos oficiales traducidos.";
  return {
    title: `${colegio.NOM_RBD} — Edubig`,
    description: descripcionCorta,
    openGraph: {
      title: `${colegio.NOM_RBD}`,
      description: descripcionCorta,
      type: "article",
    },
  };
}

export default function ColegioPage({ params }: PageProps) {
  const rbd = Number(params.rbd);
  if (Number.isNaN(rbd)) notFound();

  const colegio = getColegio(rbd);
  if (!colegio) notFound();

  const conclusiones = getConclusionesColegio(rbd);
  return <FichaColegio colegio={colegio} conclusiones={conclusiones} />;
}
