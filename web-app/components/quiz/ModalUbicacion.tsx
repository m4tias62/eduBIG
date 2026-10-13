"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { SelectorUbicacion } from "@/components/ubicacion/SelectorUbicacion";

/**
 * D23 — Shortlist abierta sin ubicación (enlace compartido o sesión nueva).
 * Explica para qué se pide la ubicación y la pide. Si la persona acepta, la
 * shortlist se recalcula con las mismas respuestas desde su ubicación. Si no,
 * pasa a la exploración manual.
 */
export function ModalUbicacion() {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-ubicacion-titulo"
      onCancel={(e) => e.preventDefault()}
      className="w-[calc(100%-32px)] max-w-md rounded-l p-0 backdrop:bg-superficie-inversa/60"
    >
      <div className="flex flex-col gap-l p-l">
        <div className="flex flex-col gap-xs">
          <h2 id="modal-ubicacion-titulo" className="text-md font-bold text-texto-primario">
            ¿Desde dónde buscas colegio?
          </h2>
          <p className="text-xs text-texto-secundario">
            Esta lista se arma con las respuestas del Test y con la distancia a cada colegio. La
            ubicación no viaja en los enlaces, así que necesitamos la tuya para recalcularla con
            las mismas respuestas.
          </p>
        </div>
        <SelectorUbicacion onListo={() => ref.current?.close()} />
        <Link
          href="/explorar"
          className="min-h-[44px] inline-flex items-center justify-center rounded-m border border-borde-definido px-l py-s text-xs font-bold text-texto-primario hover:border-texto-primario"
        >
          Prefiero explorar por mi cuenta
        </Link>
      </div>
    </dialog>
  );
}
