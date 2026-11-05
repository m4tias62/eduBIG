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
 * - Pixel art real (2026-11-05): a pedido de Matías («quiero que se vean
 *   como pixel art que son»). Cada píxel del dibujo medía unos 12 px del
 *   archivo; al achicarlo a unos 200 px quedaba en 1,5 px de pantalla y se
 *   veía como una imagen de baja calidad. Se reconstruyó la grilla del dibujo
 *   (un color por celda, recortado al contenido): cada archivo queda a su
 *   tamaño real, unos 120 × 120 píxeles (4–6 KB), y se muestra al doble
 *   exacto con `image-rendering: pixelated`: cada píxel del dibujo ocupa 2 × 2
 *   px de pantalla (4 × 4 en pantallas retina), con bordes nítidos.
 * - Accesibilidad: son decorativas; el texto que las acompaña dice lo mismo,
 *   por eso van con alt="" (WCAG 1.1.1).
 * - Regla para cuando vuelvan a las secciones (Matías, 2026-10-14): van AL
 *   LADO del contenido, nunca dentro de una tarjeta, y solo en escritorio.
 *   Para eso queda lista <IlustracionLateral> (hoy sin uso).
 */
export type NombreIlustracion = "recomendar" | "explorar" | "comparar";

/** Tamaño real de cada dibujo, en píxeles del dibujo. */
const TAMANO: Record<NombreIlustracion, [number, number]> = {
  recomendar: [120, 121],
  explorar: [121, 119],
  comparar: [127, 113],
};

/** Alto máximo con la escala por defecto: sirve para alinear varias ilustraciones. */
export const ALTO_ILUSTRACION = 121 * 2;

export function Ilustracion({
  nombre,
  escala = 2,
  priority = false,
  className,
}: {
  nombre: NombreIlustracion;
  /** Píxeles de pantalla por píxel del dibujo; siempre entero, para que se vea nítido. */
  escala?: 2 | 3 | 4;
  priority?: boolean;
  className?: string;
}) {
  const [ancho, alto] = TAMANO[nombre];
  return (
    // <img> y no next/image: next/image reescalaría el archivo y suavizaría
    // los bordes del pixel art.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/ilustraciones/${nombre}.png`}
      alt=""
      width={ancho * escala}
      height={alto * escala}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("max-w-none shrink-0 select-none [image-rendering:pixelated]", className)}
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
