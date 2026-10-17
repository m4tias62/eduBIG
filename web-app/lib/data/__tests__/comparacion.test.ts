import { describe, it, expect } from "vitest";
import { getDetalle, getIndice } from "@/lib/data/servidor";
import {
  construirColegio,
  cursoBienestarPorDefecto,
  datosIguales,
  posicionesDesdeUrl,
  resumenDiferencias,
} from "@/lib/data/comparacion";
import type { Posicion } from "@/lib/viz";

/** Colegios de Ñuñoa usados en el diseño (Claude Design, oct-2026). */
const NUNOA = [9071, 9184, 9228, 9102];
const armar = (rbds: number[]) => rbds.map((r, i) => construirColegio(getDetalle(r)!, (i + 1) as Posicion));

describe("Comparar — modelo", () => {
  it("resumen: solo hechos, en el orden del diseño", () => {
    expect(resumenDiferencias(armar(NUNOA))).toEqual([
      "No todos se comparan con el mismo grupo: 2 con colegios de GSE Medio Alto, 1 con GSE Medio y 1 cambia según el curso (Alto en 4° y 8° básico, Medio Alto en 2° medio).",
      "Costo: 2 son gratuitos, 1 tiene copago y 1 es particular pagado.",
      "Enseñanza media: 3 de los 4 la imparten.",
      "Educación parvularia: 2 de los 4 la imparten.",
    ]);
  });

  it("nunca usa lenguaje de ranking", () => {
    const texto = resumenDiferencias(armar(NUNOA)).join(" ").toLowerCase();
    expect(texto).not.toMatch(/mejor|gana|destaca|peor/);
  });

  it("SIMCE: color por significancia; s/d y 'no imparte' como estados propios", () => {
    const [dhalmar, , , zanartu] = armar(NUNOA);
    const lect = dhalmar.simce.materias.lect;
    expect(lect[0].estado).toBe("sin_dato"); // D'Halmar imparte básica, pero sin SIMCE 4° básico
    expect(lect[1]).toMatchObject({ estado: "dato", sig: 1 });
    expect(zanartu.simce.materias.lect[2].estado).toBe("no_imparte"); // sin media
  });

  it("seguridad: aviso de pocos casos con 2024 + 2025 ≤ 5", () => {
    const keller = construirColegio(getDetalle(9128)!, 1);
    expect(keller.seguridad.pocosCasos).toBe(true);
    expect(armar([9071])[0].seguridad.pocosCasos).toBe(false);
  });

  it("bienestar: curso por defecto = el más alto que comparte la mayoría", () => {
    expect(cursoBienestarPorDefecto(armar(NUNOA))).toBe("2m");
    expect(cursoBienestarPorDefecto(armar([9102, 9089]))).toBe("8b");
  });

  it("posiciones desde la URL: conserva colores al quitar un colegio", () => {
    expect(posicionesDesdeUrl(2, "1,4")).toEqual([1, 4]);
    expect(posicionesDesdeUrl(2, undefined)).toEqual([1, 2]);
    expect(posicionesDesdeUrl(2, "1,1")).toEqual([1, 2]); // inválido → consecutivas
    expect(posicionesDesdeUrl(2, "1,9")).toEqual([1, 2]);
  });

  it("'solo lo que cambia' no oculta un costo sin información", () => {
    const sinDato = getIndice().filter((c) => c.k === "sin_dato").slice(0, 2).map((c) => c.rbd);
    expect(datosIguales(armar(sinDato)).costo).toBe(false);
  });

  it("todas las comunas grandes construyen sin errores", () => {
    const rbds = getIndice().filter((c) => c.c === 13201).map((c) => c.rbd);
    for (let i = 0; i < rbds.length; i += 4) {
      const grupo = armar(rbds.slice(i, i + 4));
      expect(() => resumenDiferencias(grupo)).not.toThrow();
    }
  });
});
