import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Ilustraciones de las tres promesas de Edubig (D31): recomendar, explorar y
 * comparar. Por ahora solo se usan en la Home (decisión de Matías,
 * 2026-10-14), hasta tener ilustraciones propias para cada sección.
 *
 * - v3 (2026-11-04): pixel art, generadas con IA (Nano Banana) bajo la
 *   dirección de Matías, para seguir el detalle pixelado del isologo. Las
 *   anteriores (dibujadas por Matías, 2026-10-14) quedan en la etiqueta
 *   nacional-v2.
 * - Paleta: la escala RdBu del sistema más la tinta gris de los trazos. Son
 *   identidad, no codifican datos.
 * - Archivos: public/ilustraciones/<nombre>.png, 538 × 509 con fondo
 *   transparente, todas con el mismo encuadre para que se vean del mismo
 *   tamaño. next/image las sirve en WebP/AVIF al ancho que se necesita.
 * - Accesibilidad: son decorativas; el texto que las acompaña dice lo mismo,
 *   por eso van con alt="" (WCAG 1.1.1).
 * - Regla para cuando vuelvan a las secciones (Matías, 2026-10-14): van AL
 *   LADO del contenido, nunca dentro de una tarjeta, y solo en escritorio.
 *   Para eso queda lista <IlustracionLateral> (hoy sin uso).
 */
export type NombreIlustracion = "recomendar" | "explorar" | "comparar";

export function Ilustracion({
  nombre,
  sizes,
  priority = false,
  className,
}: {
  nombre: NombreIlustracion;
  /** Ancho con que se muestra, para que next/image elija el archivo justo. */
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={`/ilustraciones/${nombre}.png`}
      alt=""
      width={538}
      height={509}
      sizes={sizes}
      priority={priority}
      className={cn("h-auto shrink-0 select-none", className)}
    />
  );
}

/**
 * Ilustración al lado del contenido de una sección, solo en escritorio.
 * Va como hija de una retícula de 12 columnas cuyo contenido ocupa las
 * columnas 1–6: la ilustración toma las 8–12, a la misma altura y del mismo
 * tamaño en todas las secciones. En móvil y tablet no se muestra (no cabe).
 */
export function IlustracionLateral({ nombre }: { nombre: NombreIlustracion }) {
  return (
    <div className="hidden lg:block lg:col-span-5 lg:col-start-8 lg:pt-xxl">
      <Ilustracion nombre={nombre} sizes="288px" priority className="w-72" />
    </div>
  );
}
