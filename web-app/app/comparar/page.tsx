import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getDetalle } from "@/lib/data/servidor";
import { construirColegio, posicionesDesdeUrl, textoReferenciaGse, type ColegioComparado } from "@/lib/data/comparacion";
import { BotonVolver } from "@/components/ficha/BotonVolver";
import { SincronizarComparacion } from "@/components/comparar/SincronizarComparacion";
import { Comparacion } from "@/components/comparar/Comparacion";
import { EncabezadoConEspacios } from "@/components/comparar/EncabezadoConEspacios";
import { Icon } from "@/components/ui/Icon";
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
      <div className="contenedor flex flex-col pb-xl pt-l lg:pb-xxl lg:pt-xl">
        <BotonVolver href="/" />
        {/* Volver → título: 16 px, igual que Explorar, la ficha y el Test.
            id: destino de «Subir a la comparación» desde el explorador. */}
        <div id="comparacion" className="ancho-6-col mt-m flex scroll-mt-24 flex-col gap-xs">
          <h1 className="text-lg font-bold text-texto-primario">Comparar colegios</h1>
          <p className="text-sm text-texto-secundario">
            Cada colegio se compara con colegios parecidos a él (mismo grupo socioeconómico), no con los otros de
            esta tabla.
          </p>
        </div>

        {colegios.length < 2 ? <SinComparacion colegios={colegios} /> : <Comparacion colegios={colegios} />}
      </div>
      {/* Al pasar este punto, la barra fija de la comparación se retira. */}
      <div id="fin-comparacion" aria-hidden className="h-px" />
      <Suspense fallback={<div className="min-h-[480px] bg-superficie-hundida" aria-hidden />}>
        <ExploradorHome rutaBase="/comparar" titulo="Busca más colegios para comparar" />
      </Suspense>
    </>
  );
}

function SinComparacion({ colegios }: { colegios: ColegioComparado[] }) {
  return (
    <>
      {colegios.length > 0 && (
        <EncabezadoConEspacios
          colegios={colegios.map((c) => ({
            rbd: c.rbd,
            posicion: c.posicion,
            nombre: c.nombre,
            referencia: textoReferenciaGse(c),
          }))}
        />
      )}
      <div className="ancho-6-col mt-l flex flex-col gap-s rounded-m bg-superficie-elevada p-l">
        {colegios.length === 0 && <Icon nombre="splitscreen_vertical_add" size={32} className="text-texto-secundario" />}
        <h2 className="text-md font-bold text-texto-primario lg:text-lg">
          {colegios.length === 0 ? "Aún no has agregado colegios" : "Agrega al menos un colegio más para comparar"}
        </h2>
        <p className="text-sm text-texto-primario">
          Para comparar necesitas 2 colegios o más (hasta 3 en el celular, 4 en un computador). Cada uno se mide
          contra colegios parecidos a él, no contra los otros.
        </p>
        <p className="text-sm text-texto-secundario">
          Búscalos aquí abajo y usa «Comparar» en cada tarjeta, o el botón «Agregar a comparar» en la ficha del
          colegio.
        </p>
        <div className="mt-xs flex flex-col gap-s sm:flex-row">
          <Link
            href="#explorar"
            className="inline-flex min-h-objetivo-tactil items-center justify-center rounded-m bg-interaccion-enlace px-l text-sm font-medium text-texto-sobre-oscuro hover:bg-interaccion-enlace-hover"
          >
            Buscar colegios
          </Link>
          <Link
            href="/test"
            className="inline-flex min-h-objetivo-tactil items-center justify-center rounded-m border-2 border-interaccion-enlace bg-superficie-base px-l text-sm font-medium text-interaccion-enlace hover:bg-info-suave"
          >
            Hacer el Test de Calce
          </Link>
        </div>
      </div>
    </>
  );
}
