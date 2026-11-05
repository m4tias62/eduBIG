"use client";

import { useRouter } from "next/navigation";
import { BotonTexto } from "@/components/ui/EnlaceTexto";
import { Icon } from "@/components/ui/Icon";

/**
 * «Volver» de la ficha y de Explorar (v3). Igual al del Test de Calce: enlace
 * de texto con flecha y los estados de la navegación (hover, presionado y
 * foco en rdbu-10). Desde el 2026-11-05 ya no usa el botón azul lleno: ese
 * estilo es el del botón principal, y volver no es la acción principal de la
 * página.
 *
 * Vuelve a la página anterior si hay historial; si no, navega al href dado.
 * Es un <button> porque la acción normal no es ir a una URL fija.
 */
export function BotonVolver({
  href = "/",
  label = "Volver",
}: {
  href?: string;
  label?: string;
}) {
  const router = useRouter();

  function volver() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(href);
    }
  }

  return (
    <BotonTexto onClick={volver} className="-ml-xxs gap-xxs self-start">
      <Icon nombre="arrow_back" size={20} />
      {label}
    </BotonTexto>
  );
}
