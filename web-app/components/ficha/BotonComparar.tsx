"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { MAX_COMPARAR, useComparar } from "@/lib/comparar";

/** Agregar / quitar el colegio de la comparación (D32), con acceso a ella. */
export function BotonComparar({ rbd, nombre }: { rbd: number; nombre: string }) {
  const { rbds, alternar } = useComparar();
  const esta = rbds.includes(rbd);
  const lleno = !esta && rbds.length >= MAX_COMPARAR;

  return (
    <div className="flex flex-col gap-xs">
      <button
        type="button"
        onClick={() => alternar(rbd)}
        disabled={lleno}
        aria-pressed={esta}
        className="min-h-[44px] inline-flex items-center justify-center gap-xs rounded-m border-2 border-interaccion-enlace bg-superficie-base px-l py-s text-xs font-bold text-interaccion-enlace hover:bg-info-suave disabled:border-borde-definido disabled:text-texto-secundario"
      >
        <Icon nombre={esta ? "check" : "add"} size={18} />
        {esta ? "En tu comparación" : "Agregar a comparar"}
        <span className="sr-only"> {nombre}</span>
      </button>
      {lleno && (
        <p className="text-2xs text-texto-secundario">
          Ya tienes {MAX_COMPARAR} colegios para comparar. Quita uno para agregar este.
        </p>
      )}
      {rbds.length >= 2 && (
        <Link
          href={`/comparar?rbd=${rbds.join(",")}`}
          className="min-h-[44px] inline-flex items-center justify-center gap-xxs text-xs font-bold text-interaccion-enlace hover:text-interaccion-enlace-hover"
        >
          Ver comparación ({rbds.length} de {MAX_COMPARAR})
          <Icon nombre="arrow_forward" size={16} />
        </Link>
      )}
    </div>
  );
}
