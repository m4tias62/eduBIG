"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";
import { Globo } from "@/components/ui/Globo";

export { Globo };
import { COLOR_COLEGIO, estadoSig, type Posicion, type Significancia } from "@/lib/viz";

/**
 * Piezas básicas del sistema de visualización (Comparar colegios, oct-2026).
 * Se usan en la comparación y en la ficha.
 */

/** Círculo de color con el número de posición 1–4. El número es el apoyo no cromático. */
export function MarcadorColegio({
  posicion,
  libre = false,
  className,
}: {
  posicion: Posicion;
  libre?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={clsx(
        "inline-flex size-marcador flex-none items-center justify-center rounded-full text-xs font-bold leading-none",
        libre
          ? "border-2 border-dashed border-borde-definido text-texto-secundario"
          : [COLOR_COLEGIO[posicion].bg, "text-viz-colegio-numero"],
        className
      )}
    >
      {posicion}
    </span>
  );
}

/** ↑ sobre sus similares · = a la par · ↓ bajo sus similares · Sin comparación publicada. */
export function ChipEstadoSimilares({ sig, className }: { sig: Significancia; className?: string }) {
  const e = estadoSig(sig);
  return (
    <span
      className={clsx(
        "inline-flex h-chip-alto items-center whitespace-nowrap rounded-s border bg-superficie-base px-xs text-xs leading-none",
        sig === null ? "border-borde-definido text-texto-secundario" : ["border-current", e.color],
        className
      )}
    >
      {e.glifo && <span aria-hidden className="mr-xxs">{e.glifo}</span>}
      {e.texto}
    </span>
  );
}

/** Chip neutro de Identidad (dependencia, niveles). */
export function ChipNeutro({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-chip-alto items-center whitespace-nowrap rounded-s border border-borde-definido bg-superficie-base px-xs text-xs leading-none text-texto-primario">
      {children}
    </span>
  );
}

export type TipoEstadoDato = "sin_dato" | "no_imparte" | "pocos_casos" | "sin_informacion";

const ESTADO_DATO: Record<TipoEstadoDato, { icono: string; texto: string; trama: boolean }> = {
  sin_dato: { icono: "block", texto: "Sin datos publicados", trama: true },
  no_imparte: { icono: "do_not_disturb_on", texto: "No imparte", trama: false },
  pocos_casos: { icono: "warning", texto: "Pocos casos: la tasa cambia mucho con una sola denuncia", trama: true },
  sin_informacion: { icono: "block", texto: "Sin información", trama: true },
};

const POR_QUE_SIN_DATO =
  "La fuente oficial no publicó este dato para este colegio. Edubig no estima datos que la fuente no publica.";

/**
 * Datos faltantes, con el mismo alto que el gráfico que reemplazan. Nunca una
 * celda vacía, un guion solo ni un cero en lugar de "sin dato".
 * "No imparte" va sin trama: no es un faltante, es una característica.
 */
export function EstadoDato({
  tipo,
  texto,
  explicacion,
  className,
}: {
  tipo: TipoEstadoDato;
  texto?: string;
  explicacion?: string;
  className?: string;
}) {
  const e = ESTADO_DATO[tipo];
  const porQue = explicacion ?? (tipo === "sin_dato" ? POR_QUE_SIN_DATO : undefined);
  return (
    <div
      className={clsx(
        "relative flex flex-wrap items-center gap-x-xs rounded-s px-s py-xs text-xs text-texto-secundario",
        e.trama ? "bg-viz-pista bg-viz-faltante-trama" : "bg-viz-pista",
        className
      )}
    >
      <Icon nombre={e.icono} size={16} className="text-texto-secundario" />
      <span className="py-xxs">{texto ?? e.texto}</span>
      {porQue &&
        (tipo === "sin_dato" ? (
          <Globo
            texto={porQue}
            sinIcono
            claseDisparador="text-interaccion-enlace underline hover:text-interaccion-enlace-hover"
          >
            ¿Por qué?
          </Globo>
        ) : (
          <Globo texto={porQue} etiqueta={`Por qué: ${texto ?? e.texto}`} />
        ))}
    </div>
  );
}

/** Versión en línea (dentro de una frase de conclusión). */
export function EstadoDatoLinea({ tipo, texto }: { tipo: TipoEstadoDato; texto?: string }) {
  const e = ESTADO_DATO[tipo];
  return (
    <span className="inline-flex items-center gap-xs">
      <Icon nombre={tipo === "pocos_casos" ? "warning" : e.icono} size={18} />
      {texto ?? e.texto}
    </span>
  );
}

/** Marca neutra de "sus similares": 2 px negra con halo blanco, sobresale 4 px. */
export function MarcaSimilares({ pct }: { pct: number }) {
  return (
    <span
      aria-hidden
      className="absolute top-0 -ml-px h-[calc(theme(spacing.viz-marca-alto)+2*theme(spacing.viz-similares-sobresale))] w-viz-similares-ancho bg-viz-similares-marca shadow-[0_0_0_1px_theme(colors.viz-similares-halo)]"
      style={{ left: `${pct}%` }}
    />
  );
}

/** Leyenda de la línea de referencia. */
export function LeyendaSimilares({ texto = "sus similares" }: { texto?: string }) {
  return (
    <span aria-hidden className="inline-flex items-center gap-xs text-2xs text-texto-secundario">
      <span className="h-viz-similares-ancho w-m flex-none bg-viz-similares-marca" />
      {texto}
    </span>
  );
}
