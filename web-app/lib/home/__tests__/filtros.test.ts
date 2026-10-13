import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { explorar, normalizar, parseFiltros, serializeFiltros, ordenEfectivo } from "@/lib/home/filtros";
import type { ColegioIndice } from "@/lib/types";

const DIR = path.join(__dirname, "..", "..", "..", "public", "data", "nacional");
const indice: ColegioIndice[] = JSON.parse(fs.readFileSync(path.join(DIR, "indice.json"), "utf-8"));

describe("URL de exploración", () => {
  it("parse y serialize son inversos", () => {
    const qs = "comuna=13124&cercanas=1&gratuito=1&nivel=media&tipo=publica%2Cpart_subvencionado&orden=ingreso_u&vista=mapa";
    const f = parseFiltros(new URLSearchParams(qs));
    expect(f.comuna).toBe(13124);
    expect(f.tipos).toEqual(["publica", "part_subvencionado"]);
    expect(serializeFiltros(f)).toBe(qs);
  });
});

describe("explorar", () => {
  it("por comuna: solo esa comuna y en orden alfabético", () => {
    const f = parseFiltros(new URLSearchParams("comuna=13124"));
    const r = explorar(indice, f, { modo: "comuna", comunas: new Set([13124]) });
    expect(r.length).toBeGreaterThan(40);
    expect(r.every((x) => x.c.c === 13124)).toBe(true);
    const nombres = r.map((x) => x.c.n);
    expect(nombres).toEqual([...nombres].sort((a, b) => a.localeCompare(b, "es")));
  });

  it("Gratuito incluye 'gratuito por ley' y 'sin dato' (D36), excluye pagados", () => {
    const f = parseFiltros(new URLSearchParams("gratuito=1"));
    const r = explorar(indice, f, { modo: "nombre" });
    expect(r.some((x) => x.c.k === "gratuito_ley")).toBe(true);
    expect(r.some((x) => x.c.k === "pago" || x.c.k === "pago_sin_monto")).toBe(false);
  });

  it("busca sin tildes ni mayúsculas", () => {
    expect(normalizar("Concepción")).toBe("concepcion");
    const f = parseFiltros(new URLSearchParams("q=ciudad de brasilia"));
    const r = explorar(indice, f, { modo: "nombre" });
    expect(r.some((x) => x.c.rbd === 10130)).toBe(true);
  });

  it("el orden por ingreso a la U solo aplica con media (D33)", () => {
    expect(ordenEfectivo(parseFiltros(new URLSearchParams("orden=ingreso_u")), "comuna")).toBe("nombre");
    const f = parseFiltros(new URLSearchParams("orden=ingreso_u&nivel=media"));
    expect(ordenEfectivo(f, "comuna")).toBe("ingreso_u");
    const r = explorar(indice, f, { modo: "comuna", comunas: new Set([13124]) });
    const tr = r.map((x) => x.c.tr).filter((v): v is number => v !== undefined);
    expect(tr).toEqual([...tr].sort((a, b) => b - a));
  });
});
