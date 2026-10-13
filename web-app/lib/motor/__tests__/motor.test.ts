import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  adaptarAlcance,
  calcularPesos,
  pasaCopago,
  pasaInclusion,
  pasaNivel,
  percentiles,
  runMotor,
  type Referencia,
  type RespuestasFamilia,
} from "@/lib/motor";
import type { ColegioIndice, Comuna } from "@/lib/types";

/**
 * Motor nacional (2026-10-13). Reemplaza el test de paridad con el notebook
 * Python del MVP: el motor nacional implementa D21–D36 y todavía no tiene
 * espejo en Python (pendiente registrado en la bitácora).
 */

const DIR = path.join(__dirname, "..", "..", "..", "public", "data", "nacional");
const indice: ColegioIndice[] = JSON.parse(fs.readFileSync(path.join(DIR, "indice.json"), "utf-8"));
const comunas: Comuna[] = JSON.parse(fs.readFileSync(path.join(DIR, "comunas.json"), "utf-8"));
const regionPorComuna = new Map(comunas.map((c) => [c.cod, c.region]));
const universo = { colegios: indice, regionPorComuna };

function refComuna(cod: number): Referencia {
  const c = comunas.find((x) => x.cod === cod)!;
  return { tipo: "comuna", lat: c.lat, lon: c.lon, codComuna: c.cod, nombreComuna: c.nombre, region: c.region, cercanas: c.cercanas };
}

const PUDAHUEL = 13124;
const base: RespuestasFamilia = {
  techoCopago: 0,
  inclusion: "no",
  nivel: "basica",
  alcance: "comuna",
  perfil: "todo_por_igual",
};

const colegio = (o: Partial<ColegioIndice>): ColegioIndice => ({
  rbd: 1, n: "X", c: 1, lat: 0, lon: 0, d: 2, b: 1, m: 0, e: 0, p: 0, k: "gratuito", r: 0, mt: 100, cmp: 1, ...o,
});

describe("pesos (D30, D35)", () => {
  it("todo por igual reparte 70 % en 5 dimensiones sin media", () => {
    const p = calcularPesos("todo_por_igual", false, "cualquiera");
    expect(p.academico).toBeCloseTo(0.14);
    expect(p.distancia).toBeCloseTo(0.3);
    expect(p.superior).toBeUndefined();
  });
  it("con media suma 'superior' y reparte 70 % en 6", () => {
    const p = calcularPesos("todo_por_igual", true, "cualquiera");
    expect(p.superior).toBeCloseTo(0.7 / 6);
    expect(Object.values(p).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });
  it("dimensión elegida lleva 50 % y el resto se reparte 20 %", () => {
    const p = calcularPesos("superior", true, "cualquiera");
    expect(p.superior).toBeCloseTo(0.5);
    expect(p.academico).toBeCloseTo(0.04);
  });
  it("con alcance duro se retira la distancia y se renormaliza", () => {
    const p = calcularPesos("academico", false, "1km");
    expect(p.distancia).toBeUndefined();
    expect(Object.values(p).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });
});

describe("Capa 1", () => {
  it("D36: copago sin dato según dependencia", () => {
    expect(pasaCopago(colegio({ k: "gratuito_ley" }), 0)).toBe(true);
    expect(pasaCopago(colegio({ k: "pago_sin_monto" }), 0)).toBe(false);
    expect(pasaCopago(colegio({ k: "pago_sin_monto" }), 1)).toBe(true);
    expect(pasaCopago(colegio({ k: "sin_dato" }), 0)).toBe(true);
    expect(pasaCopago(colegio({ k: "pago", r: 3 }), 2)).toBe(false);
    expect(pasaCopago(colegio({ k: "pago", r: 3 }), 3)).toBe(true);
  });
  it("D21: necesitar filtra, valorar no", () => {
    expect(pasaInclusion(colegio({ p: 0 }), "pie")).toBe(false);
    expect(pasaInclusion(colegio({ p: 1 }), "pie")).toBe(true);
    expect(pasaInclusion(colegio({ e: 0 }), "especial")).toBe(false);
    expect(pasaInclusion(colegio({ p: 0, e: 0 }), "entorno")).toBe(true);
  });
  it("educación especial pura pasa el filtro de nivel", () => {
    expect(pasaNivel(colegio({ b: 0, m: 0, e: 1 }), "media")).toBe(true);
    expect(pasaNivel(colegio({ b: 1, m: 0 }), "basica_y_media")).toBe(false);
  });
});

describe("percentiles", () => {
  it("empates comparten rango y faltantes quedan NaN", () => {
    const p = percentiles([1, 2, 2, 3, undefined]);
    expect(p[0]).toBe(0);
    expect(p[1]).toBeCloseTo(0.5);
    expect(p[2]).toBeCloseTo(0.5);
    expect(p[3]).toBe(1);
    expect(Number.isNaN(p[4])).toBe(true);
  });
});

describe("alcance según precisión (D22, D23)", () => {
  it("traduce 1 km ↔ mi comuna y 3 km ↔ cercanas", () => {
    expect(adaptarAlcance("1km", "comuna")).toBe("comuna");
    expect(adaptarAlcance("cercanas", "gps")).toBe("3km");
    expect(adaptarAlcance("cualquiera", "gps")).toBe("cualquiera");
  });
});

describe("runMotor con el dataset nacional", () => {
  const ref = refComuna(PUDAHUEL);

  it("shortlist de 3, todos de la comuna, con datos para comparar (D24, D27)", () => {
    const r = runMotor(universo, base, ref);
    expect(r.shortlist).toHaveLength(3);
    for (const s of r.shortlist) {
      expect(s.colegio.c).toBe(PUDAHUEL);
      expect(s.colegio.cmp).toBe(1);
      expect(s.colegio.b).toBe(1);
    }
    for (const s of r.sinDatos) expect(s.colegio.cmp).toBe(0);
    expect(r.shortlist[0].scoreFinal).toBeGreaterThanOrEqual(r.shortlist[2].scoreFinal);
  });

  it("es determinista", () => {
    const a = runMotor(universo, base, ref).shortlist.map((s) => s.colegio.rbd);
    const b = runMotor(universo, base, ref).shortlist.map((s) => s.colegio.rbd);
    expect(a).toEqual(b);
  });

  it("con pocos colegios ofrece ampliar la distancia (D26)", () => {
    const r = runMotor(universo, { ...base, inclusion: "especial", nivel: "media" }, ref);
    if (r.shortlist.length < 3) {
      expect(r.ampliaciones.map((a) => a.alcance)).toEqual(["cercanas", "cualquiera"]);
      for (const a of r.ampliaciones) expect(a.suma).toBe(a.total - r.totalRecomendables);
    }
  });

  it("'cualquier distancia' se limita a la región de la familia", () => {
    const r = runMotor(universo, { ...base, alcance: "cualquiera" }, ref);
    for (const s of r.shortlist) expect(regionPorComuna.get(s.colegio.c)).toBe("RM");
  });

  it("prioridad educación superior ordena por tasa relativa (D30)", () => {
    const r = runMotor(universo, { ...base, nivel: "media", perfil: "superior", alcance: "cercanas" }, ref);
    expect(r.shortlist.length).toBeGreaterThan(0);
    for (const s of r.shortlist) expect(s.colegio.m).toBe(1);
  });

  it("corre sobre 8.250 colegios en menos de 300 ms", () => {
    const t0 = performance.now();
    runMotor(universo, { ...base, alcance: "cualquiera" }, ref);
    expect(performance.now() - t0).toBeLessThan(300);
  });
});
