import { Hero } from "@/components/home/Hero";
import { Suspense } from "react";
import { ExploradorHome } from "@/components/home/ExploradorHome";
import { TarjetasServicios } from "@/components/home/TarjetasServicios";

/**
 * Home (D31): tres promesas al mismo nivel —comparar, recomendar y explorar—,
 * con el Test de Calce como CTA principal. v3: la exploración vive aquí, en
 * «Filtra tu búsqueda», con lista y mapa; no hay ubicación por defecto (D22).
 */
export default function Home() {
  return (
    <>
      <Hero colorBorde="text-superficie-hundida" />
      {/* v3: la exploración vive en la Home (lista y mapa en una misma sección). */}
      <Suspense
        fallback={
          <section className="bg-superficie-hundida py-xl lg:py-xxl">
            <div className="contenedor">
              <div className="min-h-[480px] bg-rdbu-06" />
            </div>
          </section>
        }
      >
        <ExploradorHome />
      </Suspense>
      {/* «¿Qué hacemos?» de la barra de navegación baja hasta aquí. */}
      <section id="que-hacemos" aria-labelledby="que-hacemos-titulo" className="bg-superficie-elevada px-l py-xl lg:px-0 lg:py-xxl">
        <h2 id="que-hacemos-titulo" className="sr-only">
          ¿Qué hacemos?
        </h2>
        {/* Escritorio: tres tarjetas enlazadas de borde a borde de la retícula,
            sin separación (Figma 837:923). Móvil: una sobre otra. */}
        <TarjetasServicios />
      </section>
    </>
  );
}
