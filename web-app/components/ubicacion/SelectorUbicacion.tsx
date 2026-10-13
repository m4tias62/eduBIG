"use client";

import { useEffect, useId, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { useComunas } from "@/lib/data/cliente";
import { REGIONES } from "@/lib/data/regiones";
import { useUbicacion, type Ubicacion } from "@/lib/ubicacion";
import { cn } from "@/lib/utils";

/**
 * Selector de ubicación con las dos opciones de D22 / D34:
 * "Usar mi ubicación" (GPS) o "Elegir comuna".
 *
 * Mismo componente en la exploración, en Q4 del Test y en el modal de la
 * shortlist compartida (D23). `onListo` se llama apenas hay ubicación.
 */
export function SelectorUbicacion({
  onListo,
  className,
  variante = "primaria",
}: {
  onListo?: (u: Ubicacion) => void;
  className?: string;
  /** "secundaria" en la Home, para no competir con el CTA del Test (D31). */
  variante?: "primaria" | "secundaria";
}) {
  const { ubicacion, estadoGps, pedirGps, elegirComuna } = useUbicacion();
  const comunas = useComunas();
  const idSelect = useId();

  // Avisar cuando la ubicación queda lista, solo si cambió DESPUÉS de que el
  // usuario actuó (una ubicación previa de la sesión no cuenta).
  const actuo = useRef(false);
  const alActuar = useRef<Ubicacion | null>(null);
  const onListoRef = useRef(onListo);
  onListoRef.current = onListo;
  function marcar() {
    actuo.current = true;
    alActuar.current = ubicacion;
  }
  useEffect(() => {
    if (actuo.current && ubicacion && ubicacion !== alActuar.current) {
      actuo.current = false;
      onListoRef.current?.(ubicacion);
    }
  }, [ubicacion]);

  return (
    <div className={cn("flex flex-col gap-m", className)}>
      <button
        type="button"
        onClick={() => {
          marcar();
          pedirGps();
        }}
        disabled={estadoGps === "cargando"}
        className={cn(
          "min-h-[44px] w-full inline-flex items-center justify-center gap-xs rounded-m px-l py-s text-sm font-bold disabled:opacity-70",
          variante === "primaria"
            ? "bg-interaccion-enlace text-texto-sobre-oscuro hover:bg-interaccion-enlace-hover"
            : "border-2 border-interaccion-enlace bg-superficie-base text-interaccion-enlace hover:bg-info-suave"
        )}
      >
        <Icon nombre="my_location" size={20} />
        {estadoGps === "cargando" ? "Buscando tu ubicación…" : "Usar mi ubicación"}
      </button>
      {(estadoGps === "denegado" || estadoGps === "error" || estadoGps === "no_soportado") && (
        <p role="status" className="text-2xs text-texto-secundario">
          {estadoGps === "denegado"
            ? "No tenemos permiso para usar tu ubicación. Puedes elegir tu comuna."
            : estadoGps === "no_soportado"
              ? "Tu navegador no permite usar la ubicación. Puedes elegir tu comuna."
              : "No pudimos obtener tu ubicación. Puedes elegir tu comuna."}
        </p>
      )}

      <div className="flex items-center gap-s text-2xs text-texto-secundario">
        <span className="h-px flex-1 bg-borde-sutil" />o<span className="h-px flex-1 bg-borde-sutil" />
      </div>

      <div className="flex flex-col gap-xs">
        <label htmlFor={idSelect} className="text-xs font-bold text-texto-primario">
          Elegir comuna
        </label>
        <div className="relative">
          <select
            id={idSelect}
            // Siempre vuelve al placeholder: así se puede elegir de nuevo la misma comuna.
            value=""
            disabled={!comunas}
            onChange={(e) => {
              const cod = Number(e.target.value);
              if (cod) {
                marcar();
                elegirComuna(cod);
              }
            }}
            className="min-h-[44px] w-full appearance-none rounded-m border border-borde-definido bg-superficie-base px-m py-s pr-xl text-sm text-texto-primario focus:border-interaccion-foco"
          >
            <option value="">{comunas ? "Selecciona tu comuna" : "Cargando comunas…"}</option>
            {comunas &&
              REGIONES.map((r) => (
                <optgroup key={r.cod} label={`Región ${r.nombre}`}>
                  {comunas
                    .filter((c) => c.region === r.cod)
                    .map((c) => (
                      <option key={c.cod} value={c.cod}>
                        {c.nombre}
                      </option>
                    ))}
                </optgroup>
              ))}
          </select>
          <Icon
            nombre="arrow_drop_down"
            size={24}
            className="pointer-events-none absolute right-s top-1/2 -translate-y-1/2 text-texto-secundario"
          />
        </div>
      </div>
      <p className="text-2xs text-texto-secundario">
        Tu ubicación se usa solo en este navegador para medir distancias. No la guardamos ni
        viaja en los enlaces que compartas.
      </p>
    </div>
  );
}
