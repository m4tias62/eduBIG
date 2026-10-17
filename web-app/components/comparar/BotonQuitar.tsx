"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { useComparar } from "@/lib/comparar";

/**
 * "Quitar" de la comparación: navega a la URL sin el colegio (los demás
 * conservan su posición y color) y lo saca también de la selección guardada,
 * incluso cuando no queda ninguno (la URL /comparar sin colegios no sincroniza).
 */
export function BotonQuitar({
  rbd,
  nombre,
  href,
  soloIcono = false,
}: {
  rbd: number;
  nombre: string;
  href: string;
  soloIcono?: boolean;
}) {
  const { quitar } = useComparar();
  return (
    <Link
      href={href}
      scroll={false}
      onClick={() => quitar(rbd)}
      aria-label={`Quitar ${nombre} de la comparación`}
      className="inline-flex min-h-objetivo-tactil min-w-objetivo-tactil items-center gap-xxs self-start pr-xs text-xs text-texto-secundario hover:text-texto-primario"
    >
      <Icon nombre="close" size={16} />
      {!soloIcono && "Quitar"}
    </Link>
  );
}
