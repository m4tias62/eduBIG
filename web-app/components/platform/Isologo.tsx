import Image from "next/image";

/**
 * Isologotipo Edubig — PNG oficial (public/isologo-edubig.png, 1076×621, RGBA).
 * Marca ago-2026: dos cápsulas superpuestas — azul (rdbu-02, "011" en tipo
 * pixel) + coral (rdbu-09, "eB" en serif). Fondo transparente para servir
 * sobre cualquier superficie (hero oscuro, cabecera clara, footer).
 *
 * Se sirve vía next/image para optimización automática (WebP/AVIF en
 * navegadores compatibles, lazy load, priorización opcional).
 *
 * `width` es el tamaño renderizado; el alto se calcula manteniendo la
 * proporción original (503/802). Uso típico:
 *   - Footer: <Isologo /> (66px, default)
 *   - Cabecera post-quiz: <Isologo width={88} />
 */
const RATIO_ALTO = 621 / 1076;

export default function Isologo({
  width = 66,
  className,
  priority = false,
}: {
  width?: number;
  className?: string;
  priority?: boolean;
}) {
  const height = Math.round(width * RATIO_ALTO);
  return (
    <Image
      src="/isologo-edubig.png"
      alt="Edubig"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
