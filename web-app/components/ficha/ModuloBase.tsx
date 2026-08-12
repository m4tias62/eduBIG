"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * Wrapper colapsable de módulo de ficha.
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

  return (
    <section className="bg-superficie-base border border-borde-sutil rounded-m overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-start gap-m p-l text-left hover:bg-superficie-elevada transition-colors"
      >
        <Icon nombre={icono} size={20} className="text-texto-primario mt-xxs" />
        <div className="flex-1 flex flex-col gap-xxs">
          <h3 className="text-sm font-bold text-texto-primario">{titulo}</h3>
          <p className="text-xs text-texto-secundario">{conclusion}</p>
        </div>
        <Icon
          nombre="arrow_drop_down"
          size={24}
          className={cn(
            "text-texto-secundario transition-transform",
            open ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>

      {open && (
        <>
          <div className="h-px w-full bg-borde-sutil" />
          <div className="p-l pt-m flex flex-col gap-xl">
            {children}
            {fuente && (
              <div className="flex flex-col gap-xxs pt-m border-t border-borde-sutil">
                <p className="text-2xs text-texto-terciario">{fuente}</p>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
