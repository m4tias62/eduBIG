import type { Curso, DetalleColegio, DimensionIdps, EstadoCosto } from "@/lib/types";
import { CURSOS, CURSO_GLOSA, num, texto } from "@/lib/data/detalle";
import { dependenciaGlosa } from "@/lib/data/formatters";
import { significancia, UMBRAL_POCOS_CASOS, type Posicion, type Significancia } from "@/lib/viz";

/**
 * Modelo de la pantalla Comparar (oct-2026). Funciones puras: del detalle
 * oficial a lo que dibuja cada celda. No juzga ni ordena colegios: cada uno se
 * describe frente a SUS colegios similares.
 */

export type Materia = "lect" | "mate";
export const MATERIAS: Materia[] = ["lect", "mate"];
export const MATERIA_GLOSA: Record<Materia, string> = { lect: "Lectura", mate: "Matemática" };
export const CURSO_CORTO: Record<Curso, string> = { "4b": "4° b", "8b": "8° b", "2m": "2° m" };

/** Orden y rótulos cortos de las dimensiones IDPS en Comparar. */
export const DIMS_COMPARAR: Array<{ dim: DimensionIdps; label: string }> = [
  { dim: "autoestima", label: "Autoestima académica" },
  { dim: "clima", label: "Clima escolar" },
  { dim: "participacion", label: "Participación" },
  { dim: "habitos", label: "Hábitos de vida saludable" },
];

export const ANOS_DENUNCIAS = [2022, 2023, 2024, 2025] as const;

/** Tramos oficiales del Directorio (misma escala de 6 para todos). */
export const TRAMOS = [
  "Gratuito",
  "$1.000 a $10.000",
  "$10.001 a $25.000",
  "$25.001 a $50.000",
  "$50.001 a $100.000",
  "Más de $100.000",
] as const;
const TRAMO_CRUDO: Record<string, number> = {
  GRATUITO: 0,
  "$1.000 A $10.000": 1,
  "$10.001 A $25.000": 2,
  "$25.001 A $50.000": 3,
  "$50.001 A $100.000": 4,
  "MAS DE $100.000": 5,
};

// ---------------------------------------------------------------------------

export type Gse =
  | { tipo: "igual"; etiqueta: string }
  | { tipo: "varia"; detalle: string }
  | { tipo: "ninguno" };

export type EstadoCelda = "dato" | "sin_comparacion" | "sin_dato" | "no_imparte";

export interface CeldaSimce {
  curso: Curso;
  estado: EstadoCelda;
  puntaje?: number;
  dif?: number;
  sig: Significancia;
}

export interface DimBienestar {
  dim: DimensionIdps;
  label: string;
  valor: number;
  similares: number | null;
  dif: number | null;
  sig: Significancia;
}

export interface CursoBienestar {
  estado: "dato" | "sin_dato" | "no_imparte";
  dims: DimBienestar[];
}

export interface ColegioComparado {
  rbd: number;
  nombre: string;
  posicion: Posicion;
  comuna: string;
  dependencia: string;
  costoCategoria: "gratuito" | "copago" | "pagado" | "sin_dato";
  niveles: string[];
  ofreceBasica: boolean;
  ofreceMedia: boolean;
  ofreceParvularia: boolean;
  gse: Gse;
  gsePorCurso: Partial<Record<Curso, string>>;
  frases: DetalleColegio["traduccion"]["lo_esencial"];
  seguridad: {
    anos: Array<{ ano: number; n: number | null }>;
    d25: number | null;
    tasa25: number | null;
    matricula: number;
    pocosCasos: boolean;
  };
  bienestar: Record<Curso, CursoBienestar>;
  simce: { hayAlguno: boolean; materias: Record<Materia, CeldaSimce[]> };
  universidad: {
    estado: "dato" | "sin_dato" | "no_imparte";
    tasa?: number;
    similares?: number;
    paes?: number;
  };
  costo: {
    mensual: number | null;
    matricula: number | null;
    mensualGlosa: string;
    matriculaGlosa: string;
  };
}

function imparte(d: DetalleColegio, curso: Curso): boolean {
  return curso === "2m" ? d.ofrece_media : d.ofrece_basica;
}

function gseDe(d: DetalleColegio): { gse: Gse; porCurso: Partial<Record<Curso, string>> } {
  const porCurso: Partial<Record<Curso, string>> = {};
  for (const c of CURSOS) {
    const e = texto(d, `gse_${c}_etiqueta`);
    if (e) porCurso[c] = e;
  }
  const valores = Object.values(porCurso);
  if (valores.length === 0) return { gse: { tipo: "ninguno" }, porCurso };
  if (new Set(valores).size === 1) return { gse: { tipo: "igual", etiqueta: valores[0]! }, porCurso };
  return { gse: { tipo: "varia", detalle: detalleGse(porCurso) }, porCurso };
}

/** {4b: Alto, 8b: Alto, 2m: Medio Alto} → "Alto en 4° y 8° básico, Medio Alto en 2° medio". */
export function detalleGse(porCurso: Partial<Record<Curso, string>>): string {
  const grupos = new Map<string, Curso[]>();
  for (const c of CURSOS) {
    const e = porCurso[c];
    if (e) grupos.set(e, [...(grupos.get(e) ?? []), c]);
  }
  return Array.from(grupos.entries())
    .map(([etiqueta, cursos]) => `${etiqueta} en ${cursosGlosa(cursos)}`)
    .join(", ");
}

function cursosGlosa(cursos: Curso[]): string {
  const basica = cursos.filter((c) => c !== "2m").map((c) => (c === "4b" ? "4°" : "8°"));
  const partes: string[] = [];
  if (basica.length) partes.push(`${basica.join(" y ")} básico`);
  if (cursos.includes("2m")) partes.push("2° medio");
  return partes.join(" y ");
}

function costoCategoria(d: DetalleColegio): ColegioComparado["costoCategoria"] {
  const k: EstadoCosto = d.estado_costo;
  if (k === "gratuito" || k === "gratuito_ley") return "gratuito";
  if (k === "sin_dato") return "sin_dato";
  return d.dependencia_cod === 3 ? "pagado" : "copago";
}

function tramo(crudo: string | undefined): number | null {
  if (!crudo) return null;
  const t = TRAMO_CRUDO[crudo.toUpperCase()];
  return t === undefined ? null : t;
}

export function construirColegio(d: DetalleColegio, posicion: Posicion): ColegioComparado {
  const { gse, porCurso } = gseDe(d);

  // Seguridad — null = sin datos publicados (no se asume 0).
  const anos = ANOS_DENUNCIAS.map((ano) => ({ ano, n: num(d, `denuncias_total_${ano}`) ?? null }));
  const d24 = anos[2].n;
  const d25 = anos[3].n;
  const conocidas = (d24 ?? 0) + (d25 ?? 0);
  const matricula = d.matricula_total ?? 0;

  // Bienestar (IDPS) por curso
  const bienestar = {} as Record<Curso, CursoBienestar>;
  for (const curso of CURSOS) {
    const dims: DimBienestar[] = [];
    for (const { dim, label } of DIMS_COMPARAR) {
      const valor = num(d, `idps_${dim}_${curso}_2025`);
      if (valor === undefined) continue;
      const dif = num(d, `idps_${dim}_${curso}_2025_difgru`) ?? null;
      dims.push({
        dim,
        label,
        valor,
        dif,
        similares: dif !== null ? valor - dif : null,
        sig: dif !== null ? significancia(d[`idps_${dim}_${curso}_2025_sigdifgru`]) : null,
      });
    }
    bienestar[curso] = {
      estado: dims.length ? "dato" : imparte(d, curso) ? "sin_dato" : "no_imparte",
      dims,
    };
  }

  // Académico (SIMCE): siempre 3 posiciones por materia, para alinear columnas.
  const materias = {} as Record<Materia, CeldaSimce[]>;
  let hayAlguno = false;
  for (const m of MATERIAS) {
    materias[m] = CURSOS.map((curso) => {
      const puntaje = num(d, `simce_${m}_${curso}_2025`);
      const dif = num(d, `simce_${m}_${curso}_2025_difgru`);
      if (puntaje !== undefined) hayAlguno = true;
      const estado: EstadoCelda =
        puntaje === undefined
          ? imparte(d, curso) ? "sin_dato" : "no_imparte"
          : dif === undefined
            ? "sin_comparacion"
            : "dato";
      return {
        curso,
        estado,
        puntaje,
        dif,
        sig: estado === "dato" ? significancia(d[`simce_${m}_${curso}_2025_siggru`]) : null,
      };
    });
  }

  // Universidad
  const tasa = num(d, "tasa_ingreso_u_2025");
  const universidad: ColegioComparado["universidad"] = !d.ofrece_media
    ? { estado: "no_imparte" }
    : tasa === undefined
      ? { estado: "sin_dato" }
      : {
          estado: "dato",
          tasa,
          similares: num(d, "tasa_ingreso_u_similares_2025"),
          paes: num(d, "paes_prom_2025"),
        };

  const mensual = tramo(texto(d, "pago_mensual"));
  const mat = tramo(texto(d, "pago_matricula"));

  const niveles: string[] = [];
  if (d.ofrece_parvularia) niveles.push("Parvularia");
  if (d.ofrece_basica) niveles.push("Básica");
  if (d.ofrece_media) niveles.push("Media");
  if (d.ofrece_especial) niveles.push("Educación especial");

  return {
    rbd: d.rbd,
    nombre: d.nombre,
    posicion,
    comuna: d.comuna,
    dependencia: dependenciaGlosa(d.dependencia_cod),
    costoCategoria: costoCategoria(d),
    niveles,
    ofreceBasica: d.ofrece_basica,
    ofreceMedia: d.ofrece_media,
    ofreceParvularia: d.ofrece_parvularia,
    gse,
    gsePorCurso: porCurso,
    frases: d.traduccion.lo_esencial,
    seguridad: {
      anos,
      d25,
      tasa25: d25 !== null && matricula > 0 ? (d25 / matricula) * 1000 : null,
      matricula,
      pocosCasos: (d24 !== null || d25 !== null) && conocidas <= UMBRAL_POCOS_CASOS,
    },
    bienestar,
    simce: { hayAlguno, materias },
    universidad,
    costo: {
      mensual,
      matricula: mat,
      mensualGlosa: mensual === null ? "Sin información" : TRAMOS[mensual],
      matriculaGlosa: mat === null ? "Sin información" : TRAMOS[mat],
    },
  };
}

// ---------------------------------------------------------------------------
// Posiciones (color por colegio)

/**
 * Posiciones 1–4 a partir de la URL. `pos` es opcional: sin él (o si no es
 * válido) los colegios toman 1, 2, 3… en orden. Así un colegio conserva su
 * color aunque se quite otro de la comparación.
 */
export function posicionesDesdeUrl(n: number, pos: string | undefined): Posicion[] {
  const consecutivas = Array.from({ length: n }, (_, i) => (i + 1) as Posicion);
  if (!pos) return consecutivas;
  const lista = pos.split(",").map(Number);
  const validas =
    lista.length === n &&
    lista.every((p) => Number.isInteger(p) && p >= 1 && p <= 4) &&
    new Set(lista).size === n;
  return validas ? (lista as Posicion[]) : consecutivas;
}

// ---------------------------------------------------------------------------
// Curso por defecto de Bienestar: el más alto que comparte la mayoría.

export function cursoBienestarPorDefecto(colegios: ColegioComparado[]): Curso {
  const conDato = (c: Curso) => colegios.filter((x) => x.bienestar[c].estado === "dato").length;
  // Del curso más alto al más bajo: el primero con dato en la mayoría (más de la mitad).
  const mayoria = [...CURSOS].reverse().find((c) => conDato(c) > colegios.length / 2);
  if (mayoria) return mayoria;
  // Si ninguno llega a la mayoría, el que tenga más colegios con dato (empate → el más alto).
  let mejor: Curso = "4b";
  let max = 0;
  for (const c of CURSOS) {
    if (conDato(c) >= max && conDato(c) > 0) {
      mejor = c;
      max = conDato(c);
    }
  }
  return mejor;
}

export function cursosBienestarConDato(colegios: ColegioComparado[]): Curso[] {
  return CURSOS.filter((c) => colegios.some((x) => x.bienestar[c].estado === "dato"));
}

// ---------------------------------------------------------------------------
// "Lo que más cambia entre estos colegios": solo hechos, nunca juicios.

function cuenta(n: number, singular: string, pluralTxt: string): string {
  return `${n} ${n === 1 ? singular : pluralTxt}`;
}

function enumerar(partes: string[]): string {
  if (partes.length <= 1) return partes.join("");
  return `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
}

export function resumenDiferencias(colegios: ColegioComparado[]): string[] {
  const n = colegios.length;
  const hechos: string[] = [];

  // 1. Grupo de comparación
  const claves = colegios.map((c) =>
    c.gse.tipo === "igual" ? `igual:${c.gse.etiqueta}` : c.gse.tipo === "varia" ? `varia:${c.rbd}` : "ninguno"
  );
  const distintas = new Set(claves.map((k) => (k.startsWith("varia") ? "varia" : k)));
  if (distintas.size > 1 || claves.some((k) => k.startsWith("varia"))) {
    const iguales = new Map<string, number>();
    colegios.forEach((c) => {
      if (c.gse.tipo === "igual") iguales.set(c.gse.etiqueta, (iguales.get(c.gse.etiqueta) ?? 0) + 1);
    });
    const partes: string[] = [];
    Array.from(iguales.entries()).forEach(([etiqueta, k], i) =>
      partes.push(i === 0 ? `${k} con colegios de GSE ${etiqueta}` : `${k} con GSE ${etiqueta}`)
    );
    const varian = colegios.filter((c) => c.gse.tipo === "varia");
    if (varian.length === 1 && varian[0].gse.tipo === "varia")
      partes.push(`1 cambia según el curso (${varian[0].gse.detalle})`);
    else if (varian.length > 1) partes.push(`${varian.length} cambian según el curso`);
    const sin = colegios.filter((c) => c.gse.tipo === "ninguno").length;
    if (sin) partes.push(cuenta(sin, "no tiene grupo de comparación publicado", "no tienen grupo de comparación publicado"));
    hechos.push(`${n === 2 ? "No se comparan" : "No todos se comparan"} con el mismo grupo: ${enumerar(partes)}.`);
  }

  // 2. Datos publicados
  const sinDatos = colegios.filter(
    (c) => !c.simce.hayAlguno && Object.values(c.bienestar).every((b) => b.estado !== "dato")
  ).length;
  if (sinDatos > 0 && sinDatos < n)
    hechos.push(
      `Datos publicados: ${sinDatos} de los ${n} no ${sinDatos === 1 ? "tiene" : "tienen"} resultados de bienestar ni académicos publicados.`
    );

  // 3. Costo
  const cat = { gratuito: 0, copago: 0, pagado: 0, sin_dato: 0 };
  colegios.forEach((c) => cat[c.costoCategoria]++);
  if (Object.values(cat).filter((v) => v > 0).length > 1) {
    const partes: string[] = [];
    if (cat.gratuito) partes.push(cuenta(cat.gratuito, "es gratuito", "son gratuitos"));
    if (cat.copago) partes.push(cuenta(cat.copago, "tiene copago", "tienen copago"));
    if (cat.pagado) partes.push(cuenta(cat.pagado, "es particular pagado", "son particulares pagados"));
    if (cat.sin_dato) partes.push(cuenta(cat.sin_dato, "no tiene dato de costo", "no tienen dato de costo"));
    hechos.push(`Costo: ${enumerar(partes)}.`);
  }

  // 4. Niveles
  const media = colegios.filter((c) => c.ofreceMedia).length;
  if (media > 0 && media < n)
    hechos.push(`Enseñanza media: ${media} de los ${n} la ${media === 1 ? "imparte" : "imparten"}.`);
  const parv = colegios.filter((c) => c.ofreceParvularia).length;
  if (parv > 0 && parv < n && hechos.length < 4)
    hechos.push(`Educación parvularia: ${parv} de los ${n} la ${parv === 1 ? "imparte" : "imparten"}.`);

  return hechos.slice(0, 4);
}

// ---------------------------------------------------------------------------
// "Mostrar solo lo que cambia": qué datos son iguales en todos.

export interface Iguales {
  dependencia: boolean;
  comuna: boolean;
  niveles: boolean;
  costo: boolean;
}

export function datosIguales(colegios: ColegioComparado[]): Iguales {
  const todos = <T,>(f: (c: ColegioComparado) => T) => new Set(colegios.map((c) => JSON.stringify(f(c)))).size === 1;
  return {
    dependencia: todos((c) => c.dependencia),
    comuna: todos((c) => c.comuna),
    niveles: todos((c) => c.niveles),
    // Nunca se oculta un costo sin información (los datos sin publicar no se ocultan).
    costo:
      todos((c) => [c.costo.mensual, c.costo.matricula]) &&
      colegios.every((c) => c.costo.mensual !== null && c.costo.matricula !== null),
  };
}

/** "Se compara con colegios similares · GSE Medio Alto" (o sus variantes); con curso, el GSE de ese curso. */
export function textoReferenciaGse(colegio: ColegioComparado, curso?: Curso): string | null {
  if (curso) {
    const e = colegio.gsePorCurso[curso];
    if (!e) return null;
    return colegio.gse.tipo === "varia"
      ? `Se compara con colegios similares · GSE ${e} en ${CURSO_GLOSA[curso]}`
      : `Se compara con colegios similares · GSE ${e}`;
  }
  if (colegio.gse.tipo === "igual") return `Se compara con colegios similares · GSE ${colegio.gse.etiqueta}`;
  if (colegio.gse.tipo === "varia") return `Se compara con colegios similares · GSE ${colegio.gse.detalle}`;
  return "Sin grupo de comparación publicado: no se compara con colegios similares";
}

export { CURSO_GLOSA };
