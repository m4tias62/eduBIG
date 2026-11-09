import { redirect } from "next/navigation";
import { parseFiltros, serializeFiltros } from "@/lib/home/filtros";

/**
 * /explorar se retiró el 2026-11-09 (Matías: «esta sección ya no es así en el
 * diseño porque ya se ha rediseñado»). La exploración vive en la Home (y, para
 * sumar colegios, dentro de Comparar). Los enlaces antiguos llevan al
 * explorador de la Home con los mismos filtros: /explorar?comuna=7202 →
 * /?comuna=7202#explorar.
 */
export default function Explorar({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const qs = serializeFiltros(parseFiltros(searchParams));
  redirect(qs ? `/?${qs}#explorar` : "/#explorar");
}
