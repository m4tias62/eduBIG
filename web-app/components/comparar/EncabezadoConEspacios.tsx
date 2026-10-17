"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { COLOR_COLEGIO, type Posicion } from "@/lib/viz";
import { MarcadorColegio } from "@/components/viz/basicos";
import { BotonQuitar } from "./BotonQuitar";
import { BuscadorAgregar, EspaciosLibres, type Actual } from "./AgregarColegio";

/**
 * Con un solo colegio: las 4 posiciones a la vista (escritorio). Cada espacio
 * libre abre el buscador para agregar un colegio ahí mismo, igual que la fila
 * de espacios libres cuando ya hay una comparación.
 */
export function EncabezadoConEspacios({
  colegios,
}: {
  colegios: Array<Actual & { nombre: string; referencia: string | null }>;
}) {
  const [abierta, setAbierta] = useState<Posicion | null>(null);
  const ocupadas = new Map(colegios.map((c) => [c.posicion, c]));
  const actuales = colegios.map(({ rbd, posicion }) => ({ rbd, posicion }));

  return (
    <>
      {/* Escritorio: 4 columnas */}
      <div className="hidden lg:block">
        <ul className="-mx-m mt-l grid grid-cols-4 gap-xl border-b border-borde-sutil px-m">
          {([1, 2, 3, 4] as Posicion[]).map((p) => {
            const c = ocupadas.get(p);
            return (
              <li
                key={p}
                className={clsx(
                  "flex flex-col gap-xxs border-t-colegio pb-xs pt-s",
                  c ? COLOR_COLEGIO[p].borde : "border-dashed border-borde-definido"
                )}
              >
                <div className="flex min-h-[48px] items-center gap-xs">
                  <MarcadorColegio posicion={p} libre={!c} />
                  {c ? (
                    <Link
                      href={`/colegio/${c.rbd}`}
                      className="text-sm font-medium text-interaccion-enlace underline hover:text-interaccion-enlace-hover"
                    >
                      <span className="sr-only">Colegio {p}: </span>
                      {c.nombre}
                    </Link>
                  ) : (
                    <span className="text-sm text-texto-secundario">Espacio libre</span>
                  )}
                </div>
                {c ? (
                  <>
                    {c.referencia && <p className="text-xs text-texto-secundario">{c.referencia}</p>}
                    <BotonQuitar rbd={c.rbd} nombre={c.nombre} href="/comparar" />
                  </>
                ) : (
                  <button
                    type="button"
                    aria-expanded={abierta === p}
                    onClick={() => setAbierta(abierta === p ? null : p)}
                    className={clsx(
                      "inline-flex min-h-objetivo-tactil items-center gap-xs self-start rounded-s pr-s text-sm font-medium text-interaccion-enlace underline underline-offset-2 transition-colors hover:bg-info-suave hover:text-interaccion-enlace-hover",
                      abierta === p && "bg-info-suave"
                    )}
                  >
                    <span aria-hidden className="material-symbols-outlined text-[20px] no-underline">
                      add
                    </span>
                    Agregar un colegio
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {abierta && <BuscadorAgregar posicion={abierta} actuales={actuales} onCerrar={() => setAbierta(null)} />}
      </div>

      {/* Móvil: mismos espacios en una fila (máximo 3 colegios) */}
      {colegios.length > 0 && (
        <div className="lg:hidden">
          <EspaciosLibres actuales={actuales} max={3} />
        </div>
      )}
    </>
  );
}
