import type { DetalleColegio } from "@/lib/types";
import { BotonVolver } from "./BotonVolver";
import { Cabecera } from "./Cabecera";
import { LoEsencial } from "./LoEsencial";
import { ModuloSeguridad } from "./ModuloSeguridad";
import { ModuloBienestar } from "./ModuloBienestar";
import { ModuloAcademico } from "./ModuloAcademico";
import { ModuloTrayectoria } from "./ModuloTrayectoria";
import { ModuloCosto } from "./ModuloCosto";
import { Footer } from "@/components/platform/Footer";

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
      <article className="flex flex-col gap-l p-l max-w-md mx-auto lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-xxl lg:px-xl lg:py-xl">
        <div className="flex flex-col gap-l lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-112px)] lg:overflow-y-auto lg:pr-xs">
          <BotonVolver href="/explorar" />
          <Cabecera detalle={detalle} />
          <LoEsencial detalle={detalle} />
        </div>
        <div className="flex flex-col gap-l">
          <ModuloSeguridad detalle={detalle} />
          <ModuloBienestar detalle={detalle} />
          <ModuloAcademico detalle={detalle} />
          {detalle.ofrece_media && <ModuloTrayectoria detalle={detalle} />}
          <ModuloCosto detalle={detalle} />
        </div>
      </article>
      <Footer />
    </>
  );
}
