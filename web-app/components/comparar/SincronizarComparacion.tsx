"use client";

import { useEffect } from "react";
import { useComparar } from "@/lib/comparar";

/** Al abrir /comparar?rbd=…, esa selección pasa a ser la de este navegador. */
export function SincronizarComparacion({ rbds }: { rbds: number[] }) {
  const { reemplazar } = useComparar();
  const clave = rbds.join(",");
  useEffect(() => {
    if (rbds.length) reemplazar(rbds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);
  return null;
}
