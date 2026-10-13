import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FichaColegio } from "@/components/ficha/FichaColegio";
import { getDetalle } from "@/lib/data/servidor";

/**
 * Ficha por RBD. Se renderiza en el servidor a pedido (8.250 colegios): lee
 * solo el archivo de la comuna del colegio. El HTML resultante lleva sus
 * metadatos para compartir por WhatsApp.
 */
interface PageProps {
  params: { rbd: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const d = getDetalle(Number(params.rbd));
  if (!d) return { title: "Colegio no encontrado — Edubig" };
  const descripcion = `${d.comuna}. ${d.traduccion.lo_esencial.Académico}`;
  return {
    title: `${d.nombre} — Edubig`,
    description: descripcion,
    openGraph: { title: d.nombre, description: descripcion, type: "article" },
  };
}

export default function ColegioPage({ params }: PageProps) {
  const rbd = Number(params.rbd);
  if (!Number.isInteger(rbd)) notFound();
  const detalle = getDetalle(rbd);
  if (!detalle) notFound();
  return <FichaColegio detalle={detalle} />;
}
