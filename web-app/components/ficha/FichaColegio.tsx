import type { DetalleColegio } from "@/lib/types";
import { BotonVolver } from "./BotonVolver";
import { Cabecera } from "./Cabecera";
import { LoEsencial } from "./LoEsencial";
import { ModuloSeguridad } from "./ModuloSeguridad";
import { ModuloBienestar } from "./ModuloBienestar";
import { ModuloAcademico } from "./ModuloAcademico";
import { ModuloTrayectoria } from "./ModuloTrayectoria";
import { ModuloCosto } from "./ModuloCosto";
import { RETICULA_LG } from "@/components/platform/reticula";

/**
 * Ficha del colegio — orden fijo de módulos (D07), contenido dinámico:
 *   Volver → Cabecera → Lo esencial → Seguridad → Bienestar → Académico →
 *   Ingreso a la U (solo con media, D28) → Costo.
 *
 * Escritorio (≥ 1024 px): dos columnas. Identidad y "Lo esencial" quedan
 * fijos a la izquierda mientras se recorren los módulos a la derecha.
 */
export function FichaColegio({ detalle }: { detalle: DetalleColegio }) {
  return (
    <>
      {/* Retícula: identidad y "Lo esencial" en columnas 1–4; módulos en 5–12.
          Móvil y tablet: columna de 28rem de contenido (31rem con el padding),
          alineada al margen izquierdo como el resto del sitio. */}
      <article className={`flex flex-col gap-l p-l max-w-[31rem] lg:items-start lg:py-xl ${RETICULA_LG}`}>
        <div className="flex flex-col gap-l lg:col-span-4 lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-112px)] lg:overflow-y-auto lg:pr-xs">
          <BotonVolver href="/explorar" />
          <Cabecera detalle={detalle} />
          <LoEsencial detalle={detalle} />
        </div>
        <div className="flex flex-col gap-l lg:col-span-8">
          <ModuloSeguridad detalle={detalle} />
          <ModuloBienestar detalle={detalle} />
          <ModuloAcademico detalle={detalle} />
          {detalle.ofrece_media && <ModuloTrayectoria detalle={detalle} />}
          <ModuloCosto detalle={detalle} />
        </div>
      </article>
    </>
  );
}
