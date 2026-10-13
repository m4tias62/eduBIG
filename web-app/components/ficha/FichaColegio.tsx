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
 */
export function FichaColegio({ detalle }: { detalle: DetalleColegio }) {
  return (
    <>
      <article className="flex flex-col gap-l p-l max-w-md mx-auto">
        <BotonVolver href="/explorar" />
        <Cabecera detalle={detalle} />
        <LoEsencial detalle={detalle} />
        <ModuloSeguridad detalle={detalle} />
        <ModuloBienestar detalle={detalle} />
        <ModuloAcademico detalle={detalle} />
        {detalle.ofrece_media && <ModuloTrayectoria detalle={detalle} />}
        <ModuloCosto detalle={detalle} />
      </article>
      <Footer />
    </>
  );
}
