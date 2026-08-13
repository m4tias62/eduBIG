"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Ubicación del usuario para el filtro de distancia (Home + Test de Calce).
 *
 * Flujo: el permiso se pide AUTOMÁTICAMENTE al entrar al sitio (una vez por
 * sesión). Si se concede, la distancia se mide desde la posición real del
 * usuario en el mapa, la lista y el test. Si se rechaza (o no se soporta),
 * fallback al centro de Pudahuel.
 *
 * Privacidad: la ubicación real es un dato sensible, así que NO viaja por la
 * URL (a diferencia del resto de filtros). Vive solo en el cliente y se
 * persiste en sessionStorage — dura la sesión del navegador y no se comparte.
 */

const KEY = "edubig_ubicacion";
const KEY_PEDIDA = "edubig_ubicacion_pedida";

export interface Ubicacion {
  lat: number;
  lon: number;
}

export type EstadoUbicacion =
  | "idle"
  | "cargando"
  | "ok"
  | "denegado"
  | "error"
  | "no_soportado";

interface UbicacionCtx {
  ubicacion: Ubicacion | null;
  estado: EstadoUbicacion;
  pedirUbicacion: () => void;
  limpiarUbicacion: () => void;
}

const Ctx = createContext<UbicacionCtx | null>(null);

export function UbicacionProvider({ children }: { children: ReactNode }) {
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);
  const [estado, setEstado] = useState<EstadoUbicacion>("idle");

  const pedirUbicacion = useCallback(() => {
    // Marca que ya pedimos permiso esta sesión (evita re-preguntar tras un
    // rechazo y protege del doble-montaje de React StrictMode en dev).
    try {
      sessionStorage.setItem(KEY_PEDIDA, "1");
    } catch {
      /* ignore */
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setEstado("no_soportado");
      return;
    }
    setEstado("cargando");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const u = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setUbicacion(u);
        setEstado("ok");
        try {
          sessionStorage.setItem(KEY, JSON.stringify(u));
        } catch {
          /* ignore */
        }
      },
      (err) => {
        setEstado(err.code === err.PERMISSION_DENIED ? "denegado" : "error");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const limpiarUbicacion = useCallback(() => {
    setUbicacion(null);
    setEstado("idle");
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // Al montar: rehidrata la ubicación previa; si no hay y aún no pedimos
  // permiso esta sesión, lo pedimos automáticamente (entrar al sitio = pedir).
  useEffect(() => {
    let tieneGuardada = false;
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p?.lat === "number" && typeof p?.lon === "number") {
          setUbicacion({ lat: p.lat, lon: p.lon });
          setEstado("ok");
          tieneGuardada = true;
        }
      }
    } catch {
      /* sessionStorage no disponible — se ignora */
    }

    if (!tieneGuardada) {
      let yaPedida = false;
      try {
        yaPedida = sessionStorage.getItem(KEY_PEDIDA) === "1";
      } catch {
        /* ignore */
      }
      if (!yaPedida) pedirUbicacion();
    }
  }, [pedirUbicacion]);

  return (
    <Ctx.Provider value={{ ubicacion, estado, pedirUbicacion, limpiarUbicacion }}>
      {children}
    </Ctx.Provider>
  );
}

export function useUbicacion(): UbicacionCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Fallback seguro si se consume fuera del provider (no debería ocurrir).
    return {
      ubicacion: null,
      estado: "idle",
      pedirUbicacion: () => {},
      limpiarUbicacion: () => {},
    };
  }
  return ctx;
}
