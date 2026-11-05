import Isologo from "@/components/platform/Isologo";
import { BotonEnlace } from "@/components/ui/Boton";
import { VideoFondo } from "@/components/home/VideoFondo";

/**
 * Hero de la Home, v3 (rediseño nov-2026, Figma «Rediseño del hero», nodo
 * 845:1303).
 *
 * Capas, de atrás hacia adelante:
 *   1. Degradado vertical rdbu-01 (frío) → rdbu-10 (cálido extremo).
 *   2. Animación en pixel art de una sala de clases, en bucle, al 16 %.
 *   3. Mensaje, bajada y las dos acciones.
 *   4. Borde inferior pixelado que se deshace hacia la sección siguiente.
 *
 * Decisiones de Matías (2026-11-04):
 * - El pixel art sigue el detalle pixelado del isologo y se asocia con el
 *   dato. El logo se mantiene como estaba.
 * - En escritorio el contenido parte a 48 px del borde, fuera de la
 *   retícula, a propósito. Las demás páginas mantienen la retícula (D38).
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
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.16] [image-rendering:pixelated]"
      />

      <div className="relative z-10 px-l pb-[96px] pt-xl lg:min-h-[649px] lg:px-xxl lg:pb-[108px] lg:pt-[93px]">
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

      <BordePixelado className={colorBorde} />
    </section>
  );
}

/**
 * Borde inferior pixelado: cinco filas de cuadrados de 12 px que se van
 * llenando hacia abajo (10 %, 30 %, 55 %, 80 % y 100 %), como el tramado
 * (dithering) del pixel art. El patrón es fijo —cada cuadro se decide con
 * un hash de su posición— y se repite cada 384 px. Usa `currentColor`, así
 * toma el color de `className`.
 */
const LADO = 12;
const COLUMNAS = 32;
const DENSIDAD = [0.1, 0.3, 0.55, 0.8, 1];

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
