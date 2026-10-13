import { Q4Distancia } from "@/components/quiz/Q4Distancia";
import { parseRespuestas } from "@/lib/quiz/state";

/** Q4 — Distancia. La lógica vive en el cliente porque depende de la ubicación. */
export default function Q4({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return <Q4Distancia previas={parseRespuestas(searchParams)} />;
}
