"use client";

import { useId, useState, type ReactNode } from "react";
import { EncabezadoPlegable } from "@/components/ui/Plegable";

/**
 * Wrapper colapsable de módulo de ficha.
 *
 * v3 (2026-11-09): el encabezado es el plegable unificado del sitio
 * (EncabezadoPlegable: forma de la ficha con los estados del desplegable).
 * Abierto, el contenido sigue en una tarjeta blanca bajo el encabezado.
 *
 * Espejo del component set `Módulo <X>` de Figma con variantes
 * Estado=Cerrado / Estado=Abierto. En web usamos useState + rotación
 * del chevron con transición CSS (arrow_drop_down apunta abajo cuando
 * está abierto, se rota -90° cuando está cerrado — mismo patrón Figma).
 *
 * Defecto: OPEN. Coincide con lo que Matías validó en Figma en los mocks
 * de las dos fichas demo. Se puede cerrar con click.
 */
export function ModuloBase({
  icono,
  titulo,
  conclusion,
  fuente,
  defaultOpen = true,
  children,
}: {
  icono: string;
  titulo: string;
  conclusion: string;
  fuente?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <section className="flex flex-col">
      <EncabezadoPlegable
        nivel="h3"
        icono={icono}
        titulo={titulo}
        conclusion={conclusion}
        abierto={open}
        onAlternar={() => setOpen((o) => !o)}
        idControl={id}
        className={open ? "[&>button]:rounded-b-none" : undefined}
      />

      {open && (
        <div id={id} className="flex flex-col gap-xl rounded-b-s border-x border-b border-borde-sutil bg-superficie-base p-l pt-m">
          {children}
          {fuente && (
            <div className="flex flex-col gap-xxs pt-m border-t border-borde-sutil">
              <p className="text-2xs text-texto-terciario">{fuente}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
