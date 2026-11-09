"use client";

import { Icon } from "@/components/ui/Icon";
import { EnlaceTexto } from "@/components/ui/EnlaceTexto";
import { useComparar } from "@/lib/comparar";

/**
 * "Quitar" de la comparación: navega a la URL sin el colegio (los demás
 * conservan su posición y color) y lo saca también de la selección guardada,
 * incluso cuando no queda ninguno (la URL /comparar sin colegios no sincroniza).
 *
 * v3 (2026-11-09, anotación de Matías: «no corresponden a ningún botón del
 * sitio, unificar»): usa el enlace de texto del sitio (el de «Volver»), con la
 * ✕ a la izquierda como la flecha de «Volver».
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
    <EnlaceTexto
      href={href}
      scroll={false}
      onClick={() => quitar(rbd)}
      aria-label={`Quitar ${nombre} de la comparación`}
      className={soloIcono ? "min-w-objetivo-tactil flex-none justify-center" : "-ml-xxs gap-xxs self-start"}
    >
      <Icon nombre="close" size={20} />
      {!soloIcono && "Quitar"}
    </EnlaceTexto>
  );
}
