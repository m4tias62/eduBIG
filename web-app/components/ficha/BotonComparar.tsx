"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Boton } from "@/components/ui/Boton";
import { cn } from "@/lib/utils";
import { MAX_COMPARAR, MAX_COMPARAR_MOVIL, useComparar } from "@/lib/comparar";
import { useEscritorio } from "@/lib/useEscritorio";

/** Agregar / quitar el colegio de la comparación (D32): 3 en móvil, 4 en escritorio. */
export function BotonComparar({ rbd, nombre }: { rbd: number; nombre: string }) {
  const { rbds, url, alternar } = useComparar();
  const maximo = useEscritorio() ? MAX_COMPARAR : MAX_COMPARAR_MOVIL;
  const esta = rbds.includes(rbd);
  const lleno = !esta && rbds.length >= maximo;

  return (
    <div className="flex flex-col gap-xs">
      {/* v3: el botón secundario del sitio (antes, uno escrito a mano). */}
      <Boton
        variante="contorno"
        onClick={() => alternar(rbd, maximo)}
        disabled={lleno}
        aria-pressed={esta}
        className={cn(
          esta && "bg-interaccion-tinte text-interaccion-enlace-hover hover:bg-rdbu-05",
          "disabled:cursor-not-allowed disabled:border-borde-definido disabled:bg-superficie-base disabled:text-texto-secundario"
        )}
      >
        <Icon nombre={esta ? "check" : "add"} size={24} />
        {esta ? "En tu comparación" : "Agregar a comparar"}
        <span className="sr-only"> {nombre}</span>
      </Boton>
      {lleno && (
        <p className="text-2xs text-texto-secundario">
          Ya tienes {maximo} colegios para comparar. Quita uno para agregar este.
        </p>
      )}
      {rbds.length >= 2 && (
        <Link
          href={url}
          className="min-h-[44px] inline-flex items-center justify-center gap-xxs text-xs font-bold text-interaccion-enlace hover:text-interaccion-enlace-hover"
        >
          Ver comparación ({rbds.length} de {maximo})
          <Icon nombre="arrow_forward" size={16} />
        </Link>
      )}
    </div>
  );
}
