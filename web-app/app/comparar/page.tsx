import type { Metadata } from "next";
import { Suspense } from "react";
import { getDetalle } from "@/lib/data/servidor";
import { construirColegio, posicionesDesdeUrl, textoReferenciaGse, type ColegioComparado } from "@/lib/data/comparacion";
import { SincronizarComparacion } from "@/components/comparar/SincronizarComparacion";
import { Comparacion } from "@/components/comparar/Comparacion";
import { EncabezadoConEspacios } from "@/components/comparar/EncabezadoConEspacios";
import { FichaInformativa } from "@/components/ui/FichaInformativa";
import { ExploradorHome } from "@/components/home/ExploradorHome";
import type { DetalleColegio } from "@/lib/types";

/**
 * Comparar colegios (D32; rediseño oct-2026 en Claude Design): hasta 3 colegios
 * en móvil y 4 en escritorio. Cada celda en capas: frase → gráfico en escala
 * común → dato exacto. La URL /comparar?rbd=…&pos=… se puede compartir
 * (pos = posición/color de cada colegio).
 *
 * v3 (Matías, 2026-11-05): debajo de la comparación va el mismo explorador
 * de la Home (filtros, lista y mapa), para sumar colegios sin salir de aquí.
 * Arriba, una ficha informativa explica cómo comparar y cómo buscar.
 */
export const metadata: Metadata = { title: "Comparar colegios — Edubig" };

function primero(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function parseRbds(s: string | undefined): number[] {
  if (!s) return [];
  return Array.from(new Set(s.split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0))).slice(0, 4);
}

export default function Comparar({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const rbds = parseRbds(primero(searchParams.rbd));
  const encontrados = rbds
    .map((rbd) => getDetalle(rbd))
    .filter((d): d is DetalleColegio => d !== null);
  const posiciones = posicionesDesdeUrl(encontrados.length, primero(searchParams.pos));
  const colegios = encontrados.map((d, i) => construirColegio(d, posiciones[i]));

  return (
    <>
      <SincronizarComparacion rbds={colegios.map((c) => c.rbd)} posiciones={colegios.map((c) => c.posicion)} />
      {/* v3 (Matías, 2026-11-05): la ficha informativa reemplaza a «Volver», al
          título con su bajada y a la caja «Aún no has agregado colegios», que
          repetían lo que ofrece el explorador de abajo. Se mantiene también
          con colegios elegidos, para volver a leer cómo buscar. */}
      <div className="contenedor flex flex-col gap-xl pb-xl pt-xl lg:pt-16">
        {/* id: destino de «Subir a la comparación» desde el explorador. */}
        <div id="comparacion" className="scroll-mt-24">
          <FichaInformativa titulo="Compara colegios" nivelTitulo="h1" idTitulo="comparar-titulo">
            <p>
              Para comparar necesitas 2 colegios o más (máximo 3 en el celular; máximo 4 en un computador). Cada uno
              se mide contra colegios parecidos a él (mismo grupo socioeconómico, GSE), no contra los otros. En el
              comparador podrás ver los puntos fuertes de los colegios que comparas y los puntos débiles, así podrás
              elegir cuál se ajusta a tus necesidades y requerimientos.
            </p>
            <p>
              Búscalos aquí abajo con los filtros: elige una región o comuna, busca un colegio por su nombre o usa el
              botón «Usar mi ubicación» para ver los que están cerca de ti. Explora por mapa o por lista y usa
              «Comparar» en cada tarjeta, o el botón «Agregar a comparar» si entras a la ficha del colegio.
            </p>
          </FichaInformativa>
        </div>

        {colegios.length === 1 && <UnColegio colegio={colegios[0]} />}
        {colegios.length >= 2 && <Comparacion colegios={colegios} />}
      </div>
      {/* Al pasar este punto, la barra fija de la comparación se retira. */}
      <div id="fin-comparacion" aria-hidden className="h-px" />
      <Suspense fallback={<div className="min-h-[480px] bg-superficie-base" aria-hidden />}>
        <ExploradorHome rutaBase="/comparar" titulo="Busca más colegios para comparar" />
      </Suspense>
    </>
  );
}

/** Con un solo colegio: su encabezado y un aviso (variante «aviso» de Matías). */
function UnColegio({ colegio }: { colegio: ColegioComparado }) {
  return (
    <div className="flex flex-col gap-l">
      <EncabezadoConEspacios
        colegios={[
          {
            rbd: colegio.rbd,
            posicion: colegio.posicion,
            nombre: colegio.nombre,
            referencia: textoReferenciaGse(colegio),
          },
        ]}
      />
      <FichaInformativa uso="aviso">
        <p>
          <strong>Agrega al menos un colegio más.</strong> Ya tienes {colegio.nombre} en la comparación; para
          comparar necesitas 2 colegios o más. Búscalos aquí abajo.
        </p>
      </FichaInformativa>
    </div>
  );
}
