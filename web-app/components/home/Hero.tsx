import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import Isologo from "@/components/platform/Isologo";

/**
 * Hero de la Home. Composición de fill (frame Figma "Home — Mobile — Lista"):
 *   1. Base sólida `superficie/inversa`.
 *   2. Degradado al 75 %: rdbu-01 (frío) arriba → rdbu-09 (coral) abajo,
 *      unificado con la imagen OG de WhatsApp.
 *   3. Foto de aula al 10 %.
 *
 * Escritorio (≥ 1024 px): dos columnas. A la izquierda el mensaje y el CTA
 * del Test (sigue siendo el principal, D31); a la derecha, `aside` (la
 * entrada a la exploración). El logo lo pone la barra de navegación.
 */
export function Hero({ aside }: { aside?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-superficie-inversa text-texto-sobre-oscuro">
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-rdbu-01 to-rdbu-09 opacity-75" />
      <Image
        src="/hero-classroom.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-10"
      />
      {/* Retícula: mensaje en columnas 1–6, exploración en 7–12 */}
      <div className="contenedor relative z-10 pt-xl pb-l lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-xl lg:py-xxl">
        {/* Tablet: mismo ancho de columna que el resto de la Home */}
        <div className="flex flex-col gap-l md:mx-auto md:max-w-md lg:col-span-6 lg:mx-0 lg:max-w-none lg:pr-xl">
          <div className="lg:hidden">
            <Isologo width={66} priority />
          </div>
          <div className="flex flex-col gap-xs lg:gap-m">
            <h1 className="text-xl font-bold lg:max-w-md">Encuentra el colegio que calza con tu familia</h1>
            <p className="text-sm text-texto-sobre-oscuro-secundario lg:max-w-md">
              Traducimos datos oficiales en visualizaciones accesibles para tomar decisiones informadas.
            </p>
          </div>
          <Link
            href="/test"
            className="rounded-m bg-interaccion-enlace px-l py-m text-center text-sm font-bold text-texto-sobre-oscuro hover:bg-interaccion-enlace-hover lg:self-start lg:px-xl"
          >
            Hacer el Test de Calce
          </Link>
        </div>
        {aside && <div className="hidden lg:col-span-6 lg:block">{aside}</div>}
      </div>
    </section>
  );
}
