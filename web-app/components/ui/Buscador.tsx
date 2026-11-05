"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

/**
 * Buscador por nombre (v3, Figma «Buscador», nodo 834:584). Estados:
 * - Reposo: borde de 1 px en rdbu-01, lupa a la izquierda.
 * - Hover: fondo rdbu-05.
 * - Foco: contorno exterior de 2 px en rdbu-10.
 * - Con texto: botón para borrar (×) y la lupa a la derecha.
 *
 * Busca mientras se escribe, con una pausa de 350 ms para no recalcular en
 * cada letra. El texto va en 16 px: en iOS, un campo más chico obliga a hacer
 * zoom al tocarlo.
 */
export function Buscador({
  id,
  valorInicial,
  onBuscar,
  placeholder,
  className,
}: {
  id: string;
  valorInicial: string;
  onBuscar: (q: string) => void;
  placeholder: string;
  className?: string;
}) {
  const [valor, setValor] = useState(valorInicial);
  const entrada = useRef<HTMLInputElement>(null);
  const primer = useRef(true);

  useEffect(() => setValor(valorInicial), [valorInicial]);
  useEffect(() => {
    if (primer.current) {
      primer.current = false;
      return;
    }
    const t = setTimeout(() => {
      if (valor.trim() !== valorInicial) onBuscar(valor.trim());
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  const conTexto = valor.length > 0;

  return (
    <div
      className={cn(
        "flex min-h-12 items-center gap-xs rounded-s border border-rdbu-01 bg-superficie-base px-s transition-colors hover:bg-rdbu-05",
        "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-rdbu-10",
        className
      )}
    >
      {!conTexto && <Icon nombre="search" size={24} className="text-texto-primario" />}
      <input
        ref={entrada}
        id={id}
        type="search"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-sm text-texto-primario placeholder:text-texto-secundario outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:appearance-none"
      />
      {conTexto && (
        <>
          <button
            type="button"
            onClick={() => {
              setValor("");
              onBuscar("");
              entrada.current?.focus();
            }}
            aria-label="Borrar búsqueda"
            className="inline-flex min-h-objetivo-tactil min-w-objetivo-tactil items-center justify-center rounded-s text-texto-primario hover:text-rdbu-10"
          >
            <Icon nombre="close" size={24} />
          </button>
          <Icon nombre="search" size={24} className="text-texto-primario" />
        </>
      )}
    </div>
  );
}
