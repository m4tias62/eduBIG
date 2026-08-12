import Link from "next/link";
import { redirect } from "next/navigation";
import { runMotor } from "@/lib/motor";
import { getUniverso, getConclusionesColegio, getColegio } from "@/lib/data/schools";
import { parseRespuestas, toRespuestasFamilia } from "@/lib/quiz/state";
import { TarjetaColegio } from "@/components/quiz/TarjetaColegio";
import { Footer } from "@/components/platform/Footer";
import Isologo from "@/components/platform/Isologo";

/**
 * Resultado del quiz — Shortlist.
 *
 * Espejo del frame Figma "Shortlist — Colegios que calzan" rediseñado
 * por Matías: cabecera blanca (identidad discreta) → contenido gris con
 * cards → cierre gris (acción de vuelta) → footer edge-to-edge.
 *
 * Motor corre server-side: la URL con params ejecuta runMotor en build/render
 * y ya llega HTML estático al navegador. Sin waterfalls, sin loading dobles.
 */
export default function Resultado({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const previas = parseRespuestas(searchParams);
  const respuestas = toRespuestasFamilia(previas);
  if (!respuestas) redirect("/test/q1");

  const universo = getUniverso();
  const { shortlist, totalElegibles } = runMotor(universo, respuestas);
  const top = shortlist.slice(0, 5);

  return (
    <>
      {/* Cabecera blanca (identidad discreta post-quiz) */}
      <header className="bg-superficie-base px-l pt-xl pb-l flex flex-col gap-m">
        <Isologo width={88} priority />
        <div className="flex flex-col gap-xs">
          <h1 className="text-lg font-bold text-texto-primario">
            Estos son los colegios que calzan con tu familia
          </h1>
          <p className="text-xs text-texto-secundario">
            {top.length} de los {totalElegibles} colegios que pasan tus filtros, ordenados por qué tan bien coinciden con tus prioridades.
          </p>
        </div>
      </header>

      {/* Contenido lista — fondo gris para que las cards con borde cálido se separen */}
      <section className="bg-superficie-elevada px-l py-l flex flex-col gap-m">
        {top.length === 0 ? (
          <div className="rounded-m border border-borde-sutil bg-superficie-base p-l text-center">
            <p className="text-sm text-texto-primario font-bold">
              No encontramos colegios con esas condiciones.
            </p>
            <p className="text-xs text-texto-secundario mt-xs">
              Prueba ampliando el rango de distancia o el copago aceptado.
            </p>
          </div>
        ) : (
          top.map((sc) => {
            const c = getColegio(sc.rbd);
            const co = getConclusionesColegio(sc.rbd);
            if (!c) return null;
            return (
              <TarjetaColegio
                key={sc.rbd}
                scored={sc}
                colegio={c}
                conclusiones={co}
                respuestas={respuestas}
              />
            );
          })
        )}
      </section>

      {/* Cierre gris — acción final */}
      <section className="bg-superficie-elevada px-l pb-l flex justify-center">
        <Link
          href="/"
          className="rounded-s bg-interaccion-enlace px-l py-xs text-xs font-bold text-texto-sobre-oscuro hover:bg-interaccion-enlace-hover"
        >
          Ir al inicio
        </Link>
      </section>

      <Footer />
    </>
  );
}
