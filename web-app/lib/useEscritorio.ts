"use client";

import { useEffect, useState } from "react";

/** Mismo corte que el breakpoint `lg` de Tailwind. */
export const ANCHO_ESCRITORIO = 1024;

/**
 * true en pantallas de escritorio (≥ 1024 px). Durante el render del servidor
 * y el primer render del cliente devuelve false (móvil primero), así que todo
 * lo que dependa de esto debe verse bien también sin él.
 */
export function useEscritorio(): boolean {
  const [es, setEs] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${ANCHO_ESCRITORIO}px)`);
    const actualizar = () => setEs(mq.matches);
    actualizar();
    mq.addEventListener("change", actualizar);
    return () => mq.removeEventListener("change", actualizar);
  }, []);
  return es;
}
