import Link from "next/link";
import { BarraProgreso } from "./BarraProgreso";

/**
 * Header consistente en todas las pantallas del quiz:
 * botón Volver + label "Pregunta X de 5" (o "· Paso 2") + BarraProgreso.
 *
 * `paso` corresponde al número de la pregunta principal (1-5). Los Paso 2
 * (Q2b, Q5b/c) mantienen el mismo paso que su Paso 1 — refinements dentro
 * de la misma pregunta.
 */
export function QuizHeader({
  paso,
  total = 5,
  esPaso2 = false,
  volverHref = "/",
}: {
  paso: number;
  total?: number;
  esPaso2?: boolean;
  volverHref?: string;
}) {
  return (
    <header className="flex flex-col gap-m">
      <Link
        href={volverHref}
        className="inline-flex items-center justify-center self-start rounded-s bg-interaccion-enlace px-m py-xs text-xs font-bold text-texto-sobre-oscuro hover:bg-interaccion-enlace-hover"
      >
        Volver
      </Link>
      <p className="text-2xs text-texto-secundario">
        Pregunta {paso} de {total}
        {esPaso2 && <span> · Paso 2</span>}
      </p>
      <BarraProgreso paso={paso} total={total} />
    </header>
  );
}
