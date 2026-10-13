import { redirect } from "next/navigation";
import { parseRespuestas, toRespuestasFamilia } from "@/lib/quiz/state";
import { ShortlistResultado } from "@/components/quiz/ShortlistResultado";

/**
 * Resultado del Test — Shortlist. El servidor solo valida que el Test esté
 * completo; el motor corre en el cliente con la ubicación de la familia.
 */
export default function Resultado({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const previas = parseRespuestas(searchParams);
  if (!toRespuestasFamilia(previas)) redirect("/test/q1");
  return <ShortlistResultado previas={previas} />;
}
