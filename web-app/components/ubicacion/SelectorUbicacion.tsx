"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { useComunas } from "@/lib/data/cliente";
import { REGION_NOMBRE } from "@/lib/data/regiones";
import { SelectorFiltro, type OpcionFiltro } from "@/components/ui/SelectorFiltro";
import { Boton } from "@/components/ui/Boton";
import { FichaInformativa } from "@/components/ui/FichaInformativa";
import { useUbicacion, type Ubicacion } from "@/lib/ubicacion";
import { cn } from "@/lib/utils";

/**
 * Selector de ubicación con las dos opciones de D22 / D34:
 * "Elegir comuna" o "Usar mi ubicación" (GPS).
 *
 * Orden (oct-2026, decisión de Matías): primero la comuna (funciona siempre y
 * es lo más común), luego `entre` (en la Home: "¿Ya sabes cuál?", la búsqueda
 * por nombre) y al final la ubicación del dispositivo, con su nota de
 * privacidad pegada a ella (ley de proximidad).
 *
 * Mismo componente en la exploración, en Q4 del Test y en el modal de la
 * shortlist compartida (D23). `onListo` se llama apenas hay ubicación.
 */
export function SelectorUbicacion({
  onListo,
  className,
  variante = "primaria",
  entre,
}: {
  onListo?: (u: Ubicacion) => void;
  className?: string;
  /** "secundaria" en la Home, para no competir con el CTA del Test (D31). */
  variante?: "primaria" | "secundaria";
  /** Opción intermedia entre la comuna y la ubicación (p. ej., búsqueda por nombre). */
  entre?: React.ReactNode;
}) {
  const { ubicacion, estadoGps, pedirGps, elegirComuna } = useUbicacion();
  const comunas = useComunas();
  const idEtiqueta = useId();

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

  const separador = (
    <div aria-hidden className="flex items-center gap-s text-2xs text-texto-secundario">
      <span className="h-px flex-1 bg-borde-sutil" />o<span className="h-px flex-1 bg-borde-sutil" />
    </div>
  );

  const mensajeGps: Partial<Record<typeof estadoGps, string>> = {
    denegado:
      "No tenemos permiso para usar tu ubicación. Puedes activarlo en los permisos del sitio de tu navegador, o elegir tu comuna.",
    no_soportado: "Tu navegador no permite usar la ubicación. Puedes elegir tu comuna.",
    inseguro:
      "Tu navegador solo comparte la ubicación en una conexión segura (https). Puedes elegir tu comuna.",
    error:
      "No pudimos obtener tu ubicación. Revisa que la ubicación de tu dispositivo esté activada, o elige tu comuna.",
  };

  // v3 (Matías, 2026-11-05): el mismo desplegable de los filtros («Comuna»),
  // con sus estados, teclado y búsqueda por letras, en vez del <select> nativo.
  const opciones: OpcionFiltro[] = useMemo(
    () =>
      (comunas ?? [])
        .slice()
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
        .map((c) => ({ valor: String(c.cod), etiqueta: `${c.nombre} (${REGION_NOMBRE[c.region]})` })),
    [comunas]
  );

  return (
    <div className={cn("flex flex-col gap-m", className)}>
      <div className="flex flex-col gap-xs">
        <span id={idEtiqueta} className="font-heading text-md font-medium tracking-[0.015em] text-rdbu-01">
          Elegir comuna
        </span>
        <SelectorFiltro
          idEtiqueta={idEtiqueta}
          icono="location_city"
          placeholder={comunas ? "Escoge tu comuna" : "Cargando comunas…"}
          opciones={opciones}
          valores={ubicacion?.tipo === "comuna" ? [String(ubicacion.cod)] : []}
          onCambiar={([v]) => {
            const cod = Number(v);
            if (cod) {
              marcar();
              elegirComuna(cod);
            }
          }}
          className="lg:[&>button]:w-full"
        />
      </div>

      {entre && (
        <>
          {separador}
          {entre}
        </>
      )}

      {separador}

      <div className="flex flex-col gap-xs">
        {/* Acción (no filtro): botón v3, primario o con contorno. */}
        <Boton
          variante={variante === "primaria" ? "primario" : "contorno"}
          onClick={() => {
            marcar();
            pedirGps();
          }}
          disabled={estadoGps === "cargando"}
          className="w-full gap-xs disabled:opacity-70"
        >
          <Icon nombre="my_location" size={20} />
          {estadoGps === "cargando" ? "Buscando tu ubicación…" : "Usar mi ubicación"}
        </Boton>
        {/* Los avisos del GPS usan la ficha informativa («alerta»). La región de
            estado existe siempre, para que el lector de pantalla los anuncie. */}
        <div role="status">
          {mensajeGps[estadoGps] && (
            <FichaInformativa uso="alerta">
              <p>{mensajeGps[estadoGps]}</p>
            </FichaInformativa>
          )}
        </div>
        <p className="text-2xs text-texto-secundario">
          Tu ubicación se usa solo en este navegador para medir distancias. No la guardamos ni viaja en los
          enlaces que compartas.
        </p>
      </div>
    </div>
  );
}
