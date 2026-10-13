"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useComunas } from "@/lib/data/cliente";
import { useUbicacion } from "@/lib/ubicacion";
import { cn } from "@/lib/utils";
import { SelectorUbicacion } from "./SelectorUbicacion";

/**
 * Dice desde dónde se miden las distancias y permite cambiarlo.
 * Con GPS: "Desde tu ubicación". Con comuna: "Desde el centro de Pudahuel".
 */
export function IndicadorUbicacion({ className }: { className?: string }) {
  const { ubicacion } = useUbicacion();
  const comunas = useComunas();
  const [abierto, setAbierto] = useState(false);

  let texto = "Sin ubicación";
  if (ubicacion?.tipo === "gps") texto = "Distancias desde tu ubicación";
  if (ubicacion?.tipo === "comuna") {
    const c = comunas?.find((x) => x.cod === ubicacion.cod);
    texto = c ? `Distancias desde el centro de ${c.nombre}` : "Distancias desde tu comuna";
  }

  return (
    <div className={cn("flex flex-col gap-s", className)}>
      <div className="flex items-center justify-between gap-xs">
        <span className="inline-flex items-center gap-xxs text-2xs text-texto-secundario">
          <Icon nombre={ubicacion?.tipo === "gps" ? "my_location" : "location_city"} size={16} />
          {texto}
        </span>
        <button
          type="button"
          onClick={() => setAbierto((a) => !a)}
          aria-expanded={abierto}
          className="min-h-[44px] px-xs text-2xs font-bold text-interaccion-enlace hover:text-interaccion-enlace-hover"
        >
          {abierto ? "Cerrar" : "Cambiar"}
        </button>
      </div>
      {abierto && <SelectorUbicacion onListo={() => setAbierto(false)} />}
    </div>
  );
}
