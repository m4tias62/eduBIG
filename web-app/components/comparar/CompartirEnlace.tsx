"use client";

import { useState } from "react";
import { AccionEnlace } from "@/components/ui/Enlace";

export function CompartirEnlace({ texto = "Compartir esta comparación" }: { texto?: string }) {
  const [copiado, setCopiado] = useState(false);
  async function compartir() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Comparación de colegios · Edubig", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      /* cancelado */
    }
  }
  return (
    <AccionEnlace icono="share" onClick={compartir} className="-ml-xxs mt-m self-start">
      {copiado ? "Enlace copiado" : texto}
    </AccionEnlace>
  );
}
