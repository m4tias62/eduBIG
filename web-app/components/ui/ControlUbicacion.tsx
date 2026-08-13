"use client";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { useUbicacion } from "@/lib/ubicacion";

/**
 * Indicador compacto del punto de referencia de la distancia.
 *
 * El permiso de ubicación se pide automáticamente al entrar al sitio
 * (ver lib/ubicacion), así que esto NO es un paso obligatorio: solo muestra
 * desde dónde se miden las distancias y permite reintentar (si se rechazó) o
 * volver al centro de Pudahuel.
 */
export function ControlUbicacion({ className }: { className?: string }) {
  const { ubicacion, estado, pedirUbicacion, limpiarUbicacion } = useUbicacion();

  return (
    <div className={cn("flex items-center justify-between gap-xs", className)}>
      {ubicacion ? (
        <>
          <span className="inline-flex items-center gap-xxs text-2xs text-texto-secundario">
            <Icon nombre="my_location" size={14} className="text-exito-fuerte" />
            Distancias desde tu ubicación
          </span>
          <button
            type="button"
            onClick={limpiarUbicacion}
            className="text-2xs font-medium text-interaccion-enlace hover:text-interaccion-enlace-hover"
          >
            Usar Pudahuel
          </button>
        </>
      ) : (
        <>
          <span className="text-2xs text-texto-secundario">
            {estado === "cargando"
              ? "Ubicándote…"
              : "Distancias desde el centro de Pudahuel"}
          </span>
          {estado !== "cargando" && estado !== "no_soportado" && (
            <button
              type="button"
              onClick={pedirUbicacion}
              className="inline-flex items-center gap-xxs text-2xs font-medium text-interaccion-enlace hover:text-interaccion-enlace-hover"
            >
              <Icon nombre="my_location" size={14} />
              Usar mi ubicación
            </button>
          )}
        </>
      )}
    </div>
  );
}
