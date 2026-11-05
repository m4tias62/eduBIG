"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Opción clickable de una pregunta del Test (auto-avance: la respuesta es la
 * acción, sin botón "Continuar").
 *
 * `secundaria`: menos peso visual, para "No tengo una prioridad clara" (D35).
 */
export function OpcionPregunta({
  href,
  children,
  detalle,
  secundaria = false,
}: {
  href: string;
  children: ReactNode;
  detalle?: string;
  secundaria?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        // v3 (2026-11-05): mismos estados que las opciones de los filtros:
        // borde rdbu-02, hover en rdbu-05, presionada en rdbu-04 con negrita y
        // foco con contorno rdbu-10. Sin el oscurecimiento global al presionar.
        "flex min-h-12 w-full flex-col gap-xxs rounded-s border-2 border-rdbu-02 px-l py-m text-left transition-colors",
        "hover:bg-rdbu-05 active:bg-rdbu-04 active:font-bold active:!filter-none",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rdbu-10",
        secundaria ? "border-dashed bg-transparent text-texto-secundario" : "bg-superficie-base text-texto-primario"
      )}
    >
      <span className={secundaria ? "text-xs" : "text-sm"}>{children}</span>
      {detalle && <span className="text-2xs text-texto-secundario">{detalle}</span>}
    </Link>
  );
}
