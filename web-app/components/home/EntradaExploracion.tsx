"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { SelectorUbicacion } from "@/components/ubicacion/SelectorUbicacion";
import { Icon } from "@/components/ui/Icon";
import { urlExplorar } from "@/lib/home/filtros";

/**
 * "o explora por tu cuenta" (D31, D34): las mismas dos opciones de ubicación
 * que el Test, más la búsqueda por nombre, que no pide ubicación.
 */
export function EntradaExploracion({ tarjeta = false }: { tarjeta?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const id = useId();
  const idTitulo = `${id}-titulo`;
  const idBuscar = `${id}-buscar`;

  return (
    <section
      className={cn(
        "bg-superficie-base text-texto-primario",
        tarjeta ? "rounded-l p-xl shadow-lg" : "px-l py-xl"
      )}
      aria-labelledby={idTitulo}
    >
      <div className={cn("flex flex-col gap-l", !tarjeta && "max-w-md mx-auto")}>
        <div className="flex flex-col gap-xs">
          <p className="text-2xs font-bold uppercase tracking-wide text-texto-secundario">
            O explora por tu cuenta
          </p>
          <h2 id={idTitulo} className="text-md font-bold text-texto-primario">
            ¿Dónde buscas colegio?
          </h2>
        </div>

        <SelectorUbicacion
          variante="secundaria"
          onListo={(u) =>
            router.push(
              u.tipo === "gps"
                ? urlExplorar({ vista: "lista", desdeGps: true, distanciaMaxKm: 3 })
                : urlExplorar({ vista: "lista", comuna: u.cod })
            )
          }
        />

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const t = q.trim();
            if (t) router.push(urlExplorar({ vista: "lista", q: t }));
          }}
          className="flex flex-col gap-xs"
        >
          <label htmlFor={idBuscar} className="text-xs font-bold text-texto-primario">
            ¿Ya sabes cuál? Búscalo por su nombre
          </label>
          <div className="flex gap-xs">
            <input
              id={idBuscar}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ej.: Liceo Ciudad de Brasilia"
              className="min-h-[44px] flex-1 rounded-m border border-borde-definido bg-superficie-base px-m text-sm text-texto-primario placeholder:text-texto-secundario focus:border-interaccion-foco"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-m border-2 border-interaccion-enlace text-interaccion-enlace hover:bg-info-suave"
            >
              <Icon nombre="search" size={22} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
