"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { Curso } from "@/lib/types";
import {
  cursoBienestarPorDefecto,
  cursosBienestarConDato,
  datosIguales,
  resumenDiferencias,
  type ColegioComparado,
} from "@/lib/data/comparacion";
import { CURSO_GLOSA } from "@/lib/data/detalle";
import { MAX_COMPARAR, MAX_COMPARAR_MOVIL } from "@/lib/comparar";
import { EspaciosLibres } from "./AgregarColegio";
import { COLOR_COLEGIO } from "@/lib/viz";
import { Icon } from "@/components/ui/Icon";
import { MarcadorColegio } from "@/components/viz/basicos";
import { Globo } from "@/components/ui/Globo";
import { Interruptor } from "@/components/ui/Interruptor";
import { ChipFiltro } from "@/components/ui/ChipFiltro";
import {
  CeldaAcademico,
  CeldaBienestar,
  CeldaCosto,
  CeldaIdentidad,
  CeldaSeguridad,
  CeldaUniversidad,
  Frase,
  GRUPOS,
  textoReferencia,
  type GrupoId,
} from "./celdas";
import { TablaDatos } from "./TablaDatos";
import { CompartirEnlace } from "./CompartirEnlace";
import { BotonQuitar as Quitar } from "./BotonQuitar";

/**
 * Comparar colegios (oct-2026, diseño en Claude Design).
 * Escritorio: tabla semántica con encabezado fijo y grupos en acordeón.
 * Móvil (< 1024 px): pivoteada a secciones apiladas, máximo 3 colegios.
 * Cada colegio se compara con SUS colegios similares; nunca entre ellos.
 */

type Abiertos = Record<GrupoId, boolean>;
const ABIERTOS_INICIAL: Abiertos = {
  identidad: true,
  seguridad: true,
  bienestar: false,
  academico: false,
  universidad: false,
  costo: false,
};

/** URL sin un colegio, conservando las posiciones (colores) de los demás. */
function urlSin(colegios: ColegioComparado[], rbd: number): string {
  const resto = colegios.filter((c) => c.rbd !== rbd);
  if (!resto.length) return "/comparar";
  const consecutivas = resto.every((c, i) => c.posicion === i + 1);
  return `/comparar?rbd=${resto.map((c) => c.rbd).join(",")}${
    consecutivas ? "" : `&pos=${resto.map((c) => c.posicion).join(",")}`
  }`;
}

export function Comparacion({ colegios }: { colegios: ColegioComparado[] }) {
  const [abiertos, setAbiertos] = useState<Abiertos>(ABIERTOS_INICIAL);
  const [soloCambia, setSoloCambia] = useState(false);
  const [curso, setCurso] = useState<Curso>(() => cursoBienestarPorDefecto(colegios));
  const tablaDatos = useRef<HTMLDetailsElement>(null);

  const movil = colegios.slice(0, MAX_COMPARAR_MOVIL);
  const alternar = (g: GrupoId) => setAbiertos((a) => ({ ...a, [g]: !a[g] }));
  const verTabla = () => {
    if (tablaDatos.current) {
      tablaDatos.current.open = true;
      tablaDatos.current.scrollIntoView({ behavior: "smooth", block: "start" });
      tablaDatos.current.querySelector("summary")?.focus({ preventScroll: true });
    }
  };

  return (
    <>
      {/* Escritorio */}
      <div className="hidden lg:block">
        <EncabezadoColegios colegios={colegios} />
        <EspaciosLibres actuales={colegios.map(({ rbd, posicion }) => ({ rbd, posicion }))} max={MAX_COMPARAR} />
        <Resumen colegios={colegios} />
        <Controles
          colegios={colegios}
          soloCambia={soloCambia}
          setSoloCambia={setSoloCambia}
          verTabla={verTabla}
        />
        <TablaComparar
          colegios={colegios}
          abiertos={abiertos}
          alternar={alternar}
          soloCambia={soloCambia}
          curso={curso}
          setCurso={setCurso}
        />
      </div>

      {/* Móvil y tablet */}
      <div className="lg:hidden">
        <BarraColegios colegios={movil} todos={colegios} />
        <EspaciosLibres actuales={movil.map(({ rbd, posicion }) => ({ rbd, posicion }))} max={MAX_COMPARAR_MOVIL} />
        {colegios.length > movil.length && (
          <p className="mt-s text-2xs text-texto-secundario">
            Estás viendo {movil.length} de {colegios.length} colegios. El cuarto se ve en una pantalla más grande.
          </p>
        )}
        <Resumen colegios={movil} />
        <Controles colegios={movil} soloCambia={soloCambia} setSoloCambia={setSoloCambia} verTabla={verTabla} />
        <SeccionesApiladas
          colegios={movil}
          abiertos={abiertos}
          alternar={alternar}
          soloCambia={soloCambia}
          curso={curso}
          setCurso={setCurso}
        />
      </div>

      <TablaDatos ref={tablaDatos} colegios={colegios} />
      <div className="border-t border-borde-sutil pt-l">
        <CompartirEnlace />
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Encabezados

function Referencia({ colegio }: { colegio: ColegioComparado }) {
  if (colegio.gse.tipo === "ninguno")
    return (
      <p className="flex items-start gap-xxs text-xs text-texto-secundario">
        <Icon nombre="block" size={16} className="mt-[3px]" />
        Sin grupo de comparación publicado: no se compara con colegios similares
      </p>
    );
  if (colegio.gse.tipo === "varia")
    return (
      <div className="text-xs text-texto-secundario">
        Se compara con colegios similares ·{" "}
        <Globo texto={`GSE ${colegio.gse.detalle}.`}>
          <span className="underline decoration-dotted underline-offset-[3px]">GSE varía según curso</span>
        </Globo>
      </div>
    );
  return <p className="text-xs text-texto-secundario">{textoReferencia(colegio)}</p>;
}

/**
 * Escritorio: el encabezado completo va en el flujo de la página y, al pasarlo,
 * aparece una barra compacta FIJA bajo la navegación (64 px). La barra no ocupa
 * espacio en el flujo: así el alto de la página no cambia al hacer scroll (antes
 * el encabezado fijo se encogía, el navegador corregía la posición del scroll y
 * el trackpad quedaba "pegado").
 */
function EncabezadoColegios({ colegios }: { colegios: ColegioComparado[] }) {
  const centinela = useRef<HTMLDivElement>(null);
  const [compacto, setCompacto] = useState(false);
  useEffect(() => {
    const el = centinela.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setCompacto(!e.isIntersecting && e.boundingClientRect.top < 64),
      { rootMargin: "-64px 0px 0px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  // WCAG 2.4.11: con la barra fija visible, el foco de teclado no debe quedar tapado.
  useEffect(() => {
    if (!compacto) return;
    const html = document.documentElement;
    const previo = html.style.scrollPaddingTop;
    html.style.scrollPaddingTop = "8.5rem";
    return () => {
      html.style.scrollPaddingTop = previo;
    };
  }, [compacto]);
  const columnas = { gridTemplateColumns: `repeat(${colegios.length}, minmax(0, 1fr))` };

  return (
    <>
      <section aria-label="Colegios en comparación" className="-mx-m mt-l border-b border-borde-sutil">
        <ul className="grid gap-xl px-m" style={columnas}>
          {colegios.map((c) => (
            <li key={c.rbd} className={clsx("flex flex-col gap-xxs border-t-colegio pb-xs pt-s", COLOR_COLEGIO[c.posicion].borde)}>
              <div className="flex min-h-[48px] items-center gap-xs">
                <MarcadorColegio posicion={c.posicion} />
                <Link
                  href={`/colegio/${c.rbd}`}
                  className="inline-flex min-h-objetivo-tactil min-w-0 items-center text-sm font-medium text-interaccion-enlace underline hover:text-interaccion-enlace-hover"
                >
                  <span>
                    <span className="sr-only">Colegio {c.posicion}: </span>
                    {c.nombre}
                  </span>
                </Link>
              </div>
              <div className="min-h-[66px]">
                <Referencia colegio={c} />
              </div>
              <BotonQuitar colegios={colegios} colegio={c} />
            </li>
          ))}
        </ul>
      </section>
      <div ref={centinela} aria-hidden className="h-px" />

      {compacto && (
        <div className="fixed inset-x-0 top-16 z-30 border-b border-borde-sutil bg-superficie-base">
          <div className="contenedor">
            <ul aria-label="Colegios en comparación (barra fija)" className="-mx-m grid gap-xl px-m" style={columnas}>
              {colegios.map((c) => (
                <li key={c.rbd} className={clsx("flex min-w-0 items-center gap-xs border-t-colegio py-xxs", COLOR_COLEGIO[c.posicion].borde)}>
                  <MarcadorColegio posicion={c.posicion} />
                  <Link
                    href={`/colegio/${c.rbd}`}
                    tabIndex={-1}
                    className="min-w-0 flex-1 truncate text-sm font-medium text-interaccion-enlace underline hover:text-interaccion-enlace-hover"
                  >
                    {c.nombre}
                  </Link>
                  <BotonQuitar colegios={colegios} colegio={c} soloIcono />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

function BotonQuitar({
  colegios,
  colegio,
  soloIcono = false,
}: {
  colegios: ColegioComparado[];
  colegio: ColegioComparado;
  soloIcono?: boolean;
}) {
  return <Quitar rbd={colegio.rbd} nombre={colegio.nombre} href={urlSin(colegios, colegio.rbd)} soloIcono={soloIcono} />;
}

/** Móvil: barra fija con los colegios (marcador + nombre en 2 líneas + Quitar). */
function BarraColegios({ colegios, todos }: { colegios: ColegioComparado[]; todos: ColegioComparado[] }) {
  return (
    <section
      aria-label="Colegios en comparación"
      className="sticky top-0 z-20 -mx-l mt-l border-b border-borde-sutil bg-superficie-base px-l py-xs"
    >
      <ul className="grid gap-s" style={{ gridTemplateColumns: `repeat(${colegios.length}, minmax(0, 1fr))` }}>
        {colegios.map((c) => (
          <li key={c.rbd} className="flex min-w-0 flex-col">
            <div className="flex items-start gap-xs">
              <MarcadorColegio posicion={c.posicion} className="mt-xxs" />
              <Link
                href={`/colegio/${c.rbd}`}
                className="line-clamp-2 min-w-0 text-xs font-medium text-interaccion-enlace underline hover:text-interaccion-enlace-hover"
              >
                <span className="sr-only">Colegio {c.posicion}: </span>
                {c.nombre}
              </Link>
            </div>
            <BotonQuitar colegios={todos} colegio={c} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Resumen y controles

function Resumen({ colegios }: { colegios: ColegioComparado[] }) {
  const hechos = useMemo(() => resumenDiferencias(colegios), [colegios]);
  return (
    <section aria-labelledby={`resumen-${colegios.length}`} className="mt-l rounded-m bg-superficie-elevada p-l">
      <h2 id={`resumen-${colegios.length}`} className="text-md font-bold">
        Lo que más cambia entre estos colegios
      </h2>
      {hechos.length ? (
        <ul className="mt-s flex list-disc flex-col gap-xs pl-l text-sm">
          {hechos.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-s text-sm">
          Coinciden en grupo de comparación, costo y niveles: las diferencias están en los datos de cada grupo.
        </p>
      )}
    </section>
  );
}

function Controles({
  colegios,
  soloCambia,
  setSoloCambia,
  verTabla,
}: {
  colegios: ColegioComparado[];
  soloCambia: boolean;
  setSoloCambia: (v: boolean) => void;
  verTabla: () => void;
}) {
  const ig = datosIguales(colegios);
  const ocultos = [
    ig.dependencia && "dependencia",
    ig.comuna && "comuna",
    ig.niveles && "niveles",
    ig.costo && "costo",
  ].filter(Boolean) as string[];
  const n = colegios.length;
  return (
    <div className="mt-m">
      <div className="flex flex-wrap items-center gap-x-xl gap-y-xs">
        <Interruptor activo={soloCambia} onCambiar={setSoloCambia}>
          Mostrar solo lo que cambia
        </Interruptor>
        <button
          type="button"
          onClick={verTabla}
          className="inline-flex min-h-objetivo-tactil items-center gap-xs text-sm font-medium text-interaccion-enlace underline hover:text-interaccion-enlace-hover"
        >
          <Icon nombre="table_view" size={20} />
          Ver como tabla de datos
        </button>
      </div>
      {soloCambia && (
        <p role="status" className="mt-xxs text-xs text-texto-secundario">
          {ocultos.length
            ? `Se ${ocultos.length === 1 ? "ocultó 1 dato que es igual" : `ocultaron ${ocultos.length} datos que son iguales`} en los ${n} colegios: ${enumerar(ocultos)}. Los datos sin publicar nunca se ocultan.`
            : `No hay datos iguales en los ${n} colegios: no se ocultó nada.`}
        </p>
      )}
    </div>
  );
}

function enumerar(p: string[]): string {
  return p.length <= 1 ? p.join("") : `${p.slice(0, -1).join(", ")} y ${p[p.length - 1]}`;
}

// ---------------------------------------------------------------------------
// Grupos: qué se muestra en cada uno

function gruposVisibles(colegios: ColegioComparado[]) {
  return GRUPOS.filter((g) => g.id !== "universidad" || colegios.some((c) => c.ofreceMedia));
}

/** Texto "Igual en los N (oculto): …" cuando el grupo entero coincide. */
function igualOculto(colegios: ColegioComparado[], g: GrupoId, soloCambia: boolean): string | null {
  if (!soloCambia) return null;
  const ig = datosIguales(colegios);
  const n = colegios.length;
  const c = colegios[0];
  if (g === "costo" && ig.costo) return `Igual en los ${n} (oculto): ${minus(c.frases.Costo)}`;
  if (g === "identidad") {
    const partes = [
      ig.dependencia && `dependencia ${c.dependencia.toLowerCase()}`,
      ig.comuna && `comuna ${c.comuna}`,
      ig.niveles && `niveles ${c.niveles.join(", ").toLowerCase()}`,
    ].filter(Boolean) as string[];
    return partes.length ? `Igual en los ${n} (oculto): ${enumerar(partes)}.` : null;
  }
  return null;
}

function minus(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function grupoCompletoOculto(colegios: ColegioComparado[], g: GrupoId, soloCambia: boolean): boolean {
  if (!soloCambia) return false;
  const ig = datosIguales(colegios);
  if (g === "costo") return ig.costo;
  if (g === "identidad") return ig.dependencia && ig.niveles;
  return false;
}

function LineaOculta({ texto }: { texto: string }) {
  return (
    <p className="flex items-start gap-xs text-sm text-texto-secundario">
      <Icon nombre="equal" size={20} className="mt-[2px]" />
      {texto}
    </p>
  );
}

function ComoLeer({ grupo }: { grupo: (typeof GRUPOS)[number] }) {
  return (
    <div className="text-xs text-texto-secundario">
      <p>
        <strong className="font-medium text-texto-primario">Cómo leer esto:</strong> {grupo.comoLeer}
      </p>
      <p>{grupo.fuente}</p>
    </div>
  );
}

function TituloGrupo({
  grupo,
  abierto,
  alternar,
  idControl,
}: {
  grupo: (typeof GRUPOS)[number];
  abierto: boolean;
  alternar: () => void;
  idControl: string;
}) {
  return (
    <h2 className="text-md">
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls={idControl}
        onClick={alternar}
        className="-ml-xs inline-flex min-h-objetivo-tactil items-center gap-xs rounded-s px-xs font-heading text-md font-bold text-texto-primario transition-colors hover:bg-superficie-elevada"
      >
        <Icon nombre={grupo.icono} size={24} />
        {grupo.titulo}
        <Icon nombre={abierto ? "expand_less" : "expand_more"} size={20} />
      </button>
    </h2>
  );
}

function SelectorCurso({
  cursos,
  curso,
  setCurso,
}: {
  cursos: Curso[];
  curso: Curso;
  setCurso: (c: Curso) => void;
}) {
  if (cursos.length <= 1) return null;
  // Mismo chip de filtro que en Explorar (patrón único del sitio).
  return (
    <div role="group" aria-label="Curso" className="flex flex-wrap items-center gap-xs">
      <span className="mr-xxs text-xs text-texto-secundario">Curso</span>
      {cursos.map((c) => (
        <ChipFiltro key={c} label={CURSO_GLOSA[c]} activo={curso === c} onClick={() => setCurso(c)} />
      ))}
    </div>
  );
}

function Celda({
  colegio,
  grupo,
  curso,
  primero,
  iguales,
}: {
  colegio: ColegioComparado;
  grupo: GrupoId;
  curso: Curso;
  primero: boolean;
  iguales?: ReturnType<typeof datosIguales>;
}) {
  switch (grupo) {
    case "identidad":
      return <CeldaIdentidad colegio={colegio} iguales={iguales} />;
    case "seguridad":
      return <CeldaSeguridad colegio={colegio} />;
    case "bienestar":
      return <CeldaBienestar colegio={colegio} curso={curso} rotular={primero} />;
    case "academico":
      return <CeldaAcademico colegio={colegio} leyenda={primero} />;
    case "universidad":
      return <CeldaUniversidad colegio={colegio} />;
    case "costo":
      return <CeldaCosto colegio={colegio} />;
  }
}

// ---------------------------------------------------------------------------
// Escritorio: tabla semántica

function TablaComparar({
  colegios,
  abiertos,
  alternar,
  soloCambia,
  curso,
  setCurso,
}: {
  colegios: ColegioComparado[];
  abiertos: Abiertos;
  alternar: (g: GrupoId) => void;
  soloCambia: boolean;
  curso: Curso;
  setCurso: (c: Curso) => void;
}) {
  const n = colegios.length;
  const ig = datosIguales(colegios);
  const cursos = cursosBienestarConDato(colegios);
  const celda = "px-m align-top text-left font-normal";

  return (
    <div className="-mx-m mt-l">
      <table className="w-full table-fixed border-separate border-spacing-0">
        <caption className="sr-only">
          Comparación de {n} colegios por grupo de datos. Cada colegio se compara con sus colegios similares, no con
          los otros de la tabla.
        </caption>
        <thead>
          <tr>
            {colegios.map((c) => (
              <th key={c.rbd} id={`col-${c.rbd}`} scope="col" className="h-0 p-0">
                <span className="sr-only">
                  Colegio {c.posicion}: {c.nombre}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        {gruposVisibles(colegios).map((g) => {
          const abierto = abiertos[g.id];
          const idG = `g-${g.id}`;
          const oculto = igualOculto(colegios, g.id, soloCambia);
          const completo = grupoCompletoOculto(colegios, g.id, soloCambia);
          const hdr = (c: ColegioComparado) => `col-${c.rbd} ${idG}`;
          return (
            <tbody key={g.id} id={`cuerpo-${g.id}`}>
              <tr>
                <th id={idG} colSpan={n} scope="rowgroup" className={clsx(celda, "border-t border-borde-sutil pb-xs pt-l")}>
                  <TituloGrupo grupo={g} abierto={abierto} alternar={() => alternar(g.id)} idControl={`cuerpo-${g.id}`} />
                </th>
              </tr>

              {oculto && (
                <tr>
                  <td colSpan={n} headers={idG} className={clsx(celda, "pb-s")}>
                    <LineaOculta texto={oculto} />
                  </td>
                </tr>
              )}

              {g.id === "identidad" && !soloCambia && ig.comuna && (
                <tr>
                  <td colSpan={n} headers={idG} className={clsx(celda, "pb-s text-sm text-texto-secundario")}>
                    {n === 2 ? "Los 2" : `Los ${n}`} están en {colegios[0].comuna}.
                  </td>
                </tr>
              )}

              {!completo && g.id !== "identidad" && (
                <tr>
                  {colegios.map((c) => (
                    <td key={c.rbd} headers={hdr(c)} className={clsx(celda, abierto ? "pb-s" : "pb-l")}>
                      <Frase colegio={c} grupo={g.id} />
                    </td>
                  ))}
                </tr>
              )}

              {abierto && !completo && (
                <>
                  {g.id === "bienestar" && cursos.length > 1 && (
                    <tr>
                      <td colSpan={n} headers={idG} className={clsx(celda, "pb-m")}>
                        <SelectorCurso cursos={cursos} curso={curso} setCurso={setCurso} />
                      </td>
                    </tr>
                  )}
                  <tr>
                    {colegios.map((c, i) => (
                      <td key={c.rbd} headers={hdr(c)} className={clsx(celda, "pb-l pt-xxs")}>
                        <Celda colegio={c} grupo={g.id} curso={curso} primero={i === 0} iguales={soloCambia ? ig : undefined} />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td colSpan={n} headers={idG} className={clsx(celda, "pb-l pt-xs")}>
                      <ComoLeer grupo={g} />
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Móvil: secciones apiladas, escalas alineadas en vertical

function SeccionesApiladas({
  colegios,
  abiertos,
  alternar,
  soloCambia,
  curso,
  setCurso,
}: {
  colegios: ColegioComparado[];
  abiertos: Abiertos;
  alternar: (g: GrupoId) => void;
  soloCambia: boolean;
  curso: Curso;
  setCurso: (c: Curso) => void;
}) {
  const ig = datosIguales(colegios);
  const cursos = cursosBienestarConDato(colegios);
  const n = colegios.length;

  return (
    <div className="mt-l">
      {gruposVisibles(colegios).map((g) => {
        const abierto = abiertos[g.id];
        const oculto = igualOculto(colegios, g.id, soloCambia);
        const completo = grupoCompletoOculto(colegios, g.id, soloCambia);
        const idCuerpo = `movil-${g.id}`;
        const conReferencia = g.id === "bienestar" || g.id === "academico" || g.id === "universidad";
        return (
          <section key={g.id} aria-labelledby={`${idCuerpo}-t`} className="border-t border-borde-sutil py-l">
            <div id={`${idCuerpo}-t`}>
              <TituloGrupo grupo={g} abierto={abierto} alternar={() => alternar(g.id)} idControl={idCuerpo} />
            </div>
            <div id={idCuerpo} className="mt-s flex flex-col">
              {oculto && <LineaOculta texto={oculto} />}
              {g.id === "identidad" && !soloCambia && ig.comuna && (
                <p className="text-sm text-texto-secundario">
                  Los {n} están en {colegios[0].comuna}.
                </p>
              )}
              {abierto && g.id === "bienestar" && !completo && cursos.length > 1 && (
                <div className="mt-s">
                  <SelectorCurso cursos={cursos} curso={curso} setCurso={setCurso} />
                </div>
              )}
              {!completo &&
                colegios.map((c, i) => {
                  const ref = conReferencia
                    ? textoReferencia(c, g.id === "bienestar" ? curso : g.id === "universidad" ? "2m" : undefined)
                    : null;
                  return (
                    <Fragment key={c.rbd}>
                      <div className={clsx("flex flex-col gap-s", abierto ? "py-l" : "py-s", i > 0 && "border-t border-borde-sutil")}>
                        <h3 className={clsx("flex items-center gap-xs", abierto ? "text-sm font-bold" : "text-xs font-medium text-texto-secundario")}>
                          <MarcadorColegio posicion={c.posicion} />
                          <span className="font-body">{c.nombre}</span>
                        </h3>
                        {abierto && ref && <p className="-mt-xs text-xs text-texto-secundario">{ref}</p>}
                        {g.id !== "identidad" && <Frase colegio={c} grupo={g.id} />}
                        {abierto && (
                          <Celda colegio={c} grupo={g.id} curso={curso} primero={i === 0} iguales={soloCambia ? ig : undefined} />
                        )}
                      </div>
                    </Fragment>
                  );
                })}
              {abierto && !completo && (
                <div className="pt-xs">
                  <ComoLeer grupo={g} />
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
