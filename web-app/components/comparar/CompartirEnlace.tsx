"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

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
    <button
      type="button"
      onClick={compartir}
      className="mt-m min-h-[44px] self-center inline-flex items-center gap-xs text-xs font-bold text-interaccion-enlace hover:text-interaccion-enlace-hover"
    >
      <Icon nombre="share" size={18} />
      {copiado ? "Enlace copiado" : texto}
    </button>
  );
}
