"use client";

import { PreguntaLayout } from "./PreguntaLayout";
import { OpcionPregunta } from "./OpcionPregunta";
import { SelectorUbicacion } from "@/components/ubicacion/SelectorUbicacion";
import { IndicadorUbicacion } from "@/components/ubicacion/IndicadorUbicacion";
import { nextUrl, type RespuestasParciales } from "@/lib/quiz/state";
import { useUbicacion } from "@/lib/ubicacion";
import type { Alcance } from "@/lib/motor/types";

/**
 * Q4 — Distancia (D22). Dos momentos en la misma pregunta:
 *  1. Si no hay ubicación: "¿Desde dónde medimos la distancia?" (GPS o comuna).
 *  2. Opciones adaptadas a la precisión:
 *     GPS    → 1 km · 3 km · cualquier distancia
 *     Comuna → mi comuna · mi comuna y las cercanas · cualquier distancia
 * "Cualquier distancia" sigue pesando 30 % en el puntaje, por eso el Test
 * siempre pide la ubicación.
 */
export function Q4Distancia({ previas }: { previas: RespuestasParciales }) {
  const { ubicacion, lista } = useUbicacion();
  const volver = nextUrl("/test/q3", previas, {});

  if (!lista) return <PreguntaLayout paso={4} volverHref={volver} titulo="¿Qué tan lejos puede estar el colegio?">{null}</PreguntaLayout>;

  if (!ubicacion) {
    return (
      <PreguntaLayout
        paso={4}
        volverHref={volver}
        titulo="¿Desde dónde medimos la distancia?"
        subtitulo="La necesitamos para ordenar los colegios por cercanía. Puede ser tu ubicación actual o tu comuna."
      >
        <SelectorUbicacion />
      </PreguntaLayout>
    );
  }

  const opciones: Array<{ label: string; detalle?: string; valor: Alcance }> =
    ubicacion.tipo === "gps"
      ? [
          { label: "Cerca", detalle: "Hasta 1 km, a pie o en bicicleta", valor: "1km" },
          { label: "Un poco más lejos", detalle: "Hasta 3 km, en transporte público corto", valor: "3km" },
          {
            label: "Estamos abiertos a cualquier distancia",
            detalle: "Igual daremos más puntos a los colegios más cercanos.",
            valor: "cualquiera",
          },
        ]
      : [
          { label: "En mi comuna", valor: "comuna" },
          { label: "En mi comuna y las comunas cercanas", valor: "cercanas" },
          {
            label: "Estamos abiertos a cualquier distancia",
            detalle: "Igual daremos más puntos a los colegios más cercanos.",
            valor: "cualquiera",
          },
        ];

  return (
    <PreguntaLayout paso={4} volverHref={volver} titulo="¿Qué tan lejos puede estar el colegio?">
      <IndicadorUbicacion className="rounded-m border border-borde-sutil bg-superficie-elevada px-m py-xs lg:bg-superficie-base" />
      {opciones.map((o) => (
        <OpcionPregunta
          key={o.valor}
          href={nextUrl("/test/q5a", previas, { alcance: o.valor })}
          detalle={o.detalle}
        >
          {o.label}
        </OpcionPregunta>
      ))}
    </PreguntaLayout>
  );
}
