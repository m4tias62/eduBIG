"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { CHIP_BASE } from "@/components/ui/ChipFiltro";

const PLEGADO =
  "border-rdbu-02 bg-superficie-base text-texto-primario hover:bg-rdbu-05 active:bg-rdbu-04 active:font-bold";
const DESPLEGADO =
  "border-rdbu-11 bg-rdbu-10 text-rdbu-06 hover:bg-rdbu-07 hover:text-rdbu-11 active:bg-rdbu-10 active:text-rdbu-06 active:font-bold";
import { normalizar } from "@/lib/home/filtros";

/**
 * Filtro desplegable (v3, estados rediseñados por Matías el 2026-11-05:
 * «Filter chips» 833:9272, «Select» 903:9949 y «Select / Dropdown» 903:9921).
 *
 * Botón:
 * - Plegado: blanco con borde rdbu-02 y flecha rdbu-01; hover en rdbu-05;
 *   presionado en rdbu-04 con el texto en negrita.
 * - Desplegado: rdbu-10 con borde rdbu-11 y texto rdbu-06; hover en rdbu-07
 *   con texto rdbu-11; presionado en rdbu-10 con el texto en negrita.
 * - La negrita no mueve nada: el ancho del texto en negrita queda reservado.
 *
 * Opciones (filas de 48 px, Roboto 16):
 * - Sin elegir: blanco; hover en rdbu-05; presionada en rdbu-04 y negrita.
 * - Elegida: rdbu-10 con texto blanco; hover en rdbu-08 con texto rdbu-11;
 *   presionada en rdbu-10 y negrita.
 * - Con el teclado, la opción activa toma el color de hover y un marco
 *   interior de 2 px en rdbu-11 (con el mouse no se dibuja el marco).
 *
 * La lista abierta queda por encima de todo lo que tiene debajo (también del
 * mapa, que se aísla en su propio contexto de apilamiento) y lleva la
 * elevación 4 del diseño para separarse de lo que cubre.
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
  // Si la opción activa se mueve con el teclado (se dibuja su marco) o con el mouse.
  const [teclado, setTeclado] = useState(false);
  // Opción presionada con el puntero (el clic sobre la lista no le da foco a la fila).
  const [presionada, setPresionada] = useState<number | null>(null);
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
    setTeclado(true);
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
        onClick={(e) => {
          if (abierto) return cerrar(false);
          // detail 0 = abierto con Enter o Espacio: se muestra el marco de teclado.
          setTeclado(e.detail === 0);
          abrir();
        }}
        onKeyDown={(e) => {
          if (!abierto && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            setTeclado(true);
            abrir();
          }
        }}
        className={cn(CHIP_BASE, abierto ? DESPLEGADO : PLEGADO, "w-full justify-start lg:w-auto")}
      >
        <Icon nombre={icono} size={24} />
        {/* Ancho reservado para la negrita del estado presionado. */}
        <span className="grid min-w-0">
          <span aria-hidden className="invisible col-start-1 row-start-1 truncate font-bold">
            {texto}
          </span>
          <span className="col-start-1 row-start-1 truncate">{texto}</span>
        </span>
        {/* Flecha en rdbu-01 con la lista cerrada, como en el diseño; abierta toma el color del texto. */}
        <Icon nombre={abierto ? "expand_less" : "expand_more"} size={24} className={cn("ml-auto", !abierto && "text-rdbu-01")} />
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
          onMouseMove={() => teclado && setTeclado(false)}
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
                // Sin foco en la fila: el foco se queda en la lista (aria-activedescendant).
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={() => setPresionada(i)}
                onPointerUp={() => setPresionada(null)}
                onPointerLeave={() => setPresionada((p) => (p === i ? null : p))}
                onClick={() => elegir(i)}
                onMouseEnter={() => setActivo(i)}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center gap-xs px-s text-sm",
                  elegida
                    ? presionada === i
                      ? "bg-rdbu-10 font-bold text-texto-sobre-oscuro"
                      : "bg-rdbu-10 text-texto-sobre-oscuro hover:bg-rdbu-08 hover:text-rdbu-11"
                    : presionada === i
                      ? "bg-rdbu-04 font-bold text-texto-primario"
                      : "bg-superficie-base text-texto-primario hover:bg-rdbu-05",
                  // Opción activa con el teclado: color de hover y marco interior rdbu-11.
                  teclado &&
                    i === activo &&
                    presionada === null &&
                    (elegida
                      ? "bg-rdbu-08 text-rdbu-11 shadow-[inset_0_0_0_2px_#67001f]"
                      : "bg-rdbu-05 shadow-[inset_0_0_0_2px_#67001f]")
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
