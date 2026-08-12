import type { Colegio, ConclusionesColegio } from "@/lib/types";
import { BotonVolver } from "./BotonVolver";
import { Cabecera } from "./Cabecera";
import { LoEsencial } from "./LoEsencial";
import { ModuloSeguridad } from "./ModuloSeguridad";
import { ModuloBienestar } from "./ModuloBienestar";
import { ModuloAcademico } from "./ModuloAcademico";
import { ModuloCosto } from "./ModuloCosto";
import { Footer } from "@/components/platform/Footer";

/**
 * Contenedor que compone la ficha completa siguiendo el orden fijo
 * validado en bitácora:
 *   Volver → Cabecera → Lo esencial → Seguridad → Bienestar → Académico → Costo → Footer.
 *
 * Server Component: recibe los datos ya resueltos por la ruta. Los módulos
 * individuales son Client Components (llevan estado colapsable).
 */
export function FichaColegio({
  colegio,
  conclusiones,
}: {
  colegio: Colegio;
  conclusiones: ConclusionesColegio | null;
}) {
  return (
    <>
      <article className="flex flex-col gap-l p-l max-w-md mx-auto">
        <BotonVolver href="/" />
        <Cabecera colegio={colegio} conclusiones={conclusiones} />
        <LoEsencial colegio={colegio} conclusiones={conclusiones} />
        <ModuloSeguridad colegio={colegio} conclusiones={conclusiones} />
        <ModuloBienestar colegio={colegio} conclusiones={conclusiones} />
        <ModuloAcademico colegio={colegio} conclusiones={conclusiones} />
        <ModuloCosto colegio={colegio} />
      </article>
      <Footer />
    </>
  );
}
