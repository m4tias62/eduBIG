"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AccionEnlace, Enlace } from "@/components/ui/Enlace";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useDatosNacionales } from "@/lib/data/cliente";
import { dependenciaGlosa } from "@/lib/data/formatters";
import { normalizar } from "@/lib/home/filtros";
import { useComparar } from "@/lib/comparar";
import type { Posicion } from "@/lib/viz";
import { Icon } from "@/components/ui/Icon";
import { MarcadorColegio } from "@/components/viz/basicos";

/**
 * Agregar un colegio sin salir de Comparar (oct-2026). Antes, con 2 o más
 * colegios no había cómo sumar otro desde esta pantalla: había que volver a
 * Explorar, abrir una ficha y regresar. Ahora cada espacio libre abre un
 * buscador por nombre o comuna; al elegir, el colegio entra en ESA posición
 * (y con su color).
 */

export interface Actual {
  rbd: number;
  posicion: Posicion;
}

/** URL de la comparación con un colegio más en la posición indicada. */
export function urlConNuevo(actuales: Actual[], rbd: number, posicion: Posicion): string {
  const todos = [...actuales, { rbd, posicion }].sort((a, b) => a.posicion - b.posicion);
  const consecutivas = todos.every((c, i) => c.posicion === i + 1);
  return `/comparar?rbd=${todos.map((c) => c.rbd).join(",")}${
    consecutivas ? "" : `&pos=${todos.map((c) => c.posicion).join(",")}`
  }`;
}

/** Posiciones libres (1…max) que todavía se pueden ocupar. */
export function posicionesLibres(actuales: Actual[], max: number): Posicion[] {
  const usadas = new Set(actuales.map((c) => c.posicion));
  const libres = ([1, 2, 3, 4] as Posicion[]).filter((p) => p <= max && !usadas.has(p));
  return libres.slice(0, Math.max(0, max - actuales.length));
}

/** Disparador de un espacio libre: marcador punteado con su número + "Agregar un colegio". */
export function BotonEspacioLibre({
  posicion,
  abierto,
  onClick,
  conTexto = true,
}: {
  posicion: Posicion;
  abierto: boolean;
  onClick: () => void;
  conTexto?: boolean;
}) {
  // v3 (2026-11-09): el enlace del sitio (AccionEnlace). El marcador queda
  // fuera, como apoyo visual; el número va en el nombre accesible.
  return (
    <span className="inline-flex items-center gap-xs">
      <span aria-hidden>
        <MarcadorColegio posicion={posicion} libre />
      </span>
      <AccionEnlace
        icono="add"
        onClick={onClick}
        aria-expanded={abierto}
        className={clsx(abierto && "bg-interaccion-tinte text-interaccion-enlace-hover")}
      >
        {conTexto ? "Agregar un colegio" : "Agregar"}
        <span className="sr-only"> en el espacio {posicion}</span>
      </AccionEnlace>
    </span>
  );
}

/**
 * Buscador (combobox accesible): escribe, elige con flechas + Enter o con clic.
 * Carga el índice nacional solo cuando se abre.
 */
export function BuscadorAgregar({
  posicion,
  actuales,
  onCerrar,
}: {
  posicion: Posicion;
  actuales: Actual[];
  onCerrar: () => void;
}) {
  const router = useRouter();
  const { datos, error } = useDatosNacionales();
  const { reemplazar } = useComparar();
  const [q, setQ] = useState("");
  const [activo, setActivo] = useState(0);
  // Como en SelectorFiltro: el marco de la opción activa se dibuja solo si se
  // mueve con el teclado; `presionada` es la fila bajo el puntero presionado.
  const [teclado, setTeclado] = useState(false);
  const [presionada, setPresionada] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const idLista = `${id}-lista`;
  const idAyuda = `${id}-ayuda`;

  useEffect(() => input.current?.focus(), []);

  const resultados = useMemo(() => {
    const qn = normalizar(q);
    if (!datos || qn.length < 2) return [];
    const ya = new Set(actuales.map((c) => c.rbd));
    const salida = [];
    for (const c of datos.indice) {
      if (ya.has(c.rbd)) continue;
      const nombre = normalizar(c.n);
      const comuna = normalizar(datos.comunaPorCod.get(c.c)?.nombre ?? "");
      if (nombre.includes(qn) || comuna.includes(qn) || String(c.rbd) === qn) salida.push({ c, empieza: nombre.startsWith(qn) });
    }
    salida.sort((a, b) => Number(b.empieza) - Number(a.empieza) || a.c.n.localeCompare(b.c.n, "es"));
    return salida.slice(0, 8).map((x) => x.c);
  }, [q, datos, actuales]);

  useEffect(() => setActivo(0), [q]);

  function elegir(rbd: number) {
    const todos = [...actuales, { rbd, posicion }];
    reemplazar(
      todos.map((c) => c.rbd),
      todos.map((c) => c.posicion)
    );
    onCerrar();
    router.push(urlConNuevo(actuales, rbd, posicion), { scroll: false });
  }

  const mostrarLista = resultados.length > 0;

  return (
    <div className="ancho-6-col mt-s flex flex-col gap-xs rounded-m border border-borde-sutil bg-superficie-elevada p-m">
      <div className="flex items-center justify-between gap-s">
        <label htmlFor={`${id}-input`} className="flex items-center gap-xs text-xs font-bold text-texto-primario">
          <MarcadorColegio posicion={posicion} libre />
          Agregar un colegio en el espacio {posicion}
        </label>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar el buscador"
          className="inline-flex min-h-objetivo-tactil min-w-objetivo-tactil items-center justify-center rounded-s text-texto-secundario transition-colors hover:bg-superficie-hundida hover:text-texto-primario"
        >
          <Icon nombre="close" size={20} />
        </button>
      </div>
      <div className="campo campo-envoltura flex min-h-[44px] items-center gap-xs px-m">
        <Icon nombre="search" size={20} className="text-texto-secundario" />
        <input
          ref={input}
          id={`${id}-input`}
          type="search"
          role="combobox"
          aria-expanded={mostrarLista}
          aria-controls={idLista}
          aria-autocomplete="list"
          aria-describedby={idAyuda}
          aria-activedescendant={mostrarLista ? `${id}-op-${activo}` : undefined}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setTeclado(true);
              setActivo((a) => Math.min(a + 1, resultados.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setTeclado(true);
              setActivo((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && mostrarLista) {
              e.preventDefault();
              elegir(resultados[activo].rbd);
            } else if (e.key === "Escape") {
              onCerrar();
            }
          }}
          placeholder="Nombre del colegio o comuna"
          className="w-full bg-transparent text-sm text-texto-primario placeholder:text-texto-secundario outline-none"
        />
      </div>
      <p id={idAyuda} className="text-2xs text-texto-secundario">
        {error
          ? "No pudimos cargar los colegios. Revisa tu conexión."
          : !datos
            ? "Cargando colegios…"
            : normalizar(q).length < 2
              ? "Escribe al menos 2 letras."
              : resultados.length === 0
                ? "No encontramos colegios con ese nombre o comuna."
                : `${resultados.length === 8 ? "Primeros 8 resultados" : `${resultados.length} resultados`}. Usa las flechas y Enter, o haz clic.`}
      </p>
      {/* Lista con el estilo de la lista de un desplegable (SelectorFiltro,
          2026-11-05): fondo blanco con elevación 4, filas de 48 px sin
          separadores; hover rdbu-05; presionada rdbu-04 con negrita; activa
          con el teclado: rdbu-05 y marco interior de 2 px en rdbu-11. */}
      {mostrarLista && (
        <ul
          id={idLista}
          role="listbox"
          aria-label="Colegios encontrados"
          onMouseMove={() => teclado && setTeclado(false)}
          className="flex flex-col bg-superficie-base shadow-[0_0.94px_1.41px_rgba(0,0,0,0.3),0_2.83px_4.72px_1.89px_rgba(0,0,0,0.15)]"
        >
          {resultados.map((c, i) => (
            <li
              key={c.rbd}
              id={`${id}-op-${i}`}
              role="option"
              aria-selected={i === activo}
              onMouseEnter={() => setActivo(i)}
              onMouseDown={(e) => e.preventDefault()}
              onPointerDown={() => setPresionada(i)}
              onPointerUp={() => setPresionada(null)}
              onPointerLeave={() => setPresionada((p) => (p === i ? null : p))}
              onClick={() => elegir(c.rbd)}
              className={clsx(
                "flex min-h-12 cursor-pointer flex-col justify-center px-s py-xs",
                presionada === i
                  ? "bg-rdbu-04"
                  : teclado && i === activo
                    ? "bg-rdbu-05 shadow-[inset_0_0_0_2px_#67001f]"
                    : "bg-superficie-base hover:bg-rdbu-05"
              )}
            >
              <span className={clsx("text-sm text-texto-primario", presionada === i ? "font-bold" : "font-medium")}>
                {c.n}
              </span>
              <span className="text-2xs text-texto-secundario">
                {datos?.comunaPorCod.get(c.c)?.nombre} · {dependenciaGlosa(c.d)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {/* 2026-11-09 (Matías: «cuando uno agrega un colegio desde aquí debería
          llevarme a Comparar colegios»): baja al explorador de esta misma
          página, en vez de la página /explorar antigua. */}
      <Enlace href="#explorar" iconoDerecha="arrow_downward" className="-ml-xxs self-start">
        O búscalo más abajo, con mapa y filtros
      </Enlace>
    </div>
  );
}

/** Fila de espacios libres + buscador (con 2 o más colegios en la comparación). */
export function EspaciosLibres({ actuales, max }: { actuales: Actual[]; max: number }) {
  const libres = posicionesLibres(actuales, max);
  const [abierta, setAbierta] = useState<Posicion | null>(null);
  if (libres.length === 0) return null;
  return (
    <div className="mt-s">
      <div className="flex flex-wrap items-center gap-x-m gap-y-xxs">
        <span className="text-xs text-texto-secundario">
          {libres.length === 1 ? "Queda 1 espacio:" : `Quedan ${libres.length} espacios:`}
        </span>
        {libres.map((p) => (
          <BotonEspacioLibre key={p} posicion={p} abierto={abierta === p} onClick={() => setAbierta(abierta === p ? null : p)} />
        ))}
      </div>
      {abierta && <BuscadorAgregar posicion={abierta} actuales={actuales} onCerrar={() => setAbierta(null)} />}
    </div>
  );
}
