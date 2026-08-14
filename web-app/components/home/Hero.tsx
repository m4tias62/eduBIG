import Link from "next/link";
import Image from "next/image";
import Isologo from "@/components/platform/Isologo";

/**
 * Hero de la Home. Composición de fill (espejo del frame Figma
 * "Home — Mobile — Lista" › Hero), de abajo hacia arriba:
 *   1. Base sólida `superficie/inversa`.
 *   2. Degradado lineal al 80%: rdbu-01 (#053061, frío) arriba → rdbu-10
 *      (#b2181f, cálido) abajo. Traduce las dos cadenas de Edubig: la fría
 *      de los datos oficiales y la cálida de la familia.
 *   3. Foto de aula al 25% (textura cálida sin competir con el copy).
 *
 * Copy geo-agnóstica: "que calza con tu familia" evita amarrar la Home a
 * Pudahuel (decisión registrada en bitácora).
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-superficie-inversa text-texto-sobre-oscuro">
      {/* Degradado frío (arriba) → cálido (abajo) al 80% sobre la base inversa */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-rdbu-01 to-rdbu-10 opacity-80"
      />
      {/* Foto de aula al 25%, sobre el degradado */}
      <Image
        src="/hero-classroom.jpg"
        alt=""
        fill
        priority
        sizes="(max-width: 768px) 100vw, 768px"
        className="object-cover opacity-25"
      />
      <div className="relative z-10 px-l pt-xl pb-l flex flex-col gap-l">
        <Isologo width={66} priority />

        <div className="flex flex-col gap-xs">
          <h1 className="text-xl font-bold">
            Encuentra el colegio que calza con tu familia
          </h1>
          <p className="text-sm text-texto-sobre-oscuro-secundario">
            Traducimos datos oficiales en visualizaciones accesibles para tomar decisiones informadas.
          </p>
        </div>

        <Link
          href="/test"
          className="rounded-m bg-interaccion-enlace px-l py-m text-center text-sm font-bold text-texto-sobre-oscuro hover:bg-interaccion-enlace-hover"
        >
          Hacer el Test de Calce
        </Link>
      </div>
    </section>
  );
}
