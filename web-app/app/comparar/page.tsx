import type { Metadata } from "next";
import Link from "next/link";
import { getDetalle } from "@/lib/data/servidor";
import { dependenciaGlosa, nivelesGlosa } from "@/lib/data/formatters";
import { FILAS_ESENCIAL } from "@/components/ficha/LoEsencial";
import { BotonVolver } from "@/components/ficha/BotonVolver";
import { SincronizarComparacion } from "@/components/comparar/SincronizarComparacion";
import { CompartirEnlace } from "@/components/comparar/CompartirEnlace";
import { Icon } from "@/components/ui/Icon";
import type { DetalleColegio } from "@/lib/types";

/**
 * Comparación mínima (D32): hasta 3 colegios en móvil y 4 en escritorio, lado a lado en la fila
 * "Lo esencial", reutilizando las conclusiones de la capa de traducción.
 * La URL /comparar?rbd=… se puede compartir. Los acordeones por dimensión
 * y "Solo diferencias" quedan para después.
 */
export const metadata: Metadata = { title: "Comparar colegios — Edubig" };

function parseRbds(v: string | string[] | undefined): number[] {
  const s = Array.isArray(v) ? v[0] : v;
  if (!s) return [];
  return Array.from(new Set(s.split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0))).slice(0, 4);
}

export default function Comparar({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const rbds = parseRbds(searchParams.rbd);
  const colegios = rbds.map(getDetalle).filter((d): d is DetalleColegio => d !== null);
  const sinUrl = (rbd: number) => {
    const resto = colegios.map((c) => c.rbd).filter((r) => r !== rbd);
    return resto.length ? `/comparar?rbd=${resto.join(",")}` : "/comparar";
  };
  const filas = FILAS_ESENCIAL.filter((f) => colegios.some((c) => c.traduccion.lo_esencial[f.clave]));
  // Móvil muestra hasta 3 columnas; el 4.º colegio solo se ve en escritorio.
  const n = colegios.length;
  const cols =
    n >= 4 ? "grid-cols-3 lg:grid-cols-4" : n === 3 ? "grid-cols-3" : n === 2 ? "grid-cols-2" : "grid-cols-1";
  const celda = (i: number, display: "block" | "flex" = "block") =>
    i >= 3 ? (display === "flex" ? "hidden lg:flex" : "hidden lg:block") : "";

  return (
    <>
      <SincronizarComparacion rbds={colegios.map((c) => c.rbd)} />
      <div className="contenedor flex flex-col gap-l pt-l pb-xl lg:pt-xl lg:pb-xxl">
        <BotonVolver href="/" />
        <div className="flex flex-col gap-xs ancho-8-col">
          <h1 className="text-lg font-bold text-texto-primario">Comparar colegios</h1>
          <p className="text-xs text-texto-secundario">
            Cada frase compara al colegio con colegios similares (mismo grupo socioeconómico), no con
            los otros de esta tabla.
          </p>
        </div>

        {colegios.length < 2 ? (
          <div className="rounded-m border border-borde-sutil bg-superficie-elevada p-l flex flex-col gap-s ancho-8-col">
            <p className="text-sm font-bold text-texto-primario">
              {colegios.length === 0 ? "Aún no eliges colegios para comparar." : "Elige al menos un colegio más."}
            </p>
            <p className="text-xs text-texto-secundario">
              Agrega hasta 3 en el celular, o 4 en un computador, desde la ficha de cada colegio
              («Agregar a comparar») o desde tu lista del Test de Calce.
            </p>
            <Link
              href="/explorar"
              className="min-h-[44px] self-start inline-flex items-center rounded-s bg-interaccion-enlace px-l py-xs text-xs font-bold text-texto-sobre-oscuro hover:bg-interaccion-enlace-hover"
            >
              Explorar colegios
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            {n >= 4 && (
              <p className="mb-s text-2xs text-texto-secundario lg:hidden">
                Estás viendo 3 de {n} colegios. El cuarto se ve en una pantalla más grande.
              </p>
            )}
            {/* Encabezado fijo con los nombres (bajo la barra de navegación en escritorio) */}
            <div className={`sticky top-0 lg:top-16 z-10 grid ${cols} gap-xs lg:gap-xl bg-superficie-base py-s border-b-2 border-texto-primario`}>
              {colegios.map((c, i) => (
                <div key={c.rbd} className={`flex flex-col gap-xxs ${celda(i, "flex")}`}>
                  <Link href={`/colegio/${c.rbd}`} className="text-xs font-bold text-interaccion-enlace underline hover:text-interaccion-enlace-hover lg:text-sm [overflow-wrap:anywhere]">
                    {c.nombre}
                  </Link>
                  <Link
                    href={sinUrl(c.rbd)}
                    className="min-h-[32px] inline-flex items-center gap-xxs text-2xs text-texto-secundario hover:text-texto-primario"
                    aria-label={`Quitar ${c.nombre} de la comparación`}
                  >
                    <Icon nombre="close" size={14} />
                    Quitar
                  </Link>
                </div>
              ))}
            </div>

            <Fila titulo="Identidad" icono="badge" cols={cols}>
              {colegios.map((c, i) => (
                <p key={c.rbd} className={`text-2xs text-texto-primario lg:text-xs [overflow-wrap:anywhere] ${celda(i)}`}>
                  {dependenciaGlosa(c.dependencia_cod)} · {nivelesGlosa(c.ofrece_basica, c.ofrece_media, c.ofrece_especial)} · {c.comuna}
                </p>
              ))}
            </Fila>

            {filas.map((f) => (
              <Fila key={f.clave} titulo={f.label} icono={f.icono} cols={cols}>
                {colegios.map((c, i) => (
                  <p key={c.rbd} className={`text-2xs text-texto-primario lg:text-xs [overflow-wrap:anywhere] ${celda(i)}`}>
                    {c.traduccion.lo_esencial[f.clave] ?? <span className="italic text-texto-secundario">No aplica (sin educación media)</span>}
                  </p>
                ))}
              </Fila>
            ))}

            <CompartirEnlace />
          </div>
        )}
      </div>
    </>
  );
}

function Fila({
  titulo,
  icono,
  cols,
  children,
}: {
  titulo: string;
  icono: string;
  cols: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-xs border-b border-borde-sutil py-m">
      <h2 className="inline-flex items-center gap-xs text-xs font-bold text-texto-primario">
        <Icon nombre={icono} size={18} />
        {titulo}
      </h2>
      <div className={`grid ${cols} gap-xs lg:gap-xl`}>{children}</div>
    </section>
  );
}
