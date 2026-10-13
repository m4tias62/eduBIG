"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { runMotor, type Alcance, type ResultadoMotor } from "@/lib/motor";
import {
  ALCANCE_GLOSA,
  COPAGO_GLOSA,
  INCLUSION_GLOSA,
  NIVEL_GLOSA,
  PERFIL_GLOSA,
  nextUrl,
  serializeRespuestas,
  toRespuestasFamilia,
  type RespuestasParciales,
} from "@/lib/quiz/state";
import { razonesCalce } from "@/lib/quiz/razones";
import { useDatosNacionales } from "@/lib/data/cliente";
import { construirReferencia, useUbicacion } from "@/lib/ubicacion";
import type { ReferenciaDistancia } from "@/lib/data/formatters";
import { TarjetaColegio } from "./TarjetaColegio";
import { ModalUbicacion } from "./ModalUbicacion";
import { NotaLegitimacion } from "./NotaLegitimacion";
import { IndicadorUbicacion } from "@/components/ubicacion/IndicadorUbicacion";
import { Footer } from "@/components/platform/Footer";
import Isologo from "@/components/platform/Isologo";
import { Icon } from "@/components/ui/Icon";

/**
 * Shortlist del Test de Calce (versión nacional).
 *
 * El motor corre en el CLIENTE: la ubicación de la familia no sale del
 * navegador. Estructura:
 *   1. Encabezado + resumen de respuestas con nota de legitimación (D05).
 *   2. Hasta 3 colegios que calzan (D27), cards cálidas.
 *   3. Si quedan menos de 3: ofrecer ampliar la distancia (D26).
 *   4. "Cerca de ti, sin datos para comparar" (D24).
 *   5. Comparar estos colegios (D32).
 * Sin ubicación → modal que la pide (D23).
 */
export function ShortlistResultado({ previas }: { previas: RespuestasParciales }) {
  const router = useRouter();
  const { ubicacion, lista } = useUbicacion();
  const { datos, error } = useDatosNacionales();
  const [copiado, setCopiado] = useState(false);

  const respuestas = toRespuestasFamilia(previas);

  const calculo = useMemo(() => {
    if (!datos || !ubicacion || !respuestas) return null;
    const ref = construirReferencia(ubicacion, datos.comunaPorCod, datos.comunas);
    if (!ref) return null;
    const resultado: ResultadoMotor = runMotor(
      { colegios: datos.indice, regionPorComuna: datos.regionPorComuna },
      respuestas,
      ref
    );
    return { ref, resultado };
    // respuestas se deriva de previas (estable por URL)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datos, ubicacion, serializeRespuestas(previas)]);

  if (!respuestas) return null;

  const refDist: ReferenciaDistancia | null = calculo
    ? calculo.ref.tipo === "gps"
      ? { tipo: "gps" }
      : { tipo: "comuna", nombre: calculo.ref.nombreComuna }
    : null;

  const resumen = [
    COPAGO_GLOSA[respuestas.techoCopago],
    INCLUSION_GLOSA[respuestas.inclusion],
    NIVEL_GLOSA[respuestas.nivel],
    ALCANCE_GLOSA[calculo?.resultado.alcance ?? respuestas.alcance],
    PERFIL_GLOSA[respuestas.perfil],
  ].filter(Boolean) as string[];

  function ampliar(a: Alcance) {
    router.replace(nextUrl("/test/resultado", previas, { alcance: a }), { scroll: false });
  }

  async function compartir() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Colegios que calzan con mi familia · Edubig", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      /* el usuario canceló */
    }
  }

  const r = calculo?.resultado;
  const shortlist = r?.shortlist ?? [];
  const rbdsComparar = shortlist.map((s) => s.colegio.rbd);

  return (
    <>
      {lista && !ubicacion && <ModalUbicacion />}

      <header className="bg-superficie-base px-l pt-xl pb-l flex flex-col gap-m max-w-md mx-auto">
        <Isologo width={88} priority />
        <Link
          href="/"
          className="min-h-[44px] inline-flex items-center gap-xs self-start rounded-s bg-interaccion-enlace px-l py-xs text-xs font-bold text-texto-sobre-oscuro hover:bg-interaccion-enlace-hover"
        >
          Ir al inicio del sitio
          <Icon nombre="home" size={18} />
        </Link>
        <div className="flex flex-col gap-xs">
          <h1 className="text-lg font-bold text-texto-primario">
            Estos son los colegios que calzan con tu familia
          </h1>
          {r && (
            <p className="text-xs text-texto-secundario">
              {r.totalRecomendables === 0
                ? "Ningún colegio con datos para comparar cumple todas tus respuestas."
                : `${shortlist.length} de los ${r.totalRecomendables.toLocaleString("es-CL")} colegios que cumplen tus respuestas, ordenados por qué tan bien coinciden con tus prioridades.`}
            </p>
          )}
        </div>

        <NotaLegitimacion>
          Armamos tu lista con lo que nos dijiste: {resumen.join(" · ")}. No hay una combinación
          correcta: es la de tu familia.{" "}
          <Link
            href={nextUrl("/test/q1", previas, {})}
            className="font-bold text-interaccion-enlace underline hover:text-interaccion-enlace-hover"
          >
            Ajustar respuestas
          </Link>
        </NotaLegitimacion>

        {ubicacion && (
          <IndicadorUbicacion className="rounded-m border border-borde-sutil bg-superficie-elevada px-m py-xs" />
        )}
      </header>

      <section className="bg-superficie-elevada px-l py-l">
        <div className="flex flex-col gap-m max-w-md mx-auto">
          {error && (
            <p role="alert" className="text-xs text-error-fuerte">
              No pudimos cargar los datos de los colegios. Revisa tu conexión y recarga la página.
            </p>
          )}
          {!r && !error && ubicacion && (
            <p role="status" className="text-xs text-texto-secundario">Calculando…</p>
          )}

          {r && refDist &&
            shortlist.map((sc, i) => (
              <TarjetaColegio
                key={sc.colegio.rbd}
                posicion={i + 1}
                colegio={sc.colegio}
                distanciaKm={sc.distanciaKm}
                referencia={refDist}
                razones={razonesCalce(sc, { ...respuestas, alcance: r.alcance }, calculo!.ref)}
              />
            ))}

          {/* D26 — pocos colegios: solo se ofrece ampliar la distancia */}
          {r && shortlist.length < 3 && (
            <div className="rounded-m border border-borde-sutil bg-superficie-base p-l flex flex-col gap-s">
              <p className="text-sm font-bold text-texto-primario">
                {shortlist.length === 0
                  ? "No encontramos colegios con datos para comparar que cumplan tus respuestas."
                  : `Solo ${shortlist.length === 1 ? "un colegio cumple" : `${shortlist.length} colegios cumplen`} tus respuestas.`}
              </p>
              {r.ampliaciones.some((a) => a.suma > 0) ? (
                <>
                  <p className="text-xs text-texto-secundario">Si amplías la distancia:</p>
                  <div className="flex flex-col gap-xs">
                    {r.ampliaciones
                      .filter((a) => a.suma > 0)
                      .map((a) => (
                        <button
                          key={a.alcance}
                          type="button"
                          onClick={() => ampliar(a.alcance)}
                          className="min-h-[44px] flex items-center justify-between gap-s rounded-m border border-borde-definido px-m py-s text-left text-xs text-texto-primario hover:border-texto-primario"
                        >
                          <span className="font-bold">{ALCANCE_GLOSA[a.alcance]}</span>
                          <span className="text-texto-secundario">
                            +{a.suma.toLocaleString("es-CL")} {a.suma === 1 ? "colegio" : "colegios"}
                          </span>
                        </button>
                      ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-texto-secundario">
                  Ni ampliando la distancia hay más colegios que cumplan tus respuestas en tu región.
                  Si quieres, puedes ajustarlas.
                </p>
              )}
            </div>
          )}

          {/* D32 — comparación mínima */}
          {shortlist.length >= 2 && (
            <Link
              href={`/comparar?rbd=${rbdsComparar.join(",")}`}
              className="min-h-[44px] inline-flex items-center justify-center gap-xs rounded-m border-2 border-interaccion-enlace bg-superficie-base px-l py-s text-sm font-bold text-interaccion-enlace hover:bg-info-suave"
            >
              <Icon nombre="compare_arrows" size={20} />
              Comparar {shortlist.length === 3 ? "estos 3" : "estos 2"}
            </Link>
          )}

          {r && (
            <button
              type="button"
              onClick={compartir}
              className="min-h-[44px] inline-flex items-center justify-center gap-xs text-xs font-bold text-interaccion-enlace hover:text-interaccion-enlace-hover"
            >
              <Icon nombre="share" size={18} />
              {copiado ? "Enlace copiado" : "Compartir esta lista"}
            </button>
          )}
        </div>
      </section>

      {/* D24 — colegios que pasan los filtros pero no tienen comparación */}
      {r && refDist && r.sinDatos.length > 0 && (
        <section className="bg-superficie-base px-l py-l" aria-labelledby="sin-datos-titulo">
          <div className="flex flex-col gap-m max-w-md mx-auto">
            <div className="flex flex-col gap-xs">
              <h2 id="sin-datos-titulo" className="text-md font-bold text-texto-primario">
                Cerca de ti, sin datos para comparar
              </h2>
              <p className="text-xs text-texto-secundario">
                Estos colegios cumplen tus respuestas, pero no tienen SIMCE ni IDPS 2025 con
                comparación publicada, así que no podemos ordenarlos según tus prioridades. Los
                mostramos por cercanía: también pueden ser una buena opción.
              </p>
            </div>
            {r.sinDatos.map((sc) => (
              <TarjetaColegio
                key={sc.colegio.rbd}
                colegio={sc.colegio}
                distanciaKm={sc.distanciaKm}
                referencia={refDist}
                sinDatos
              />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
