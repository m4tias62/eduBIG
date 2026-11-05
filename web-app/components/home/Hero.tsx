import Isologo from "@/components/platform/Isologo";
import { BotonEnlace } from "@/components/ui/Boton";
import { VideoFondo } from "@/components/home/VideoFondo";

/**
 * Hero de la Home, v3 (rediseño nov-2026, Figma «Rediseño del hero», nodo
 * 845:1303).
 *
 * Capas, de atrás hacia adelante:
 *   1. Degradado vertical rdbu-01 (frío) → rdbu-10 (cálido extremo).
 *   2. Animación en pixel art de una sala de clases, en bucle, al 24 %
 *      (Matías la subió desde 16 % el 2026-11-05).
 *   3. Mensaje, bajada y las dos acciones.
 *   4. Borde inferior pixelado que se deshace hacia la sección siguiente.
 *
 * Decisiones de Matías (2026-11-04):
 * - El pixel art sigue el detalle pixelado del isologo y se asocia con el
 *   dato. El logo se mantiene como estaba.
 * - En escritorio el contenido parte a 48 px del borde, fuera de la
 *   retícula, a propósito. Desde el 2026-11-05 la barra de navegación usa
 *   el mismo margen, para que el logo y el título queden alineados.
 * - El Test es la acción principal y «Comparar colegios» la secundaria.
 *
 * `colorBorde`: clase de color de texto con el fondo de la sección que sigue,
 * para que el borde pixelado se funda con ella.
 */
export function Hero({ colorBorde = "text-superficie-base" }: { colorBorde?: string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-rdbu-01 to-rdbu-10 text-texto-sobre-oscuro">
      <VideoFondo
        src="/hero/aula-pixel.mp4"
        imagenFija="/hero/aula-pixel.webp"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.24] [image-rendering:pixelated]"
      />

      <div className="relative z-10 px-l pb-[80px] pt-xl lg:min-h-[649px] lg:px-xxl lg:pb-[88px] lg:pt-[93px]">
        <div className="flex flex-col gap-m lg:w-[459px]">
          <div className="lg:hidden">
            <Isologo width={66} priority />
          </div>
          <h1 className="text-xl font-bold leading-none lg:text-[3rem]">
            Encuentra el colegio que calza con tu familia
          </h1>
          {/* Borrador (2026-11-04): texto por confirmar con Matías. */}
          <p className="text-sm text-texto-sobre-oscuro-secundario">
            Edubig reúne los datos oficiales de más de 8.000 colegios de Chile —resultados SIMCE, bienestar de
            los estudiantes, denuncias y costos— y los traduce a un lenguaje claro. Cada colegio se compara con
            otros parecidos, nunca en un ranking.
          </p>
          <div className="flex flex-col gap-s sm:flex-row lg:justify-between lg:gap-0">
            <BotonEnlace href="/test" sobreOscuro className="sm:w-[219px]">
              Hacer el Test de Calce
            </BotonEnlace>
            <BotonEnlace href="/comparar" variante="secundario" sobreOscuro className="sm:w-[219px]">
              Comparar colegios
            </BotonEnlace>
          </div>
        </div>
      </div>

      <CreditoAnimacion />
      <BordePixelado className={colorBorde} />
    </section>
  );
}

/**
 * Crédito de la animación de fondo (obra de KiraPixels, publicada en r/Art,
 * 2022). Pequeño, en la esquina inferior derecha, sobre el borde pixelado.
 * El enlace abre la publicación original en otra pestaña.
 */
function CreditoAnimacion() {
  return (
    <p className="absolute bottom-[40px] right-l z-10 text-2xs text-texto-sobre-oscuro lg:right-xxl">
      Animación:{" "}
      <a
        href="https://www.reddit.com/r/Art/comments/u5mste/no_school_today_me_pixel_art_2022/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-[24px] items-center underline underline-offset-2 hover:no-underline focus-visible:outline-texto-sobre-oscuro"
      >
        «No school today», KiraPixels (2022)
        <span className="sr-only"> (se abre en otra pestaña)</span>
      </a>
    </p>
  );
}

/**
 * Borde inferior pixelado: un detalle, no un protagonista. Ajustes de Matías
 * (2026-11-04): la primera versión (12 px, cinco filas) era demasiado
 * llamativa y la segunda (6 px, tres filas al 5-15-35 %) demasiado sutil.
 * Queda en el medio: cuatro filas de cuadrados de 8 px, cada vez más llenas
 * hacia abajo (8 %, 20 %, 42 % y 70 %), como un tramado (dithering). El patrón es
 * fijo —cada cuadro se decide con un hash de su posición— y se repite cada
 * 1.536 px, más que el ancho del diseño, para que no se note la repetición.
 * Usa `currentColor`, así toma el color de `className`.
 */
const LADO = 8;
const COLUMNAS = 192;
const DENSIDAD = [0.08, 0.2, 0.42, 0.7];

function ruido(col: number, fila: number) {
  const s = Math.sin(col * 12.9898 + fila * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

const CUADROS: Array<[number, number]> = DENSIDAD.flatMap((d, fila) =>
  Array.from({ length: COLUMNAS }, (_, col) => col)
    .filter((col) => ruido(col, fila) < d)
    .map((col): [number, number] => [col * LADO, fila * LADO])
);

function BordePixelado({ className }: { className?: string }) {
  const alto = DENSIDAD.length * LADO;
  return (
    <svg
      aria-hidden
      focusable="false"
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 w-full ${className ?? ""}`}
      height={alto}
    >
      <defs>
        <pattern id="hero-borde-pixelado" width={COLUMNAS * LADO} height={alto} patternUnits="userSpaceOnUse">
          {CUADROS.map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={LADO} height={LADO} fill="currentColor" />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height={alto} fill="url(#hero-borde-pixelado)" />
    </svg>
  );
}
