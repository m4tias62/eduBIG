"use client";

import { useId, useRef } from "react";
import { Boton } from "@/components/ui/Boton";
import { BotonTexto } from "@/components/ui/EnlaceTexto";

/**
 * Sección anunciada que todavía no existe (v3, anotación de Matías en Figma:
 * «Vamos a agregar esta sección, pero queda en estado en construcción:
 * utilizar una modal simple para informar su estado»).
 *
 * Usa el <dialog> nativo con showModal(): atrapa el foco dentro del aviso,
 * se cierra con Escape y devuelve el foco al botón que lo abrió. También se
 * cierra al hacer clic fuera del aviso. Es la única excepción a la norma de
 * alineación a la izquierda (D39): los diálogos van centrados.
 */
export function AvisoEnConstruccion({ etiqueta }: { etiqueta: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const idTitulo = `${id}-titulo`;
  const idTexto = `${id}-texto`;

  return (
    <>
      <BotonTexto aria-haspopup="dialog" onClick={() => ref.current?.showModal()}>
        {etiqueta}
      </BotonTexto>
      <dialog
        ref={ref}
        aria-labelledby={idTitulo}
        aria-describedby={idTexto}
        onClick={(e) => {
          if (e.target === e.currentTarget) ref.current?.close();
        }}
        className="w-[calc(100%-2*theme(spacing.l))] max-w-md rounded-l bg-superficie-base p-0 text-texto-primario shadow-lg backdrop:bg-black/50"
      >
        <div className="flex flex-col gap-m p-xl">
          <h2 id={idTitulo} className="text-md font-bold">
            {etiqueta}
          </h2>
          <p id={idTexto} className="text-sm text-texto-secundario">
            Estamos preparando esta sección. Muy pronto vas a encontrar aquí más datos sobre la educación en Chile.
          </p>
          <Boton onClick={() => ref.current?.close()} className="self-start">
            Entendido
          </Boton>
        </div>
      </dialog>
    </>
  );
}
