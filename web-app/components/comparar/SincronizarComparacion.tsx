"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useComparar } from "@/lib/comparar";

/**
 * Mantiene de acuerdo la URL de /comparar y la selección guardada en este
 * navegador:
 * - Al abrir /comparar?rbd=…&pos=…, esa selección (con sus posiciones) pasa
 *   a ser la de este navegador.
 * - Al abrir /comparar sin colegios en la URL (por ejemplo, desde el botón
 *   del hero) y con colegios ya elegidos, la URL pasa a mostrarlos, sin
 *   perder los filtros del explorador. Se hace una sola vez por visita.
 */
export function SincronizarComparacion({ rbds, posiciones }: { rbds: number[]; posiciones: number[] }) {
  const router = useRouter();
  const { reemplazar, rbds: guardados, url } = useComparar();
  const clave = `${rbds.join(",")}|${posiciones.join(",")}`;
  const restaurada = useRef(false);

  useEffect(() => {
    if (rbds.length) reemplazar(rbds, posiciones);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  useEffect(() => {
    if (restaurada.current || rbds.length || !guardados.length) return;
    restaurada.current = true;
    // Texto armado a mano para que las comas queden legibles (rbd=1,2).
    const resto = window.location.search
      .replace(/^\?/, "")
      .split("&")
      .filter((par) => par && !/^(rbd|pos)=/.test(par));
    const destino = resto.length ? `${url}${url.includes("?") ? "&" : "?"}${resto.join("&")}` : url;
    router.replace(destino, { scroll: false });
  }, [rbds.length, guardados.length, url, router]);

  return null;
}
