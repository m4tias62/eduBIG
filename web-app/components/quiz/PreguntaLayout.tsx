import type { ReactNode } from "react";
import { QuizHeader } from "./QuizHeader";
import { ChipContexto } from "./ChipContexto";
import { NotaLegitimacion } from "./NotaLegitimacion";
import { RETICULA_LG } from "@/components/platform/reticula";

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
    // Escritorio: la pregunta va en una tarjeta gris sobre fondo blanco, igual
    // que las tarjetas del resto del sitio (Comparar), con la barra de
    // navegación y el footer de todas las páginas y el mismo margen superior
    // (32 px) e inferior (48 px).
    // Retícula: la tarjeta ocupa las columnas 1–6, alineada a la izquierda como
    // el resto del sitio. En móvil y tablet la columna parte en el margen.
    <div className="bg-superficie-base lg:pt-xl lg:pb-xxl">
    <div className={RETICULA_LG}>
    <div className="w-full max-w-md flex flex-col gap-[36px] p-[36px] bg-superficie-base lg:col-span-6 lg:max-w-none lg:rounded-m lg:border lg:border-borde-sutil lg:bg-superficie-elevada">
      <QuizHeader paso={paso} esPaso2={esPaso2} volverHref={volverHref} />
      <div className="flex flex-col gap-m">
        {contexto && <ChipContexto>{contexto}</ChipContexto>}
        <h1 className="text-lg font-bold text-texto-primario">{titulo}</h1>
        {subtitulo && (
          <p className="text-xs text-texto-secundario">{subtitulo}</p>
        )}
      </div>
      {nota && <NotaLegitimacion className="lg:bg-superficie-base">{nota}</NotaLegitimacion>}
      <div className="flex flex-col gap-m">{children}</div>
    </div>
    </div>
    </div>
  );
}
