"use client";

import type { Curso } from "@/lib/types";
import {
  MATERIA_GLOSA,
  MATERIAS,
  textoReferenciaGse,
  type ColegioComparado,
  type Iguales,
} from "@/lib/data/comparacion";
import { CURSO_GLOSA } from "@/lib/data/detalle";
import { puntosPct } from "@/lib/data/formatters";
import { plural } from "@/lib/viz";
import { Icon } from "@/components/ui/Icon";
import { ChipNeutro, EstadoDato, EstadoDatoLinea, LeyendaSimilares } from "@/components/viz/basicos";
import { BarraAbsoluta100, BarraProporcion, PistaTramos, PuntosConteo, TiraBrechas } from "@/components/viz/graficos";

/**
 * Contenido de cada celda de la comparación, igual en escritorio (tabla) y
 * móvil (bloques apilados). Cuatro capas: frase → gráfico → dato → aviso.
 */

export type GrupoId = "identidad" | "seguridad" | "bienestar" | "academico" | "universidad" | "costo";

export const GRUPOS: Array<{
  id: GrupoId;
  titulo: string;
  icono: string;
  comoLeer: string;
  fuente: string;
}> = [
  {
    id: "identidad",
    titulo: "Identidad",
    icono: "badge",
    comoLeer: "tipo de colegio (dependencia) y niveles de enseñanza que imparte.",
    fuente: "Fuente: Directorio Oficial de Establecimientos 2025 (Mineduc).",
  },
  {
    id: "seguridad",
    titulo: "Seguridad",
    icono: "shield",
    comoLeer:
      "1 punto = 1 denuncia. Se dibujan hasta 10 por año; el número sobre cada columna es el total real. Una denuncia no es un hecho comprobado: es un reclamo formal ante la Superintendencia.",
    fuente: "Fuente: Superintendencia de Educación · Denuncias 2022–2025.",
  },
  {
    id: "bienestar",
    titulo: "Bienestar",
    icono: "mood",
    comoLeer:
      "la barra es el puntaje del colegio (de 0 a 100) y la línea negra, sus similares. La etiqueta indica si la Agencia marca una diferencia significativa.",
    fuente: "Fuente: Agencia de Calidad de la Educación, IDPS 2025.",
  },
  {
    id: "academico",
    titulo: "Académico",
    icono: "menu_book",
    comoLeer:
      "cada barra es la diferencia con sus similares (línea negra): sube = por sobre ellos, baja = por debajo. Escala común a todos los colegios (±56 puntos). Verde o mostaza solo si es significativa; gris = a la par.",
    fuente: "Fuente: Agencia de Calidad de la Educación, SIMCE 2025.",
  },
  {
    id: "universidad",
    titulo: "Ingreso a la universidad",
    icono: "school",
    comoLeer:
      "la barra es el porcentaje de egresados que ingresó a la universidad (de 0 a 100 %) y la línea negra, sus similares.",
    fuente:
      "Fuente: PAES e ingreso a la universidad 2022–2025, compilados por Israel Rubilar a partir de datos públicos. Promedio de colegios similares: cálculo de Edubig con el grupo socioeconómico de 2° medio (Agencia de Calidad).",
  },
  {
    id: "costo",
    titulo: "Costo",
    icono: "monetization_on",
    comoLeer:
      "se marca solo el tramo de cada colegio, en la misma escala de 6 tramos: Gratuito · $1.000–10.000 · $10.001–25.000 · $25.001–50.000 · $50.001–100.000 · Más de $100.000.",
    fuente: "Fuente: Directorio Oficial de Establecimientos 2025 (Mineduc).",
  },
];

// ---------------------------------------------------------------------------
// Frase de conclusión (capa 1)

const SIN_DATOS = /^sin (datos|registros)/i;

export function frase(c: ColegioComparado, g: GrupoId): string | null {
  switch (g) {
    case "identidad":
      return null;
    case "seguridad":
      return c.frases.Seguridad;
    case "bienestar":
      return c.frases.Bienestar;
    case "academico":
      return c.frases.Académico;
    case "universidad":
      return c.universidad.estado === "no_imparte" ? null : c.frases.Trayectoria ?? "Sin datos publicados.";
    case "costo":
      return c.frases.Costo;
  }
}

export function Frase({ colegio, grupo }: { colegio: ColegioComparado; grupo: GrupoId }) {
  if (grupo === "universidad" && colegio.universidad.estado === "no_imparte")
    return (
      <p className="text-sm font-medium text-texto-secundario">
        <EstadoDatoLinea tipo="no_imparte" texto="No imparte enseñanza media." />
      </p>
    );
  const f = frase(colegio, grupo);
  if (!f) return null;
  if (SIN_DATOS.test(f))
    return (
      <p className="text-sm font-medium text-texto-secundario">
        <EstadoDatoLinea tipo="sin_dato" texto={f} />
      </p>
    );
  return <p className="text-sm font-medium text-texto-primario">{f}</p>;
}

// ---------------------------------------------------------------------------
// Celdas (capas 2–4)

export function CeldaIdentidad({ colegio, iguales }: { colegio: ColegioComparado; iguales?: Partial<Iguales> }) {
  return (
    <div className="flex flex-col gap-s">
      {!iguales?.dependencia && (
        <div className="flex flex-col gap-xxs">
          <span className="text-2xs text-texto-secundario">Dependencia</span>
          <div className="flex flex-wrap gap-xs">
            <ChipNeutro>{colegio.dependencia}</ChipNeutro>
          </div>
        </div>
      )}
      {!iguales?.niveles && (
        <div className="flex flex-col gap-xxs">
          <span className="text-2xs text-texto-secundario">Niveles</span>
          <div className="flex flex-wrap gap-xs">
            {colegio.niveles.length ? (
              colegio.niveles.map((n) => <ChipNeutro key={n}>{n}</ChipNeutro>)
            ) : (
              <span className="text-xs text-texto-secundario">Niveles no informados</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function decimal(x: number): string {
  return x.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function CeldaSeguridad({ colegio }: { colegio: ColegioComparado }) {
  const s = colegio.seguridad;
  if (s.anos.every((a) => a.n === null)) return <EstadoDato tipo="sin_dato" />;
  return (
    <div className="flex flex-col gap-s">
      <PuntosConteo anos={s.anos} posicion={colegio.posicion} />
      <p className="text-xs tabular-nums">
        {s.d25 === null ? (
          "2025 sin datos publicados"
        ) : (
          <>
            {plural(s.d25, "denuncia", "denuncias")} en 2025
            {s.tasa25 !== null && ` · ${decimal(s.tasa25)} por cada 1.000 estudiantes`}
          </>
        )}
        {s.matricula > 0 && ` · matrícula ${s.matricula.toLocaleString("es-CL")}`}
      </p>
      {s.pocosCasos && <EstadoDato tipo="pocos_casos" />}
    </div>
  );
}

export function CeldaBienestar({
  colegio,
  curso,
  rotular,
}: {
  colegio: ColegioComparado;
  curso: Curso;
  rotular: boolean;
}) {
  const b = colegio.bienestar[curso];
  if (b.estado === "no_imparte")
    return (
      <EstadoDato
        tipo="no_imparte"
        texto={`No imparte ${CURSO_GLOSA[curso]}`}
        explicacion={`Este colegio no tiene ${CURSO_GLOSA[curso]}. Elige otro curso para ver sus datos.`}
        className="min-h-[120px]"
      />
    );
  if (b.estado === "sin_dato")
    return <EstadoDato tipo="sin_dato" texto={`Sin datos publicados de ${CURSO_GLOSA[curso]}`} className="min-h-[120px]" />;
  return (
    <div className="flex flex-col gap-s">
      {b.dims.map((d, i) => (
        <BarraAbsoluta100
          key={d.dim}
          label={d.label}
          valor={d.valor}
          similares={d.similares}
          sig={d.sig}
          posicion={colegio.posicion}
          rotularSimilares={rotular && i === 0}
          reservarRotulo={i === 0}
        />
      ))}
    </div>
  );
}

export function CeldaAcademico({ colegio, leyenda }: { colegio: ColegioComparado; leyenda: boolean }) {
  if (!colegio.simce.hayAlguno) return <EstadoDato tipo="sin_dato" />;
  const noImparte = colegio.simce.materias.lect.filter((c) => c.estado === "no_imparte").map((c) => c.curso);
  return (
    <div className="brechas flex flex-col gap-xxs">
      {/* En escritorio el espacio se reserva en todas las columnas para alinear los gráficos. */}
      <div className={leyenda ? "" : "hidden lg:invisible lg:block"} aria-hidden={!leyenda}>
        <LeyendaSimilares />
      </div>
      <div className="brechas-filas">
        {MATERIAS.map((m) => (
          <TiraBrechas key={m} titulo={MATERIA_GLOSA[m]} celdas={colegio.simce.materias[m]} />
        ))}
      </div>
      {noImparte.length > 0 && (
        <p className="mt-xxs inline-flex items-center gap-xs text-xs text-texto-secundario">
          <Icon nombre="do_not_disturb_on" size={16} />
          No imparte {noImparte.map((c) => CURSO_GLOSA[c]).join(" ni ")}
        </p>
      )}
    </div>
  );
}

export function CeldaUniversidad({ colegio }: { colegio: ColegioComparado }) {
  const u = colegio.universidad;
  if (u.estado === "no_imparte")
    return (
      <EstadoDato
        tipo="no_imparte"
        texto="No imparte enseñanza media"
        explicacion="Este colegio no tiene enseñanza media, por eso no tiene egresados que ingresen a la universidad."
        className="min-h-[88px]"
      />
    );
  if (u.estado === "sin_dato") return <EstadoDato tipo="sin_dato" className="min-h-[88px]" />;
  return (
    <div className="flex flex-col gap-xs">
      <BarraProporcion tasa={u.tasa!} similares={u.similares} posicion={colegio.posicion} />
      <p className="text-xs tabular-nums">
        {u.similares !== undefined && (
          <>
            Diferencia con sus similares: {puntosPct(u.tasa! - u.similares)} %
            <br />
          </>
        )}
        {u.paes !== undefined && <>PAES promedio 2025: {Math.round(u.paes)}</>}
      </p>
    </div>
  );
}

export function CeldaCosto({ colegio }: { colegio: ColegioComparado }) {
  const c = colegio.costo;
  const pista = (label: string, tramo: number | null, glosa: string) => (
    <div>
      <p className="mb-xxs text-xs">
        {label}
        {tramo !== null && `: ${glosa}`}
      </p>
      {tramo !== null ? (
        <PistaTramos tramo={tramo} posicion={colegio.posicion} />
      ) : (
        <EstadoDato tipo="sin_informacion" className="py-xxs" />
      )}
    </div>
  );
  return (
    <div className="flex flex-col gap-s">
      {pista("Mensualidad", c.mensual, c.mensualGlosa)}
      {pista("Matrícula", c.matricula, c.matriculaGlosa)}
    </div>
  );
}

/** Referencia del colegio (en móvil, dentro de cada bloque). */
export function textoReferencia(colegio: ColegioComparado, curso?: Curso): string | null {
  return textoReferenciaGse(colegio, curso);
}
