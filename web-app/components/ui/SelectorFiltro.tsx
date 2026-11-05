"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { CHIP_ACTIVO, CHIP_BASE, CHIP_INACTIVO } from "@/components/ui/ChipFiltro";
import { normalizar } from "@/lib/home/filtros";

/**
 * Filtro desplegable (v3, Figma «Filter chips» 833:9272 y «Drop downs»
 * 834:487). Misma forma que el chip de filtro, con flecha:
 * - Plegado: como el chip inactivo (hover en rdbu-05).
 * - Desplegado: como el chip activo (rdbu-10), con la lista abierta debajo.
 * - Lista: filas de 48 px en Roboto 16 sobre blanco; la opción elegida en
 *   rdbu-10 con texto rdbu-06; hover en rdbu-05.
 *
 * Accesibilidad (patrón «listbox» de la WAI-ARIA APG):
 * - El botón anuncia su etiqueta y el valor elegido (aria-labelledby) y si la
 *   lista está abierta (aria-expanded).
 * - Con la lista abierta: flechas para moverse, Inicio y Fin, Enter o
 *   Espacio para elegir, Escape para cerrar y volver al botón, y escribir las
 *   primeras letras para saltar a una opción (útil en las comunas).
 * - `multiple`: se pueden elegir varias; la lista queda abierta.
 */
export interface OpcionFiltro {
  valor: string;
  etiqueta: string;
}

export function SelectorFiltro({
  idEtiqueta,
  icono,
  placeholder,
  opciones,
  valores,
  onCambiar,
  multiple = false,
  opcionVacia,
  className,
}: {
  /** id del texto visible que nombra el filtro (por ejemplo, «Región»). */
  idEtiqueta?: string;
  icono: string;
  /** Texto del botón cuando no hay nada elegido. */
  placeholder: string;
  opciones: OpcionFiltro[];
  valores: string[];
  onCambiar: (valores: string[]) => void;
  multiple?: boolean;
  /** Primera opción, que deja el filtro sin valor (por ejemplo, «Todas las regiones»). */
  opcionVacia?: string;
  className?: string;
}) {
  const id = useId();
  const idBoton = `${id}-boton`;
  const idLista = `${id}-lista`;
  const idValor = `${id}-valor`;
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const raiz = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const tecleo = useRef({ texto: "", hasta: 0 });
  // Selección vigente, también entre dos cambios seguidos antes de que la URL
  // se actualice (con `multiple`, elegir dos opciones rápido no pierde la primera).
  const actuales = useRef(valores);
  useEffect(() => {
    actuales.current = valores;
  }, [valores]);

  const todas: OpcionFiltro[] = opcionVacia ? [{ valor: "", etiqueta: opcionVacia }, ...opciones] : opciones;
  const elegidas = opciones.filter((o) => valores.includes(o.valor));
  // Sin una etiqueta visible afuera (Nivel, Dependencia), el botón conserva
  // el nombre del filtro al elegir: «Nivel (Curso): Media» (WCAG 3.3.2 y 2.5.3).
  const conNombre = !idEtiqueta;
  const texto =
    elegidas.length === 0
      ? placeholder
      : elegidas.length === 1
        ? conNombre
          ? `${placeholder}: ${elegidas[0].etiqueta}`
          : elegidas[0].etiqueta
        : `${placeholder} (${elegidas.length})`;
  const textoLector = elegidas.length
    ? `${conNombre ? `${placeholder}: ` : ""}${elegidas.map((o) => o.etiqueta).join(", ")}`
    : conNombre
      ? `${placeholder}, ${opcionVacia ?? "sin elegir"}`
      : placeholder;

  // Cerrar al hacer clic fuera.
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [abierto]);

  // Al abrir, el foco pasa a la lista; la opción activa queda a la vista.
  useEffect(() => {
    if (abierto) lista.current?.focus({ preventScroll: true });
  }, [abierto]);
  useEffect(() => {
    if (!abierto) return;
    lista.current?.querySelector<HTMLElement>(`[data-i="${activo}"]`)?.scrollIntoView({ block: "nearest" });
  }, [abierto, activo]);

  function abrir() {
    const i = todas.findIndex((o) => valores.includes(o.valor));
    setActivo(i >= 0 ? i : 0);
    setAbierto(true);
  }

  function cerrar(volverAlBoton = true) {
    setAbierto(false);
    if (volverAlBoton) boton.current?.focus();
  }

  function elegir(i: number) {
    const o = todas[i];
    if (!o) return;
    if (o.valor === "") {
      onCambiar([]);
      cerrar();
      return;
    }
    if (multiple) {
      const v = actuales.current;
      const nuevos = v.includes(o.valor) ? v.filter((x) => x !== o.valor) : [...v, o.valor];
      actuales.current = nuevos;
      onCambiar(nuevos);
    } else {
      onCambiar([o.valor]);
      cerrar();
    }
  }

  function alTeclearLista(e: KeyboardEvent<HTMLUListElement>) {
    const ultimo = todas.length - 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActivo((a) => Math.min(a + 1, ultimo));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivo((a) => Math.max(a - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActivo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActivo(ultimo);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      elegir(activo);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cerrar();
    } else if (e.key === "Tab") {
      setAbierto(false);
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      // Escribir para saltar: «pu» lleva a Pudahuel.
      const ahora = Date.now();
      const t = tecleo.current;
      t.texto = (ahora < t.hasta ? t.texto : "") + normalizar(e.key);
      t.hasta = ahora + 700;
      const i = todas.findIndex((o) => normalizar(o.etiqueta).startsWith(t.texto));
      if (i >= 0) setActivo(i);
    }
  }

  return (
    <div ref={raiz} className={cn("relative", className)}>
      <span id={idValor} className="sr-only">
        {textoLector}
      </span>
      <button
        ref={boton}
        id={idBoton}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={idLista}
        aria-labelledby={idEtiqueta ? `${idEtiqueta} ${idValor}` : idValor}
        onClick={() => (abierto ? cerrar(false) : abrir())}
        onKeyDown={(e) => {
          if (!abierto && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            abrir();
          }
        }}
        className={cn(CHIP_BASE, abierto ? CHIP_ACTIVO : CHIP_INACTIVO, "w-full justify-start lg:w-auto")}
      >
        <Icon nombre={icono} size={24} />
        <span className="truncate">{texto}</span>
        <Icon nombre={abierto ? "expand_less" : "expand_more"} size={24} className="ml-auto" />
      </button>

      {abierto && (
        <ul
          ref={lista}
          id={idLista}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={idEtiqueta}
          aria-label={idEtiqueta ? undefined : placeholder}
          aria-multiselectable={multiple || undefined}
          aria-activedescendant={`${id}-op-${activo}`}
          onKeyDown={alTeclearLista}
          className="absolute left-0 top-full z-30 mt-xxs max-h-[288px] min-w-full w-max max-w-[min(90vw,360px)] overflow-auto bg-superficie-base py-0 shadow-[0_0.94px_1.41px_rgba(0,0,0,0.3),0_2.83px_4.72px_1.89px_rgba(0,0,0,0.15)] outline-none"
        >
          {todas.map((o, i) => {
            const vigentes = multiple ? actuales.current : valores;
            const elegida = o.valor === "" ? vigentes.length === 0 : vigentes.includes(o.valor);
            return (
              <li
                key={o.valor || "vacia"}
                id={`${id}-op-${i}`}
                data-i={i}
                role="option"
                aria-selected={elegida}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(i)}
                onMouseEnter={() => setActivo(i)}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center gap-xs px-s text-sm",
                  elegida ? "bg-rdbu-10 text-rdbu-06" : "text-texto-primario",
                  !elegida && i === activo && "bg-rdbu-05",
                  // Opción activa con el teclado: marco interior rojo, o blanco si ya está elegida.
                  i === activo && (elegida ? "shadow-[inset_0_0_0_2px_#ffffff]" : "shadow-[inset_0_0_0_2px_#b2181f]")
                )}
              >
                {multiple && o.valor !== "" && (
                  <Icon nombre={elegida ? "check_box" : "check_box_outline_blank"} size={20} />
                )}
                {o.etiqueta}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
