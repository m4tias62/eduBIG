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
 *   blanco; el fondo se volvió transparente.
 * - Versión en alta resolución (Matías, 2026-11-05): primero se probó
 *   reconstruir la grilla de píxeles (un color por celda); a Matías no le
 *   gustó el resultado y entregó las ilustraciones en mayor resolución
 *   (1.829–1.946 × 1.800–1.806 px). Se les quitó el fondo blanco (también los
 *   huecos de fondo encerrados de Comparar), se recortaron al dibujo y se
 *   redujeron con alta calidad al tamaño exacto en pantalla para 1x, 2x y 3x
 *   (WebP calidad 92, 18–80 KB). El navegador elige con srcset, sin un
 *   segundo reescalado que difumine los bordes.
 * - Tamaño en pantalla (aprobado por Matías): unos 240 px de alto.
 * - Accesibilidad: son decorativas; el texto que las acompaña dice lo mismo,
 *   por eso van con alt="" (WCAG 1.1.1).
 * - Regla para cuando vuelvan a las secciones (Matías, 2026-10-14): van AL
 *   LADO del contenido, nunca dentro de una tarjeta, y solo en escritorio.
 *   Para eso queda lista <IlustracionLateral> (hoy sin uso).
 */
export type NombreIlustracion = "recomendar" | "explorar" | "comparar";

/** Tamaño en pantalla (px CSS) de cada ilustración; los archivos @2x y @3x lo multiplican. */
const TAMANO: Record<NombreIlustracion, [number, number]> = {
  recomendar: [241, 242],
  explorar: [242, 238],
  comparar: [255, 226],
};

/** Alto de la ilustración más alta: sirve para alinear varias ilustraciones. */
export const ALTO_ILUSTRACION = 242;

export function Ilustracion({
  nombre,
  priority = false,
  className,
}: {
  nombre: NombreIlustracion;
  priority?: boolean;
  className?: string;
}) {
  const [ancho, alto] = TAMANO[nombre];
  const base = `/ilustraciones/${nombre}`;
  return (
    // <img> y no next/image: los archivos ya vienen al tamaño exacto para cada
    // densidad de pantalla, y next/image los volvería a reescalar.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${base}@1x.webp`}
      srcSet={`${base}@1x.webp 1x, ${base}@2x.webp 2x, ${base}@3x.webp 3x`}
      alt=""
      width={ancho}
      height={alto}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("max-w-none shrink-0 select-none", className)}
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
