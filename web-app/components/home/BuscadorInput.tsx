"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import type { FiltrosHome } from "@/lib/home/filtros";

/**
 * Buscador funcional (browse mode). Input controlado que actualiza ?q= en la
 * URL con debounce (300ms), preservando el resto de filtros y la vista.
 * El filtrado por `q` ocurre server-side (ver lib/home/filtros → pasaFiltros:
 * matchea nombre del colegio o comuna).
 */
export function BuscadorInput({
  vista,
  filtros,
}: {
  vista: "lista" | "mapa";
  filtros: FiltrosHome;
}) {
  const router = useRouter();
  const [valor, setValor] = useState(filtros.q ?? "");
  const primerRender = useRef(true);

  // Si `q` cambia desde afuera (p. ej. al limpiar filtros), sincroniza el input.
  useEffect(() => {
    setValor(filtros.q ?? "");
  }, [filtros.q]);

  // Debounce: actualiza la URL 300ms después de dejar de escribir.
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    const id = setTimeout(() => {
      const p = new URLSearchParams();
      const q = valor.trim();
      if (q) p.set("q", q);
      if (filtros.gratuito) p.set("gratuito", "1");
      if (filtros.nivel) p.set("nivel", filtros.nivel);
      if (filtros.distanciaMaxKm !== undefined) p.set("dist", String(filtros.distanciaMaxKm));
      if (filtros.dependencias && filtros.dependencias.length)
        p.set("dep", filtros.dependencias.join(","));
      p.set("vista", vista);
      router.replace(`/?${p.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(id);
    // Solo re-dispara al cambiar el texto; los filtros se leen del closure actual.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  return (
    <div className="flex items-center gap-xs rounded-s bg-superficie-elevada border border-borde-definido px-m py-xs focus-within:border-texto-primario transition-colors">
      <Icon nombre="search" size={20} className="text-texto-secundario" />
      <input
        type="search"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="Buscar colegio o comuna"
        aria-label="Buscar colegio o comuna"
        className="w-full bg-transparent text-xs text-texto-primario placeholder:text-texto-secundario outline-none"
      />
    </div>
  );
}
