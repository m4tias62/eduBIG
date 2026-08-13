"use client";

import Link from "next/link";
import { useMemo } from "react";
import { runMotor } from "@/lib/motor";
import { toRespuestasFamilia, type RespuestasParciales } from "@/lib/quiz/state";
import { useUbicacion } from "@/lib/ubicacion";
import type { Colegio, ConclusionesColegio } from "@/lib/types";
import { TarjetaColegio } from "./TarjetaColegio";
import { Footer } from "@/components/platform/Footer";
import Isologo from "@/components/platform/Isologo";
import { Icon } from "@/components/ui/Icon";
import { ControlUbicacion } from "@/components/ui/ControlUbicacion";

/**
 * Shortlist del Test de Calce — corre el motor en el CLIENTE para poder usar
 * la ubicación real del usuario como centro de la distancia (dato sensible que
 * no viaja por la URL; ver lib/ubicacion). Si no hay ubicación, usa el centro
 * de Pudahuel como fallback — idéntico al comportamiento server-side previo.
 *
 * El SSR renderiza con el fallback (Pudahuel); al hidratar, si el usuario ya
 * activó su ubicación (en la Home o acá), el motor se recalcula desde su
 * posición y el shortlist se reordena.
 */
export function ShortlistResultado({
  previas,
  universo,
  conclusionesIndex,
}: {
  previas: RespuestasParciales;
  universo: Colegio[];
  conclusionesIndex: ReadonlyMap<number, ConclusionesColegio>;
}) {
  const { ubicacion } = useUbicacion();
  const desdeUsuario = !!ubicacion;

  const colegioPorRbd = useMemo(() => {
    const m = new Map<number, Colegio>();
    for (const c of universo) m.set(c.rbd, c);
    return m;
  }, [universo]);

  const resultado = useMemo(() => {
    const respuestas = toRespuestasFamilia(previas, ubicacion ?? undefined);
    if (!respuestas) return null;
    const { shortlist, totalElegibles } = runMotor(universo, respuestas);
    return { respuestas, top: shortlist.slice(0, 5), totalElegibles };
  }, [previas, universo, ubicacion]);

  if (!resultado) return null;
  const { respuestas, top, totalElegibles } = resultado;

  return (
    <>
      {/* Cabecera blanca (identidad discreta post-quiz) */}
      <header className="bg-superficie-base px-l pt-xl pb-l flex flex-col gap-m">
        <Isologo width={88} priority />
        <Link
          href="/"
          className="inline-flex items-center gap-xs self-start rounded-s bg-interaccion-enlace px-l py-xs text-xs font-bold text-texto-sobre-oscuro hover:bg-interaccion-enlace-hover"
        >
          Ir al inicio del sitio
          <Icon nombre="home" size={18} />
        </Link>
        <div className="flex flex-col gap-xs">
          <h1 className="text-lg font-bold text-texto-primario">
            Estos son los colegios que calzan con tu familia
          </h1>
          <p className="text-xs text-texto-secundario">
            {top.length} de los {totalElegibles} colegios que pasan tus filtros, ordenados por qué tan bien coinciden con tus prioridades.
          </p>
        </div>

        {/* Estado del punto de referencia (el permiso se pide al entrar al sitio) */}
        <ControlUbicacion className="rounded-m border border-borde-sutil bg-superficie-elevada px-m py-s" />
      </header>

      {/* Contenido lista — fondo gris para separar las cards */}
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
            const c = colegioPorRbd.get(sc.rbd);
            if (!c) return null;
            return (
              <TarjetaColegio
                key={sc.rbd}
                scored={sc}
                colegio={c}
                conclusiones={conclusionesIndex.get(sc.rbd) ?? null}
                respuestas={respuestas}
                desdeUsuario={desdeUsuario}
              />
            );
          })
        )}
      </section>

      <Footer />
    </>
  );
}
