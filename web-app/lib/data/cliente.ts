"use client";

import { useEffect, useState } from "react";
import type { ColegioIndice, Comuna } from "@/lib/types";

/**
 * Acceso a los datos nacionales desde el NAVEGADOR (exploración y Test).
 *
 * El índice (8.250 colegios, ~1,8 MB sin comprimir, ~0,4 MB con gzip) y las
 * comunas se descargan una sola vez por visita y se comparten entre páginas
 * mediante una promesa a nivel de módulo. El motor del Test corre en el
 * cliente porque la ubicación de la familia nunca sale del navegador.
 */

export interface DatosNacionales {
  indice: ColegioIndice[];
  porRbd: Map<number, ColegioIndice>;
  comunas: Comuna[];
  comunaPorCod: Map<number, Comuna>;
  regionPorComuna: Map<number, string>;
}

let promesa: Promise<DatosNacionales> | null = null;

export function cargarDatosNacionales(): Promise<DatosNacionales> {
  if (!promesa) {
    promesa = Promise.all([
      fetch("/data/nacional/indice.json").then((r) => {
        if (!r.ok) throw new Error(`indice.json: ${r.status}`);
        return r.json() as Promise<ColegioIndice[]>;
      }),
      fetch("/data/nacional/comunas.json").then((r) => {
        if (!r.ok) throw new Error(`comunas.json: ${r.status}`);
        return r.json() as Promise<Comuna[]>;
      }),
    ])
      .then(([indice, comunas]) => ({
        indice,
        porRbd: new Map(indice.map((c) => [c.rbd, c])),
        comunas,
        comunaPorCod: new Map(comunas.map((c) => [c.cod, c])),
        regionPorComuna: new Map(comunas.map((c) => [c.cod, c.region])),
      }))
      .catch((e) => {
        promesa = null; // permite reintentar
        throw e;
      });
  }
  return promesa;
}

export function useDatosNacionales(): {
  datos: DatosNacionales | null;
  error: string | null;
} {
  const [datos, setDatos] = useState<DatosNacionales | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let vivo = true;
    cargarDatosNacionales()
      .then((d) => vivo && setDatos(d))
      .catch((e) => vivo && setError(String(e)));
    return () => {
      vivo = false;
    };
  }, []);
  return { datos, error };
}

/** Solo las comunas (para selectores), sin esperar el índice completo. */
let promesaComunas: Promise<Comuna[]> | null = null;
export function useComunas(): Comuna[] | null {
  const [comunas, setComunas] = useState<Comuna[] | null>(null);
  useEffect(() => {
    if (!promesaComunas) {
      promesaComunas = fetch("/data/nacional/comunas.json")
        .then((r) => r.json() as Promise<Comuna[]>)
        .catch((e) => {
          promesaComunas = null;
          throw e;
        });
    }
    let vivo = true;
    promesaComunas.then((c) => vivo && setComunas(c)).catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);
  return comunas;
}
