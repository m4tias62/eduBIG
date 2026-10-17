"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Comuna } from "@/lib/types";
import type { Referencia } from "@/lib/motor/types";
import { distanciaKm } from "@/lib/motor/haversine";

/**
 * Ubicación de la familia (D22, D23, D34).
 *
 * - Se pide SOLO cuando hace falta (Q4 del Test, la exploración y la
 *   shortlist compartida). No hay ubicación por defecto: el centro de
 *   Pudahuel del MVP se eliminó.
 * - Dos precisiones: "Usar mi ubicación" (GPS) o "Elegir comuna".
 * - Privacidad: vive solo en el navegador (sessionStorage), nunca en la URL.
 *   Dura la sesión y no viaja en los enlaces compartidos.
 */

const KEY = "edubig_ubicacion_v2";

export type Ubicacion =
  | { tipo: "gps"; lat: number; lon: number }
  | { tipo: "comuna"; cod: number };

export type EstadoGps = "idle" | "cargando" | "denegado" | "error" | "no_soportado" | "inseguro";

interface UbicacionCtx {
  ubicacion: Ubicacion | null;
  /** false hasta leer sessionStorage (evita mostrar el modal antes de tiempo). */
  lista: boolean;
  estadoGps: EstadoGps;
  pedirGps: () => void;
  elegirComuna: (cod: number) => void;
  limpiar: () => void;
}

const Ctx = createContext<UbicacionCtx | null>(null);

function guardar(u: Ubicacion | null) {
  try {
    if (u) sessionStorage.setItem(KEY, JSON.stringify(u));
    else sessionStorage.removeItem(KEY);
  } catch {
    /* sessionStorage no disponible: la ubicación dura solo esta página */
  }
}

export function UbicacionProvider({ children }: { children: ReactNode }) {
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);
  const [lista, setLista] = useState(false);
  const [estadoGps, setEstadoGps] = useState<EstadoGps>("idle");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.tipo === "gps" && typeof u.lat === "number" && typeof u.lon === "number") {
          setUbicacion({ tipo: "gps", lat: u.lat, lon: u.lon });
        } else if (u?.tipo === "comuna" && typeof u.cod === "number") {
          setUbicacion({ tipo: "comuna", cod: u.cod });
        }
      }
    } catch {
      /* ignorar */
    }
    setLista(true);
  }, []);

  const pedirGps = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setEstadoGps("no_soportado");
      return;
    }
    // Los navegadores (Chrome en celular incluido) solo entregan la ubicación en
    // conexiones seguras (https o localhost). Abriendo el sitio por la IP del
    // computador (http://192.168…) la piden y la rechazan sin preguntar.
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setEstadoGps("inseguro");
      return;
    }
    setEstadoGps("cargando");
    const ok = (pos: GeolocationPosition) => {
      const u: Ubicacion = { tipo: "gps", lat: pos.coords.latitude, lon: pos.coords.longitude };
      setUbicacion(u);
      guardar(u);
      setEstadoGps("idle");
    };
    const fallo = (err: GeolocationPositionError) =>
      setEstadoGps(err.code === err.PERMISSION_DENIED ? "denegado" : "error");
    // 1.er intento: ubicación aproximada (rápida, por red). En Chrome para
    // Android suele fallar si el teléfono solo tiene GPS disponible: en ese
    // caso se reintenta con alta precisión antes de rendirse.
    navigator.geolocation.getCurrentPosition(
      ok,
      (err) => {
        if (err.code === err.PERMISSION_DENIED) return fallo(err);
        navigator.geolocation.getCurrentPosition(ok, fallo, {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        });
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  const elegirComuna = useCallback((cod: number) => {
    const u: Ubicacion = { tipo: "comuna", cod };
    setUbicacion(u);
    guardar(u);
    setEstadoGps("idle");
  }, []);

  const limpiar = useCallback(() => {
    setUbicacion(null);
    guardar(null);
    setEstadoGps("idle");
  }, []);

  return (
    <Ctx.Provider value={{ ubicacion, lista, estadoGps, pedirGps, elegirComuna, limpiar }}>
      {children}
    </Ctx.Provider>
  );
}

export function useUbicacion(): UbicacionCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      ubicacion: null,
      lista: true,
      estadoGps: "idle",
      pedirGps: () => {},
      elegirComuna: () => {},
      limpiar: () => {},
    };
  }
  return ctx;
}

/** Comuna cuyo centro está más cerca de un punto. */
export function comunaMasCercana(lat: number, lon: number, comunas: Comuna[]): Comuna {
  let mejor = comunas[0];
  let dMin = Infinity;
  for (const c of comunas) {
    const d = distanciaKm(lat, lon, c.lat, c.lon);
    if (d < dMin) {
      dMin = d;
      mejor = c;
    }
  }
  return mejor;
}

/** Ubicación guardada → punto de referencia del motor y de la exploración. */
export function construirReferencia(
  u: Ubicacion,
  comunaPorCod: ReadonlyMap<number, Comuna>,
  comunas: Comuna[]
): Referencia | null {
  if (u.tipo === "comuna") {
    const c = comunaPorCod.get(u.cod);
    if (!c) return null;
    return {
      tipo: "comuna",
      lat: c.lat,
      lon: c.lon,
      codComuna: c.cod,
      nombreComuna: c.nombre,
      region: c.region,
      cercanas: c.cercanas,
    };
  }
  if (comunas.length === 0) return null;
  const c = comunaMasCercana(u.lat, u.lon, comunas);
  return {
    tipo: "gps",
    lat: u.lat,
    lon: u.lon,
    codComuna: c.cod,
    nombreComuna: c.nombre,
    region: c.region,
    cercanas: c.cercanas,
  };
}
