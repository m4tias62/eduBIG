import type { ReactNode } from "react";
import { QuizHeader } from "./QuizHeader";
import { ChipContexto } from "./ChipContexto";
import { NotaLegitimacion } from "./NotaLegitimacion";

/**
 * Layout uniforme de una pantalla del quiz.
 *
 * Espejo estructural de las pantallas Q1-Q5 en Figma: 390 ancho fijo,
 * padding y gap 36px. Renderiza el header + chip contexto (opcional para
 * Paso 2) + título + subtítulo opcional + nota de legitimación (opcional)
 * + slot de opciones.
 */
export function PreguntaLayout({
  paso,
  esPaso2,
  volverHref,
  contexto,
  titulo,
  subtitulo,
  nota,
  children,
}: {
  paso: number;
  esPaso2?: boolean;
  volverHref: string;
  contexto?: string;
  titulo: string;
  subtitulo?: string;
  nota?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md min-h-screen flex flex-col gap-[36px] p-[36px] bg-superficie-base">
      <QuizHeader paso={paso} esPaso2={esPaso2} volverHref={volverHref} />
      <div className="flex flex-col gap-m">
        {contexto && <ChipContexto>{contexto}</ChipContexto>}
        <h1 className="text-lg font-bold text-texto-primario">{titulo}</h1>
        {subtitulo && (
          <p className="text-xs text-texto-secundario">{subtitulo}</p>
        )}
      </div>
      {nota && <NotaLegitimacion>{nota}</NotaLegitimacion>}
      <div className="flex flex-col gap-m">{children}</div>
    </div>
  );
}
