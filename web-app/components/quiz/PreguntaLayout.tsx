import type { ReactNode } from "react";
import { QuizHeader } from "./QuizHeader";
import { ChipContexto } from "./ChipContexto";
import { NotaLegitimacion } from "./NotaLegitimacion";
import { RETICULA_LG } from "@/components/platform/reticula";
import { PANEL_V3_LG } from "@/components/ui/Panel";
import { cn } from "@/lib/utils";

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
    // Escritorio: la pregunta va en una tarjeta sobre fondo blanco, con la barra
    // de navegación y el footer de todas las páginas y el mismo margen superior
    // (32 px) e inferior (48 px).
    // v3 (2026-11-05): la tarjeta toma la estética del panel de filtros:
    // borde rdbu-10 de 2 px arriba e izquierda y 4 px a la derecha y abajo,
    // esquinas de 4 px, sombra y fondo gris claro (PANEL_V3).
    // Retícula: la tarjeta ocupa las columnas 1–6, alineada a la izquierda como
    // el resto del sitio. En móvil y tablet la columna parte en el margen.
    <div className="bg-superficie-base lg:pt-xl lg:pb-xxl">
    <div className={RETICULA_LG}>
    <div className={cn("w-full max-w-md flex flex-col gap-[36px] p-[36px] bg-superficie-base lg:col-span-6 lg:max-w-none", PANEL_V3_LG)}>
      <QuizHeader paso={paso} esPaso2={esPaso2} volverHref={volverHref} />
      <div className="flex flex-col gap-m">
        {contexto && <ChipContexto>{contexto}</ChipContexto>}
        <h1 className="font-heading text-lg font-bold tracking-[0.015em] text-rdbu-01">{titulo}</h1>
        {subtitulo && (
          <p className="text-xs text-texto-secundario">{subtitulo}</p>
        )}
      </div>
      {nota && <NotaLegitimacion>{nota}</NotaLegitimacion>}
      <div className="flex flex-col gap-m">{children}</div>
    </div>
    </div>
    </div>
  );
}
