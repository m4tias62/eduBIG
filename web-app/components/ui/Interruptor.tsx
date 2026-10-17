"use client";

import clsx from "clsx";

/**
 * Interruptor (switch) — forma de píldora (redondeado completo), coherente con
 * el isologo de Edubig. Patrón único para los interruptores del sitio.
 * Pista 40 × 24 px, perilla de 16 px; área táctil de 44 px con la etiqueta.
 */
export function Interruptor({
  activo,
  onCambiar,
  children,
  className,
}: {
  activo: boolean;
  onCambiar: (v: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      onClick={() => onCambiar(!activo)}
      className={clsx("group inline-flex min-h-objetivo-tactil items-center gap-s text-sm font-medium", className)}
    >
      <span
        aria-hidden
        className={clsx(
          "relative h-interruptor-alto w-interruptor-ancho flex-none rounded-full border-2 transition-colors",
          activo
            ? "border-interaccion-enlace bg-interaccion-enlace group-hover:border-interaccion-enlace-hover group-hover:bg-interaccion-enlace-hover"
            : "border-borde-enfatico bg-superficie-base group-hover:border-texto-primario group-hover:bg-superficie-elevada"
        )}
      >
        <span
          className={clsx(
            "absolute top-[2px] size-interruptor-perilla rounded-full transition-[left]",
            activo ? "left-[18px] bg-superficie-base" : "left-[2px] bg-borde-enfatico"
          )}
        />
      </span>
      {children}
    </button>
  );
}
