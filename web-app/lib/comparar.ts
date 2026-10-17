"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Selección para comparar (D32): hasta 3 colegios en móvil y 4 en escritorio
 * (decisión de ago-2026), guardada en este navegador (localStorage) para poder
 * agregarlos desde distintas fichas.
 *
 * Oct-2026 — color por posición: la selección se guarda como 4 POSICIONES
 * (null = espacio libre). Un colegio conserva su posición (y su color) mientras
 * siga en la comparación; uno nuevo toma la primera posición libre.
 */
export const MAX_COMPARAR_MOVIL = 3;
export const MAX_COMPARAR = 4;
const KEY = "edubig_comparar";
const EVENTO = "edubig-comparar";

type Posiciones = Array<number | null>;

function normalizar(v: unknown): Posiciones {
  if (!Array.isArray(v)) return [];
  const pos = v
    .slice(0, MAX_COMPARAR)
    .map((x) => (Number.isInteger(x) && (x as number) > 0 ? (x as number) : null));
  // Sin duplicados
  const vistos = new Set<number>();
  return pos.map((x) => (x !== null && !vistos.has(x) ? (vistos.add(x), x) : null));
}

function leer(): Posiciones {
  try {
    return normalizar(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
  } catch {
    return [];
  }
}

function escribir(pos: Posiciones) {
  const recortado = [...pos];
  while (recortado.length && recortado[recortado.length - 1] === null) recortado.pop();
  try {
    localStorage.setItem(KEY, JSON.stringify(recortado));
  } catch {
    /* sin almacenamiento: la selección dura solo esta página */
  }
  window.dispatchEvent(new Event(EVENTO));
}

const ocupados = (pos: Posiciones) => pos.filter((x): x is number => x !== null);

/** URL compartible: /comparar?rbd=a,b&pos=1,4 (pos se omite si es 1, 2, 3…). */
export function urlComparar(pos: Posiciones): string {
  const rbds: number[] = [];
  const lugares: number[] = [];
  pos.forEach((r, i) => {
    if (r !== null) {
      rbds.push(r);
      lugares.push(i + 1);
    }
  });
  if (!rbds.length) return "/comparar";
  const consecutivas = lugares.every((p, i) => p === i + 1);
  return `/comparar?rbd=${rbds.join(",")}${consecutivas ? "" : `&pos=${lugares.join(",")}`}`;
}

export function useComparar() {
  const [posiciones, setPosiciones] = useState<Posiciones>([]);
  useEffect(() => {
    const sync = () => setPosiciones(leer());
    sync();
    window.addEventListener(EVENTO, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENTO, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const alternar = useCallback((rbd: number, maximo: number = MAX_COMPARAR) => {
    const actual = leer();
    if (actual.includes(rbd)) {
      escribir(actual.map((x) => (x === rbd ? null : x)));
      return;
    }
    if (ocupados(actual).length >= maximo) return;
    const libre = actual.indexOf(null);
    const nuevo = [...actual];
    if (libre >= 0) nuevo[libre] = rbd;
    else nuevo.push(rbd);
    escribir(nuevo);
  }, []);

  const quitar = useCallback((rbd: number) => escribir(leer().map((x) => (x === rbd ? null : x))), []);

  /** Reemplaza la selección (al abrir un enlace compartido). `lugares` son posiciones 1–4. */
  const reemplazar = useCallback((rbds: number[], lugares?: number[]) => {
    const pos: Posiciones = [null, null, null, null];
    rbds.slice(0, MAX_COMPARAR).forEach((r, i) => {
      pos[(lugares?.[i] ?? i + 1) - 1] = r;
    });
    escribir(pos);
  }, []);

  const rbds = ocupados(posiciones);
  return { rbds, posiciones, url: urlComparar(posiciones), alternar, quitar, reemplazar };
}
