"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDatosNacionales } from "@/lib/data/cliente";
import { useUbicacion, type Ubicacion } from "@/lib/ubicacion";
import {
  comunasQueCoinciden,
  explorar,
  ordenEfectivo,
  permiteOrdenIngresoU,
  urlExplorar,
  type FiltrosExploracion,
  type Orden,
} from "@/lib/home/filtros";
import type { ReferenciaDistancia } from "@/lib/data/formatters";
import { SelectorUbicacion } from "@/components/ubicacion/SelectorUbicacion";
import { BotonVolver } from "@/components/ficha/BotonVolver";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { BarraFiltros } from "./BarraFiltros";
import { TarjetaColegioBrowse } from "./TarjetaColegioBrowse";

const MapaLeaflet = dynamic(() => import("./MapaLeaflet").then((m) => m.MapaLeaflet), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-300px)] min-h-[360px] flex items-center justify-center bg-superficie-hundida text-texto-secundario text-xs">
      Cargando mapa…
    </div>
  ),
});

const POR_PAGINA = 30;
const MAX_PINES = 600;

/**
 * Exploración nacional (D34). Parte preguntando "¿Dónde buscas colegio?"
 * (GPS o comuna); la búsqueda por nombre está siempre disponible sin pedir
 * ubicación. Lista por defecto, con botón para cambiar a mapa.
 */
export function Exploracion({ filtros }: { filtros: FiltrosExploracion }) {
  const router = useRouter();
  const { datos, error } = useDatosNacionales();
  const { ubicacion, lista } = useUbicacion();
  const [cambiandoLugar, setCambiandoLugar] = useState(false);
  const [pagina, setPagina] = useState(1);

  const modo: "comuna" | "gps" | "nombre" | null = filtros.comuna
    ? "comuna"
    : filtros.desdeGps && ubicacion?.tipo === "gps"
      ? "gps"
      : filtros.q
        ? "nombre"
        : null;

  const comuna = filtros.comuna ? datos?.comunaPorCod.get(filtros.comuna) : undefined;

  const resultado = useMemo(() => {
    if (!datos || !modo) return null;
    if (modo === "comuna") {
      if (!comuna) return { items: [], ref: undefined };
      const set = new Set([comuna.cod, ...(filtros.cercanas ? comuna.cercanas : [])]);
      return {
        items: explorar(datos.indice, filtros, { modo, comunas: set, ref: { lat: comuna.lat, lon: comuna.lon } }),
        ref: { lat: comuna.lat, lon: comuna.lon },
      };
    }
    if (modo === "gps" && ubicacion?.tipo === "gps") {
      const ref = { lat: ubicacion.lat, lon: ubicacion.lon };
      return { items: explorar(datos.indice, filtros, { modo, ref }), ref };
    }
    return { items: explorar(datos.indice, filtros, { modo: "nombre" }), ref: undefined };
  }, [datos, modo, comuna, filtros, ubicacion]);

  // Volver a la primera página cuando cambian los filtros.
  const claveFiltros = urlExplorar({ ...filtros, vista: "lista" });
  useEffect(() => setPagina(1), [claveFiltros]);

  function irA(next: FiltrosExploracion, reemplazar = true) {
    const url = urlExplorar(next);
    if (reemplazar) router.replace(url, { scroll: false });
    else router.push(url);
  }

  function alElegirLugar(u: Ubicacion) {
    setCambiandoLugar(false);
    const base: FiltrosExploracion = {
      ...filtros,
      comuna: undefined,
      cercanas: undefined,
      desdeGps: undefined,
      distanciaMaxKm: undefined,
      orden: filtros.orden === "ingreso_u" ? "ingreso_u" : undefined,
    };
    if (u.tipo === "gps") irA({ ...base, desdeGps: true, distanciaMaxKm: 3 }, false);
    else irA({ ...base, comuna: u.cod }, false);
  }

  const titulo =
    modo === "comuna"
      ? comuna
        ? `Colegios en ${comuna.nombre}${filtros.cercanas ? " y comunas cercanas" : ""}`
        : "Colegios de la comuna"
      : modo === "gps"
        ? "Colegios cerca de ti"
        : modo === "nombre"
          ? `Resultados para «${filtros.q}»`
          : "¿Dónde buscas colegio?";

  const referencia: ReferenciaDistancia | undefined =
    modo === "gps" ? { tipo: "gps" } : modo === "comuna" && comuna ? { tipo: "comuna", nombre: comuna.nombre } : undefined;

  const orden: Orden | null = modo ? ordenEfectivo(filtros, modo) : null;
  const items = resultado?.items ?? [];
  const visibles = items.slice(0, pagina * POR_PAGINA);
  const sugerenciasComuna =
    modo === "nombre" && datos && filtros.q ? comunasQueCoinciden(datos.comunas, filtros.q) : [];

  return (
    <div className="flex flex-col">
      <section className="bg-superficie-base px-l pt-l pb-m flex flex-col gap-m border-b border-borde-sutil">
        <div className="max-w-md w-full mx-auto flex flex-col gap-m">
          <BotonVolver href="/" />
          <h1 className="text-lg font-bold text-texto-primario">{titulo}</h1>

          <BuscadorNombre
            valorInicial={filtros.q ?? ""}
            onBuscar={(q) => irA({ ...filtros, q: q || undefined })}
            placeholder={modo === "comuna" && comuna ? `Buscar en ${comuna.nombre}` : "Buscar colegio por nombre"}
          />

          {(modo === null || cambiandoLugar || (filtros.desdeGps && lista && ubicacion?.tipo !== "gps")) && (
            <div className="flex flex-col gap-s">
              {filtros.desdeGps && lista && ubicacion?.tipo !== "gps" && (
                <p className="text-xs text-texto-secundario">
                  Para ver colegios cerca de ti necesitamos tu ubicación.
                </p>
              )}
              {modo === null && (
                <p className="text-xs text-texto-secundario">
                  Elige un lugar para ver sus colegios, o busca uno por su nombre.
                </p>
              )}
              <SelectorUbicacion onListo={alElegirLugar} />
            </div>
          )}

          {modo && modo !== "nombre" && !cambiandoLugar && (
            <button
              type="button"
              onClick={() => setCambiandoLugar(true)}
              className="min-h-[44px] self-start inline-flex items-center gap-xxs text-xs font-bold text-interaccion-enlace hover:text-interaccion-enlace-hover"
            >
              <Icon nombre="edit_location_alt" size={18} />
              Cambiar lugar
            </button>
          )}

          {modo && (
            <>
              <BarraFiltros filtros={filtros} modo={modo} />
              <div className="flex flex-wrap items-center justify-between gap-s">
                <ToggleVista vista={filtros.vista} onCambiar={(v) => irA({ ...filtros, vista: v })} />
                {(modo === "gps" || permiteOrdenIngresoU(filtros)) && orden && (
                  <SelectorOrden
                    orden={orden}
                    conCercania={modo === "gps"}
                    conIngresoU={permiteOrdenIngresoU(filtros)}
                    onCambiar={(o) => irA({ ...filtros, orden: o })}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {error && (
        <p role="alert" className="px-l py-l text-xs text-error-fuerte max-w-md mx-auto">
          No pudimos cargar los datos de los colegios. Revisa tu conexión y recarga la página.
        </p>
      )}

      {modo && !datos && !error && (
        <p role="status" className="px-l py-l text-xs text-texto-secundario max-w-md mx-auto w-full">
          Cargando colegios…
        </p>
      )}

      {modo && datos && (
        <section className="bg-superficie-elevada px-l py-l flex-1">
          <div className="max-w-md w-full mx-auto flex flex-col gap-m">
            {sugerenciasComuna.length > 0 && (
              <div className="flex flex-wrap gap-xs">
                {sugerenciasComuna.map((c) => (
                  <Link
                    key={c.cod}
                    href={urlExplorar({ vista: "lista", comuna: c.cod })}
                    className="min-h-[44px] inline-flex items-center gap-xxs rounded-s border border-borde-definido bg-superficie-base px-m py-xs text-xs text-texto-primario hover:border-texto-primario"
                  >
                    <Icon nombre="location_city" size={16} />
                    Ver todos los colegios de {c.nombre}
                  </Link>
                ))}
              </div>
            )}

            <p className="text-xs text-texto-secundario" role="status">
              {items.length === 0
                ? "No hay colegios que coincidan con tus filtros."
                : `${items.length.toLocaleString("es-CL")} ${items.length === 1 ? "colegio" : "colegios"}`}
              {orden === "nombre" && items.length > 1 && " · orden alfabético"}
            </p>

            {orden === "ingreso_u" && (
              <aside className="border-l-2 border-temp-calido-suave bg-superficie-base px-m py-s rounded-r-s">
                <p className="text-2xs text-texto-secundario">
                  Ordenados por la diferencia entre su tasa de ingreso a la universidad 2025 y el
                  promedio de colegios similares (mismo grupo socioeconómico de 2° medio). Puede
                  variar mucho en colegios con pocos egresados: el dato público no informa cuántos
                  egresaron. Los colegios sin dato van al final.
                </p>
              </aside>
            )}

            {filtros.vista === "mapa" ? (
              <>
                {items.length > MAX_PINES && (
                  <p className="text-2xs text-texto-secundario">
                    El mapa muestra los {MAX_PINES} primeros. Usa los filtros para acotar.
                  </p>
                )}
                <div className="-mx-l">
                  <MapaLeaflet
                    items={items.slice(0, MAX_PINES)}
                    referencia={
                      resultado?.ref && modo !== "nombre"
                        ? {
                            ...resultado.ref,
                            etiqueta: modo === "gps" ? "Tú estás aquí" : `Centro de ${comuna?.nombre ?? "la comuna"}`,
                          }
                        : undefined
                    }
                  />
                </div>
              </>
            ) : (
              <>
                {visibles.map(({ c, d }) => (
                  <TarjetaColegioBrowse
                    key={c.rbd}
                    colegio={c}
                    distanciaKm={modo === "gps" ? d : undefined}
                    referencia={referencia}
                    nombreComuna={datos.comunaPorCod.get(c.c)?.nombre}
                    mostrarIngresoU={orden === "ingreso_u"}
                  />
                ))}
                {items.length > visibles.length && (
                  <button
                    type="button"
                    onClick={() => setPagina((p) => p + 1)}
                    className="min-h-[44px] rounded-m border border-borde-definido bg-superficie-base px-l py-s text-xs font-bold text-texto-primario hover:border-texto-primario"
                  >
                    Ver más colegios ({(items.length - visibles.length).toLocaleString("es-CL")} restantes)
                  </button>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function BuscadorNombre({
  valorInicial,
  onBuscar,
  placeholder,
}: {
  valorInicial: string;
  onBuscar: (q: string) => void;
  placeholder: string;
}) {
  const [valor, setValor] = useState(valorInicial);
  const primer = useRef(true);
  useEffect(() => setValor(valorInicial), [valorInicial]);
  useEffect(() => {
    if (primer.current) {
      primer.current = false;
      return;
    }
    const id = setTimeout(() => {
      if (valor.trim() !== valorInicial) onBuscar(valor.trim());
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  return (
    <div className="min-h-[44px] flex items-center gap-xs rounded-s bg-superficie-elevada border border-borde-definido px-m py-xs focus-within:border-texto-primario transition-colors">
      <Icon nombre="search" size={20} className="text-texto-secundario" />
      <input
        type="search"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent text-xs text-texto-primario placeholder:text-texto-secundario outline-none"
      />
    </div>
  );
}

function ToggleVista({ vista, onCambiar }: { vista: "lista" | "mapa"; onCambiar: (v: "lista" | "mapa") => void }) {
  const boton = (v: "lista" | "mapa", icono: string, label: string) => (
    <button
      type="button"
      onClick={() => onCambiar(v)}
      aria-pressed={vista === v}
      className={cn(
        "min-h-[40px] inline-flex items-center gap-xs rounded-s px-l py-xs text-xs font-bold",
        vista === v ? "bg-superficie-base text-texto-primario" : "text-texto-secundario"
      )}
    >
      <Icon nombre={icono} size={18} />
      {label}
    </button>
  );
  return (
    <div className="inline-flex rounded-s bg-superficie-hundida p-xxs" role="group" aria-label="Vista">
      {boton("lista", "format_list_bulleted", "Lista")}
      {boton("mapa", "map", "Mapa")}
    </div>
  );
}

function SelectorOrden({
  orden,
  conCercania,
  conIngresoU,
  onCambiar,
}: {
  orden: Orden;
  conCercania: boolean;
  conIngresoU: boolean;
  onCambiar: (o: Orden) => void;
}) {
  return (
    <label className="inline-flex items-center gap-xs text-2xs text-texto-secundario">
      Ordenar por
      <select
        value={orden}
        onChange={(e) => onCambiar(e.target.value as Orden)}
        className="min-h-[40px] rounded-s border border-borde-definido bg-superficie-base px-xs text-xs text-texto-primario"
      >
        {conCercania ? <option value="cercania">Cercanía</option> : <option value="nombre">Nombre</option>}
        {conIngresoU && <option value="ingreso_u">Ingreso a la U (vs. similares)</option>}
      </select>
    </label>
  );
}
