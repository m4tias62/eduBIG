"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cargarDatosNacionales } from "@/lib/data/cliente";
import { RETICULA_LG } from "@/components/platform/reticula";

/**
 * "Traduciendo tus respuestas" — pantalla intermedia antes de la shortlist.
 * Mientras se muestra, se precarga el índice nacional que usa el motor.
 */
function LoadingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    const destino = qs ? `/test/resultado?${qs}` : "/test/resultado";
    const minimo = new Promise((r) => setTimeout(r, 1500));
    let vivo = true;
    Promise.all([minimo, cargarDatosNacionales().catch(() => null)]).then(() => {
      if (vivo) router.replace(destino);
    });
    return () => {
      vivo = false;
    };
  }, [router, searchParams]);

  return (
    // Misma tarjeta y posición que las preguntas del Test (gris sobre blanco,
    // columnas 1–6 en escritorio): la transición no mueve el contenido.
    <div className="bg-superficie-base lg:pt-xl lg:pb-xxl">
      <div className={RETICULA_LG}>
        <div className="w-full max-w-md min-h-[24rem] flex flex-col justify-center gap-l p-[36px] bg-superficie-base lg:col-span-6 lg:max-w-none lg:rounded-m lg:border lg:border-borde-sutil lg:bg-superficie-elevada">
          <Icon nombre="progress_activity" size={48} className="motion-safe:animate-spin text-interaccion-enlace" />
          <div className="flex flex-col gap-xs" role="status">
            <h1 className="text-lg font-bold text-texto-primario">Traduciendo tus respuestas…</h1>
            <p className="text-sm text-texto-secundario">
              Estamos comparando tus prioridades con los colegios de tu zona.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <Suspense fallback={null}>
      <LoadingInner />
    </Suspense>
  );
}
