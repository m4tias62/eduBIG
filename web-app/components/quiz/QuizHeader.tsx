import { EnlaceTexto } from "@/components/ui/EnlaceTexto";
import { Icon } from "@/components/ui/Icon";
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
      {/* v3: enlace de texto con sus estados (hover, presionado y foco en
          rdbu-10), como la navegación; el botón azul lleno competía con las
          respuestas, que son la acción de la pantalla. */}
      {/* Escritorio: «Pregunta X de 5» va en la misma fila que «Volver», a la
          derecha, para que la pregunta quepa sin scroll (2026-11-05). */}
      <div className="flex flex-col gap-m lg:flex-row lg:items-center lg:justify-between">
        <EnlaceTexto href={volverHref} className="-ml-xxs gap-xxs self-start lg:self-auto">
          <Icon nombre="arrow_back" size={20} />
          Volver
        </EnlaceTexto>
        <p className="text-2xs text-texto-secundario">
          Pregunta {paso} de {total}
          {esPaso2 && <span> · Paso 2</span>}
        </p>
      </div>
      <BarraProgreso paso={paso} total={total} />
    </header>
  );
}
