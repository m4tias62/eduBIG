"use client";

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";

/**
 * Globo (tooltip) — patrón ÚNICO de ayuda contextual en todo el sitio
 * (oct-2026, propuesto en el rediseño de Comparar).
 *
 * - Fondo superficie-inversa, texto blanco 14 px, radio s, ancho máx. 20rem.
 * - Se abre al pasar el cursor, con foco de teclado y al tocar (celular);
 *   se cierra al salir, al perder el foco o con Esc.
 * - El mismo texto queda disponible para lectores de pantalla
 *   (aria-describedby), esté abierto o no.
 * - Se alinea solo para no salirse de la ventana (nunca provoca scroll
 *   horizontal).
 *
 * Disparador: por defecto el ícono "info" (objetivo táctil de 44 px). Con
 * `children`, el texto va junto al ícono; con `sinIcono`, solo el texto.
 */
export function Globo({
  texto,
  children,
  etiqueta,
  sinIcono = false,
  className,
  claseDisparador,
}: {
  texto: ReactNode;
  children?: ReactNode;
  /** Nombre accesible cuando el disparador es solo el ícono. */
  etiqueta?: string;
  sinIcono?: boolean;
  className?: string;
  claseDisparador?: string;
}) {
  const id = useId();
  const [abierto, setAbierto] = useState(false);
  const [alinear, setAlinear] = useState<"izq" | "der">("izq");
  const [debajo, setDebajo] = useState(false);
  const raiz = useRef<HTMLSpanElement>(null);
  const globo = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!abierto || !raiz.current || !globo.current) return;
    const r = raiz.current.getBoundingClientRect();
    const ancho = globo.current.offsetWidth;
    const alto = globo.current.offsetHeight;
    setAlinear(r.left + ancho > document.documentElement.clientWidth - 16 ? "der" : "izq");
    // Bajo la barra de navegación fija (64 px) no cabe arriba: se abre hacia abajo.
    setDebajo(r.top - alto < 80);
  }, [abierto]);

  return (
    <span ref={raiz} className={clsx("relative inline-flex", className)}>
      <button
        type="button"
        aria-describedby={id}
        aria-label={children ? undefined : etiqueta ?? "Más información"}
        aria-expanded={abierto}
        onMouseEnter={() => setAbierto(true)}
        onMouseLeave={() => setAbierto(false)}
        onFocus={() => setAbierto(true)}
        onBlur={() => setAbierto(false)}
        onClick={() => setAbierto((a) => !a)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setAbierto(false);
        }}
        className={clsx(
          "inline-flex min-h-objetivo-tactil items-center gap-xxs text-left",
          !children && "min-w-objetivo-tactil justify-center",
          claseDisparador ?? "text-texto-secundario hover:text-texto-primario"
        )}
      >
        {children}
        {!sinIcono && <Icon nombre="info" size={children ? 16 : 20} />}
      </button>
      <span
        ref={globo}
        id={id}
        role="tooltip"
        className={clsx(
          abierto
            ? [
                "absolute z-40 w-max max-w-[min(20rem,calc(100vw-2rem))] rounded-s bg-superficie-inversa px-s py-xs text-left text-xs font-normal leading-normal text-texto-sobre-oscuro shadow-md",
                alinear === "izq" ? "left-0" : "right-0",
                debajo ? "top-full mt-xxs" : "bottom-full mb-xxs",
              ]
            : "sr-only"
        )}
      >
        {texto}
      </span>
    </span>
  );
}
