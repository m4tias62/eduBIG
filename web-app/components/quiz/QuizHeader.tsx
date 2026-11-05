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
      <EnlaceTexto href={volverHref} className="-ml-xxs gap-xxs self-start">
        <Icon nombre="arrow_back" size={20} />
        Volver
      </EnlaceTexto>
      <p className="text-2xs text-texto-secundario">
        Pregunta {paso} de {total}
        {esPaso2 && <span> · Paso 2</span>}
      </p>
      <BarraProgreso paso={paso} total={total} />
    </header>
  );
}
