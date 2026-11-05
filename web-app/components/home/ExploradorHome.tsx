"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDatosNacionales } from "@/lib/data/cliente";
import { REGIONES, REGION_NOMBRE } from "@/lib/data/regiones";
import { useUbicacion } from "@/lib/ubicacion";
import {
  explorar,
  parseFiltros,
  serializeFiltros,
  urlInicio,
  type FiltrosExploracion,
  type NivelFiltro,
} from "@/lib/home/filtros";
import type { ReferenciaDistancia, TipoColegio } from "@/lib/data/formatters";
import { ChipFiltro } from "@/components/ui/ChipFiltro";
import { SelectorFiltro, type OpcionFiltro } from "@/components/ui/SelectorFiltro";
import { Buscador } from "@/components/ui/Buscador";
import { ToggleVista } from "@/components/ui/ToggleVista";
import { TarjetaColegio } from "@/components/home/TarjetaColegio";
import { EnlaceTexto } from "@/components/ui/EnlaceTexto";
import { cn } from "@/lib/utils";
import { FichaInformativa } from "@/components/ui/FichaInformativa";
import { PANEL_V3 } from "@/components/ui/Panel";
import { MAX_COMPARAR, MAX_COMPARAR_MOVIL, urlComparar, useComparar, type Posiciones } from "@/lib/comparar";
import { useEscritorio } from "@/lib/useEscritorio";

const MapaLeaflet = dynamic(() => import("@/components/explorar/MapaLeaflet").then((m) => m.MapaLeaflet), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[480px] w-full items-center justify-center bg-superficie-base text-xs text-texto-secundario">
      Cargando mapa…
    </div>
  ),
});

const POR_PAGINA = 30;
const MAX_PINES = 600;
const RADIO_GPS_KM = 3;

const NIVELES: OpcionFiltro[] = [
  { valor: "basica", etiqueta: "Básica" },
  { valor: "media", etiqueta: "Media" },
  { valor: "especial", etiqueta: "Educación especial" },
];

const DEPENDENCIAS: OpcionFiltro[] = [
  { valor: "publica", etiqueta: "Pública" },
  { valor: "part_subvencionado", etiqueta: "Particular subvencionado" },
  { valor: "part_pagado", etiqueta: "Particular pagado" },
];

const MENSAJE_GPS: Record<string, string> = {
  denegado:
    "No tenemos permiso para usar tu ubicación. Puedes activarlo en los permisos del sitio de tu navegador, o elegir una región y comuna.",
  no_soportado: "Tu navegador no permite usar la ubicación. Puedes elegir una región y comuna.",
  inseguro: "Tu navegador solo comparte la ubicación en una conexión segura (https). Puedes elegir una región y comuna.",
  error:
    "No pudimos obtener tu ubicación. Revisa que la ubicación de tu dispositivo esté activada, o elige una región y comuna.",
};

/**
 * «Filtra tu búsqueda» (v3, Figma «Explorar mapa + lista → Soluciones»,
 * nodo 837:3845). La exploración pasa de su página propia a la Home: lista
 * y mapa en una misma sección (anotación de Matías).
 *
 * Decisiones (Matías, 2026-11-04):
 * - «Usar mi ubicación» se mantiene, dentro del panel, como un filtro más.
 * - «Nivel (Curso)»: Básica, Media o Educación especial.
 * - Lista y mapa aparecen cuando hay una región o comuna, un nombre buscado o
 *   la ubicación. Antes no hay un orden con sentido para 8.250 colegios.
 * - Sin «Ordenar por» ni «Sumar comunas cercanas»: el ingreso a la U se ve
 *   en la ficha y en Comparar.
 *
 * Los filtros viajan en la URL (compartible); la ubicación no: vive solo en
 * el navegador (D22).
 *
 * Se usa en dos lugares con el mismo aspecto (Matías, 2026-11-05):
 * - En la Home («/»).
 * - En Comparar («/comparar»), para sumar colegios sin volver a la Home. Ahí
 *   la URL guarda también la comparación (rbd y pos) y cada «Comparar» de una
 *   tarjeta actualiza la tabla de arriba en el acto.
 */
export function ExploradorHome({
  rutaBase = "/",
  titulo = "Filtra tu búsqueda",
}: {
  rutaBase?: "/" | "/comparar";
  titulo?: string;
}) {
  const enComparar = rutaBase === "/comparar";
  const router = useRouter();
  const sp = useSearchParams();
  const filtros = useMemo(() => parseFiltros(new URLSearchParams(sp.toString())), [sp]);
  const { datos, error } = useDatosNacionales();
  const { ubicacion, estadoGps, pedirGps } = useUbicacion();
  const [pagina, setPagina] = useState(1);
  const comparar = useComparar();
  const maximoComparar = useEscritorio() ? MAX_COMPARAR : MAX_COMPARAR_MOVIL;

  const conGps = !!filtros.desdeGps;
  const gpsListo = conGps && ubicacion?.tipo === "gps";
  const comuna = filtros.comuna ? datos?.comunaPorCod.get(filtros.comuna) : undefined;
  const region = filtros.region ?? comuna?.region;

  const modo: "gps" | "comuna" | "region" | "nombre" | null = gpsListo
    ? "gps"
    : conGps
      ? null
      : filtros.comuna
        ? "comuna"
        : region
          ? "region"
          : filtros.q
            ? "nombre"
            : null;

  const resultado = useMemo(() => {
    if (!datos || !modo) return null;
    if (modo === "gps" && ubicacion?.tipo === "gps") {
      const ref = { lat: ubicacion.lat, lon: ubicacion.lon };
      return { items: explorar(datos.indice, filtros, { modo: "gps", ref }), ref };
    }
    if (modo === "comuna" && comuna) {
      return {
        items: explorar(datos.indice, filtros, { modo: "comuna", comunas: new Set([comuna.cod]) }),
        ref: { lat: comuna.lat, lon: comuna.lon },
      };
    }
    if (modo === "region" && region) {
      const set = new Set(datos.comunas.filter((c) => c.region === region).map((c) => c.cod));
      return { items: explorar(datos.indice, filtros, { modo: "comuna", comunas: set }), ref: undefined };
    }
    return { items: explorar(datos.indice, filtros, { modo: "nombre" }), ref: undefined };
  }, [datos, modo, comuna, region, filtros, ubicacion]);

  const clave = urlInicio({ ...filtros, vista: "lista" });
  useEffect(() => setPagina(1), [clave]);

  // URL de esta página con los filtros dados. En Comparar se conservan rbd y
  // pos (o se toman de la selección nueva, si cambió).
  // Se arma como texto (no con URLSearchParams) para que las comas queden
  // legibles en la URL compartible: rbd=1,2 y no rbd=1%2C2.
  function urlCon(next: FiltrosExploracion, seleccion?: Posiciones): string {
    if (!enComparar) return urlInicio(next);
    const origen = seleccion
      ? new URL(urlComparar(seleccion), "https://edubig.local").searchParams
      : new URLSearchParams(sp.toString());
    const partes = (["rbd", "pos"] as const).flatMap((k) => {
      const v = origen.get(k);
      return v ? [`${k}=${v}`] : [];
    });
    const filtrosQs = serializeFiltros(next);
    if (filtrosQs) partes.push(filtrosQs);
    return partes.length ? `${rutaBase}?${partes.join("&")}` : rutaBase;
  }

  function irA(next: FiltrosExploracion) {
    router.replace(urlCon(next), { scroll: false });
  }

  function alternarComparacion(rbd: number) {
    const seleccion = comparar.alternar(rbd, maximoComparar);
    if (enComparar) router.replace(urlCon(filtros, seleccion), { scroll: false });
  }

  const opcionesComuna: OpcionFiltro[] = useMemo(() => {
    if (!datos) return [];
    const lista = region ? datos.comunas.filter((c) => c.region === region) : datos.comunas;
    return [...lista]
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
      .map((c) => ({ valor: String(c.cod), etiqueta: region ? c.nombre : `${c.nombre} (${REGION_NOMBRE[c.region]})` }));
  }, [datos, region]);

  const items = resultado?.items ?? [];
  const visibles = items.slice(0, pagina * POR_PAGINA);
  const referencia: ReferenciaDistancia | undefined = modo === "gps" ? { tipo: "gps" } : undefined;
  const refMapa = resultado?.ref
    ? { ...resultado.ref, etiqueta: modo === "gps" ? "Tú estás aquí" : `Centro de ${comuna?.nombre ?? "la comuna"}` }
    : undefined;

  const lugar =
    modo === "gps"
      ? `a menos de ${filtros.distanciaMaxKm ?? RADIO_GPS_KM} km de tu ubicación`
      : modo === "comuna" && comuna
        ? `en ${comuna.nombre}`
        : modo === "region" && region
          ? `en la Región ${REGION_NOMBRE[region]}`
          : "en todo Chile";

  return (
    // v3 (Matías, 2026-11-05): fondos invertidos, en la Home y en Comparar: la
    // sección en blanco y la tarjeta que contiene los filtros en gris hundido.
    <section id="explorar" aria-labelledby="explorar-titulo" className="bg-superficie-base py-xl lg:py-xxl">
      <div className="contenedor">
        <div className="flex flex-col gap-l bg-superficie-hundida px-m py-xl md:px-l lg:px-xxl lg:py-[80px]">
          <h2 id="explorar-titulo" className="text-xl font-bold tracking-[0.015em] text-rdbu-01">
            {titulo}
          </h2>

          {/* Panel de filtros (Figma 927:26930): 24 px a los lados, 32 arriba y
              abajo, 16 px entre la fila de lugar, «Más filtros» y los chips.
              Borde con la estética de las tarjetas (Matías, 2026-11-05): rdbu-10
              de 2 px arriba e izquierda y 4 px a la derecha y abajo, con sombra.
              Sin overflow oculto, para que las listas desplegables no se corten. */}
          <div className={cn("flex flex-col gap-m px-m py-l md:px-l md:py-xl", PANEL_V3)}>
            <div className="flex flex-col gap-l lg:flex-row lg:items-end lg:justify-between">
              <Grupo id="filtro-region" etiqueta="Región">
                <SelectorFiltro
                  idEtiqueta="filtro-region"
                  icono="map"
                  placeholder="Escoge una región"
                  opcionVacia="Todas las regiones"
                  opciones={REGIONES.map((r) => ({ valor: r.cod, etiqueta: r.nombre }))}
                  valores={region ? [region] : []}
                  onCambiar={([v]) =>
                    irA({
                      ...filtros,
                      region: v || undefined,
                      comuna: v && comuna?.region === v ? filtros.comuna : undefined,
                      desdeGps: undefined,
                      distanciaMaxKm: undefined,
                    })
                  }
                />
              </Grupo>
              <Grupo id="filtro-comuna" etiqueta="Comuna">
                <SelectorFiltro
                  idEtiqueta="filtro-comuna"
                  icono="location_city"
                  placeholder={datos ? "Escoge una comuna" : "Cargando comunas…"}
                  opcionVacia={region ? "Todas las comunas de la región" : "Todas las comunas"}
                  opciones={opcionesComuna}
                  valores={filtros.comuna ? [String(filtros.comuna)] : []}
                  onCambiar={([v]) => {
                    const cod = v ? Number(v) : undefined;
                    const c = cod ? datos?.comunaPorCod.get(cod) : undefined;
                    irA({ ...filtros, comuna: cod, region: c?.region ?? region, desdeGps: undefined, distanciaMaxKm: undefined });
                  }}
                />
              </Grupo>
              <Grupo id="filtro-nombre" etiqueta="Establecimiento" comoLabel className="lg:w-[358px]">
                <Buscador
                  id="filtro-nombre"
                  valorInicial={filtros.q ?? ""}
                  placeholder="Nombre del establecimiento"
                  onBuscar={(q) => irA({ ...filtros, q: q || undefined })}
                />
              </Grupo>
            </div>

            {/* «Más filtros» (Matías, 2026-11-05): nombra el grupo de chips y
                desplegables; el grupo lo usa como nombre accesible. */}
            <p id="mas-filtros" className="font-heading text-md font-medium tracking-[0.015em] text-rdbu-01">
              Más filtros
            </p>
            <div role="group" aria-labelledby="mas-filtros" className="flex flex-wrap gap-m">
              <ChipFiltro
                icono="my_location"
                label={conGps && estadoGps === "cargando" ? "Buscando tu ubicación…" : "Usar mi ubicación"}
                className="w-full sm:w-auto"
                activo={conGps}
                disabled={conGps && estadoGps === "cargando"}
                onClick={() => {
                  if (conGps) {
                    irA({ ...filtros, desdeGps: undefined, distanciaMaxKm: undefined });
                    return;
                  }
                  if (ubicacion?.tipo !== "gps") pedirGps();
                  irA({ ...filtros, desdeGps: true, distanciaMaxKm: RADIO_GPS_KM, region: undefined, comuna: undefined });
                }}
              />
              <ChipFiltro
                icono="monetization_on"
                label="Gratuito"
                className="w-full sm:w-auto"
                activo={!!filtros.gratuito}
                onClick={() => irA({ ...filtros, gratuito: filtros.gratuito ? undefined : true })}
              />
              <ChipFiltro
                icono="accessibility_new"
                label="Programa de integración escolar (PIE)"
                className="w-full sm:w-auto"
                activo={!!filtros.pie}
                onClick={() => irA({ ...filtros, pie: filtros.pie ? undefined : true })}
              />
              <SelectorFiltro
                icono="school"
                placeholder="Nivel (Curso)"
                opcionVacia="Cualquier nivel"
                opciones={NIVELES}
                valores={filtros.nivel && filtros.nivel !== "basica_y_media" ? [filtros.nivel] : []}
                onCambiar={([v]) => irA({ ...filtros, nivel: (v as NivelFiltro) || undefined })}
                className="w-full sm:w-auto"
              />
              <SelectorFiltro
                icono="account_balance"
                placeholder="Dependencia"
                multiple
                opcionVacia="Cualquier dependencia"
                opciones={DEPENDENCIAS}
                valores={filtros.tipos ?? []}
                onCambiar={(v) => irA({ ...filtros, tipos: v.length ? (v as TipoColegio[]) : undefined })}
                className="w-full sm:w-auto"
              />
            </div>

            {conGps && MENSAJE_GPS[estadoGps] && (
              <p role="alert" className="text-xs text-error-fuerte">
                {MENSAJE_GPS[estadoGps]}
              </p>
            )}
          </div>

          {/* Resultados */}
          {/* Ficha de ayuda (Matías, 2026-11-05): desaparece cuando aparecen la
              lista o el mapa. Menciona «Usar mi ubicación», que no está en el
              diseño pero sí en el panel. */}
          {!modo && !conGps && (
            <FichaInformativa>
              <p>
                Elige una región o comuna, busca un colegio por su nombre o usa el botón «Usar mi ubicación» para ver
                los colegios que están cerca de ti.
              </p>
            </FichaInformativa>
          )}

          {error && (
            <p role="alert" className="text-xs text-error-fuerte">
              No pudimos cargar los datos de los colegios. Revisa tu conexión y recarga la página.
            </p>
          )}

          {modo && !datos && !error && (
            <p role="status" className="text-xs text-texto-secundario">
              Cargando colegios…
            </p>
          )}

          {modo && datos && (
            <>
              <div className="flex flex-col gap-s sm:flex-row sm:items-center sm:justify-between">
                <ToggleVista vista={filtros.vista} onCambiar={(v) => irA({ ...filtros, vista: v })} />
                <div className="flex flex-col gap-xxs sm:items-end">
                  <p role="status" className="text-xs text-texto-secundario">
                    {items.length === 0
                      ? "No hay colegios que coincidan con tus filtros."
                      : `${items.length.toLocaleString("es-CL")} ${items.length === 1 ? "colegio" : "colegios"} ${lugar}`}
                    {filtros.q ? ` · «${filtros.q}»` : ""}
                  </p>
                  {/* Igual que en la ficha: con dos o más colegios elegidos, el atajo a la comparación. */}
                  {comparar.rbds.length >= 2 && (
                    <EnlaceTexto href={enComparar ? "#comparacion" : comparar.url}>
                      {enComparar ? "Subir a la comparación" : "Ver comparación"} ({comparar.rbds.length} de{" "}
                      {maximoComparar})
                    </EnlaceTexto>
                  )}
                </div>
              </div>

              {filtros.vista === "mapa" ? (
                <div className="flex flex-col gap-xs">
                  {items.length > MAX_PINES && (
                    <p className="text-2xs text-texto-secundario">
                      El mapa muestra los {MAX_PINES} primeros. Usa los filtros para acotar.
                    </p>
                  )}
                  <MapaLeaflet
                    items={items.slice(0, MAX_PINES)}
                    referencia={refMapa}
                    className="relative h-[70vh] min-h-[480px] w-full lg:h-[720px]"
                  />
                </div>
              ) : (
                <>
                  <ul className="grid grid-cols-1 gap-l md:grid-cols-2 lg:grid-cols-3 lg:gap-xl">
                    {visibles.map(({ c, d }) => (
                      <li key={c.rbd} className="flex flex-col">
                        <TarjetaColegio
                          colegio={c}
                          distanciaKm={modo === "gps" ? d : undefined}
                          referencia={referencia}
                          nombreComuna={datos.comunaPorCod.get(c.c)?.nombre}
                          enComparacion={comparar.rbds.includes(c.rbd)}
                          comparacionLlena={comparar.rbds.length >= maximoComparar}
                          maximoComparar={maximoComparar}
                          onComparar={() => alternarComparacion(c.rbd)}
                        />
                      </li>
                    ))}
                  </ul>
                  {items.length > visibles.length && (
                    <button
                      type="button"
                      onClick={() => setPagina((p) => p + 1)}
                      className="inline-flex min-h-12 items-center justify-center self-start rounded-s border-2 border-rdbu-02 bg-superficie-base px-l text-xs font-bold text-texto-primario transition-colors hover:bg-rdbu-05 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rdbu-10"
                    >
                      Ver más colegios ({(items.length - visibles.length).toLocaleString("es-CL")} restantes)
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Grupo del panel: el nombre del filtro (Work Sans Medium 24 px, rdbu-01)
 * sobre su control. `comoLabel`: el nombre es un <label> del campo de texto;
 * en los desplegables es un texto con id, que el botón usa en su nombre
 * accesible (aria-labelledby).
 */
function Grupo({
  id,
  etiqueta,
  comoLabel = false,
  className,
  children,
}: {
  id: string;
  etiqueta: string;
  comoLabel?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const clase = "font-heading text-lg font-medium tracking-[0.015em] text-rdbu-01";
  return (
    <div className={`flex flex-col gap-m ${className ?? ""}`}>
      {comoLabel ? (
        <label htmlFor={id} className={clase}>
          {etiqueta}
        </label>
      ) : (
        <span id={id} className={clase}>
          {etiqueta}
        </span>
      )}
      {children}
    </div>
  );
}
