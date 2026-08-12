import Link from "next/link";
import Image from "next/image";
import Isologo from "@/components/platform/Isologo";

/**
 * Hero de la Home — bloque rojo con foto de fondo (aula heritage, opacidad 25%)
 * + isologo blanco + copy + CTA principal al Test de Calce.
 *
 * Composición visual:
 *  - Fondo: color sólido `rdbu-11` (rojo profundo)
 *  - Sobre él: foto `hero-classroom.jpg` al 25% (object-cover) — el rojo
 *    penetra el 75% restante y da al Hero una calidez texturada sin
 *    competir con el copy.
 *  - Contenido: sobre todo, con `relative z-10` para stacking correcto.
 *
 * Copy geo-agnóstica: "que calza con tu familia" evita amarrar la Home a
 * Pudahuel (decisión registrada en bitácora original).
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-rdbu-11 text-texto-sobre-oscuro">
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
