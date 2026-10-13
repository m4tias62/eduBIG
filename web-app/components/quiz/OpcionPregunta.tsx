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
        "flex min-h-[44px] w-full flex-col gap-xxs rounded-m border px-l py-m text-left transition-colors focus:border-interaccion-foco focus:outline-none",
        secundaria
          ? "border-dashed border-borde-definido bg-superficie-elevada text-texto-secundario hover:border-texto-primario"
          : "border-borde-definido bg-superficie-base text-texto-primario hover:border-texto-primario hover:bg-superficie-elevada"
      )}
    >
      <span className={secundaria ? "text-xs" : "text-sm"}>{children}</span>
      {detalle && <span className="text-2xs text-texto-secundario">{detalle}</span>}
    </Link>
  );
}
