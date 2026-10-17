"use client";

import { useEffect } from "react";
import { useComparar } from "@/lib/comparar";

/** Al abrir /comparar?rbd=…&pos=…, esa selección (con sus posiciones) pasa a ser la de este navegador. */
export function SincronizarComparacion({ rbds, posiciones }: { rbds: number[]; posiciones: number[] }) {
  const { reemplazar } = useComparar();
  const clave = `${rbds.join(",")}|${posiciones.join(",")}`;
  useEffect(() => {
    if (rbds.length) reemplazar(rbds, posiciones);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);
  return null;
}
