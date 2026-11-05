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
 * - v3.1 (Matías, 2026-11-05): versión «oficial» rediseñada por Matías
 *   (Figma «Imagenes», 915:19168). Venían a 1.657–1.764 × 1.632 px con fondo
 *   blanco; el fondo se volvió transparente (relleno desde los bordes y en los
 *   huecos de fondo encerrados de Comparar) para que funcionen sobre el gris
 *   de la sección.
 * - Tamaño: todas a 208 px de alto, así los títulos de las tarjetas quedan a
 *   la misma altura (el ancho varía entre 211 y 225 px según el dibujo).
 * - Nitidez: cada archivo viene ya reducido al tamaño exacto en pantalla
 *   para 1x, 2x y 3x (<nombre>-208/416/624.png) y el navegador elige con
 *   srcset. Así no hay un segundo reescalado que difumine el pixel art.
 * - Accesibilidad: son decorativas; el texto que las acompaña dice lo mismo,
 *   por eso van con alt="" (WCAG 1.1.1).
 * - Regla para cuando vuelvan a las secciones (Matías, 2026-10-14): van AL
 *   LADO del contenido, nunca dentro de una tarjeta, y solo en escritorio.
 *   Para eso queda lista <IlustracionLateral> (hoy sin uso).
 */
export type NombreIlustracion = "recomendar" | "explorar" | "comparar";

const ANCHO_208: Record<NombreIlustracion, number> = { recomendar: 225, explorar: 221, comparar: 211 };

export function Ilustracion({
  nombre,
  priority = false,
  className,
}: {
  nombre: NombreIlustracion;
  priority?: boolean;
  className?: string;
}) {
  const base = `/ilustraciones/${nombre}`;
  return (
    // <img> y no next/image: los archivos ya vienen al tamaño exacto para cada
    // densidad de pantalla, y next/image los volvería a reescalar.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${base}-208.png`}
      srcSet={`${base}-208.png 1x, ${base}-416.png 2x, ${base}-624.png 3x`}
      alt=""
      width={ANCHO_208[nombre]}
      height={208}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("h-[208px] w-auto max-w-none shrink-0 select-none", className)}
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
      <Ilustracion nombre={nombre} priority />
    </div>
  );
}
