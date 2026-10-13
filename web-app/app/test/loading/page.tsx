"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cargarDatosNacionales } from "@/lib/data/cliente";

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
    <div className="mx-auto w-full max-w-md min-h-screen flex flex-col items-center justify-center gap-l p-[36px] text-center bg-superficie-base">
      <Icon nombre="progress_activity" size={48} className="animate-spin text-interaccion-enlace" />
      <div className="flex flex-col gap-xs" role="status">
        <h1 className="text-lg font-bold text-texto-primario">Traduciendo tus respuestas…</h1>
        <p className="text-sm text-texto-secundario">
          Estamos comparando tus prioridades con los colegios de tu zona.
        </p>
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
