"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Selección para comparar (D32): hasta 3 colegios, guardada en este navegador
 * (localStorage) para poder agregarlos desde distintas fichas.
 */
export const MAX_COMPARAR = 3;
const KEY = "edubig_comparar";
const EVENTO = "edubig-comparar";

function leer(): number[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => Number.isInteger(x)).slice(0, MAX_COMPARAR) : [];
  } catch {
    return [];
  }
}

function escribir(rbds: number[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(rbds));
  } catch {
    /* sin almacenamiento: la selección dura solo esta página */
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function useComparar() {
  const [rbds, setRbds] = useState<number[]>([]);
  useEffect(() => {
    const sync = () => setRbds(leer());
    sync();
    window.addEventListener(EVENTO, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENTO, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const alternar = useCallback((rbd: number) => {
    const actual = leer();
    if (actual.includes(rbd)) escribir(actual.filter((x) => x !== rbd));
    else if (actual.length < MAX_COMPARAR) escribir([...actual, rbd]);
  }, []);

  const quitar = useCallback((rbd: number) => escribir(leer().filter((x) => x !== rbd)), []);
  const reemplazar = useCallback((lista: number[]) => escribir(lista.slice(0, MAX_COMPARAR)), []);

  return { rbds, alternar, quitar, reemplazar };
}
