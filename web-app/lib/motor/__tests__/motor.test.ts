import { describe, it, expect } from "vitest";
import { runMotor } from "@/lib/motor";
import type { RespuestasFamilia } from "@/lib/motor";
import { getUniverso } from "@/lib/data/schools";
import fixtures from "./fixtures.json";

/**
 * Paridad exacta con el motor Python.
 *
 * fixtures.json es generado por data-pipeline/scripts/generar_fixtures_motor.py
 * corriendo la misma lógica sobre colegios_universo.json. Este test valida que
 * el port a TypeScript produce los mismos rankings + scores (dentro de la
 * tolerancia de flotantes).
 *
 * Si este test falla, el port divergió del pipeline y la traducción del motor
 * ya no es fiel. NO ajustar tolerancias sin entender por qué.
 */

type Fixture = {
  descripcion: string;
  prefs: {
    techo_copago: number;
    nivel: "basica" | "media" | "basica_y_media";
    lat_sector: number;
    lon_sector: number;
    tipo_distancia: "duro" | "flexible";
    radio_km: number | null;
    perfil: RespuestasFamilia["perfil"];
    quiere_inclusion: boolean;
  };
  total_elegibles: number;
  top10: Array<{ rbd: number; nombre: string; score_final: number }>;
};

const TOLERANCIA_FLOAT = 1e-9;

/** Traduce las keys snake_case del fixture Python al camelCase del TS. */
function prefsFromFixture(p: Fixture["prefs"]): RespuestasFamilia {
  return {
    techoCopago: p.techo_copago as RespuestasFamilia["techoCopago"],
    nivel: p.nivel,
    latSector: p.lat_sector,
    lonSector: p.lon_sector,
    tipoDistancia: p.tipo_distancia,
    radioKm: p.radio_km ?? undefined,
    perfil: p.perfil,
    quiereInclusion: p.quiere_inclusion,
  };
}

const casos: Array<[string, Fixture]> = Object.entries(fixtures as Record<string, Fixture>);

describe("Motor — paridad exacta con el pipeline Python", () => {
  const universo = getUniverso();

  it.each(casos)("perfil %s", (nombre, fixture) => {
    const respuestas = prefsFromFixture(fixture.prefs);
    const resultado = runMotor(universo, respuestas);

    // Mismo total de elegibles después de Capa 1
    expect(resultado.totalElegibles, `total elegibles (${nombre})`)
      .toBe(fixture.total_elegibles);

    // Mismos top-10 en el mismo orden
    const topTs = resultado.shortlist.slice(0, 10);
    expect(topTs.length).toBe(fixture.top10.length);

    fixture.top10.forEach((esperado, i) => {
      const actual = topTs[i];
      expect(actual.rbd, `rbd en posición ${i} de ${nombre}`)
        .toBe(esperado.rbd);
      expect(actual.scoreFinal, `score en posición ${i} de ${nombre} (rbd ${esperado.rbd})`)
        .toBeCloseTo(esperado.score_final, 9);
    });
  });
});

describe("Motor — invariantes", () => {
  const universo = getUniverso();

  it("scoreFinal siempre está en [0, 1]", () => {
    const respuestas: RespuestasFamilia = {
      techoCopago: 5, nivel: "basica",
      latSector: -33.43913, lonSector: -70.7411,
      tipoDistancia: "flexible",
      perfil: "todo_por_igual", quiereInclusion: true,
    };
    const r = runMotor(universo, respuestas);
    for (const c of r.shortlist) {
      expect(c.scoreFinal).toBeGreaterThanOrEqual(0);
      expect(c.scoreFinal).toBeLessThanOrEqual(1);
    }
  });

  it("ordenamiento descendente por scoreFinal", () => {
    const respuestas: RespuestasFamilia = {
      techoCopago: 5, nivel: "media",
      latSector: -33.43913, lonSector: -70.7411,
      tipoDistancia: "flexible",
      perfil: "academico", quiereInclusion: false,
    };
    const r = runMotor(universo, respuestas);
    for (let i = 1; i < r.shortlist.length; i++) {
      expect(r.shortlist[i - 1].scoreFinal)
        .toBeGreaterThanOrEqual(r.shortlist[i].scoreFinal);
    }
  });

  it("distancia flexible incluye colegios lejos; distancia dura los excluye", () => {
    const base = {
      techoCopago: 5, nivel: "basica",
      latSector: -33.43913, lonSector: -70.7411,
      perfil: "academico", quiereInclusion: false,
    } as const;
    const flexible = runMotor(universo, { ...base, tipoDistancia: "flexible" });
    const duro = runMotor(universo, { ...base, tipoDistancia: "duro", radioKm: 1 });
    expect(flexible.totalElegibles).toBeGreaterThan(duro.totalElegibles);
  });
});
