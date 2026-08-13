"use client";

import { useRouter } from "next/navigation";

/**
 * Botón "Volver" estándar del design system — botón azul relleno, idéntico
 * al del quiz (Figma 468:1655). Vuelve a la página anterior si hay historial;
 * si no, navega al href dado (fallback).
 */
export function BotonVolver({
  href = "/",
  label = "Volver",
}: {
  href?: string;
  label?: string;
}) {
  const router = useRouter();

  function volver() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(href);
    }
  }

  return (
    <button
      type="button"
      onClick={volver}
      className="inline-flex items-center justify-center self-start rounded-s bg-interaccion-enlace px-m py-xs text-xs font-bold text-texto-sobre-oscuro hover:bg-interaccion-enlace-hover"
    >
      {label}
    </button>
  );
}
