"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

/**
 * Loading — pantalla intermedia entre el fin del quiz y el Shortlist.
 * Espejo del frame Figma "Loading — Traducción".
 *
 * El motor corre en milisegundos (57 colegios), pero el delay artificial
 * (1.5s) da percepción de trabajo y evita disonancia de "¿ya calculó?".
 *
 * Suspense envuelve el hook useSearchParams para cumplir con el requisito
 * de Next 14 (evitar CSR bailout durante la generación estática).
 */
function LoadingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    const timer = setTimeout(() => {
      router.push(qs ? `/test/resultado?${qs}` : "/test/resultado");
    }, 1500);
    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="mx-auto w-full max-w-md min-h-screen flex flex-col items-center justify-center gap-l p-[36px] text-center bg-superficie-base">
      <Icon nombre="progress_activity" size={48} className="animate-spin text-interaccion-enlace" />
      <div className="flex flex-col gap-xs">
        <h1 className="text-lg font-bold text-texto-primario">
          Traduciendo tus respuestas...
        </h1>
        <p className="text-sm text-texto-secundario">
          Estamos comparando tus prioridades con los colegios de tu comuna.
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
