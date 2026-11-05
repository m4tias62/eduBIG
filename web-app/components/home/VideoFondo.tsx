"use client";

import { useEffect, useRef } from "react";

/**
 * Animación de fondo del hero (v3): pixel art en bucle, decorativa.
 *
 * - Se comporta como un GIF: sin controles, silenciada y en bucle. Un
 *   <video> pesa mucho menos que un GIF equivalente.
 * - Va oculta para tecnologías de asistencia (aria-hidden) y fuera del orden
 *   de tabulación.
 * - Con «reducir movimiento» activado (prefers-reduced-motion) no se
 *   reproduce: se muestra la imagen fija (`imagenFija`) en su lugar.
 * - `muted` se fija también por código porque React no siempre escribe el
 *   atributo, y sin él Safari en iOS no permite la reproducción automática.
 */
export function VideoFondo({
  src,
  imagenFija,
  className,
}: {
  src: string;
  imagenFija: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)");
    const aplicar = () => {
      if (reducir.matches) video.pause();
      else video.play().catch(() => {});
    };
    aplicar();
    reducir.addEventListener("change", aplicar);
    return () => reducir.removeEventListener("change", aplicar);
  }, []);

  return (
    <>
      <video
        ref={ref}
        src={src}
        aria-hidden
        tabIndex={-1}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className={`${className ?? ""} motion-reduce:hidden`}
      />
      <div
        aria-hidden
        className={`${className ?? ""} hidden bg-cover bg-center motion-reduce:block`}
        style={{ backgroundImage: `url(${imagenFija})` }}
      />
    </>
  );
}
