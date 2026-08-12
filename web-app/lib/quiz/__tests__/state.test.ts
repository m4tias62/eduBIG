import { describe, it, expect } from "vitest";
import {
  parseRespuestas,
  serializeRespuestas,
  nextUrl,
  toRespuestasFamilia,
  LAT_PUDAHUEL,
  LON_PUDAHUEL,
} from "@/lib/quiz/state";

describe("Quiz state — parse/serialize", () => {
  it("roundtrip de respuestas parciales completas", () => {
    const original = {
      techoCopago: 2 as const,
      quiereInclusion: true,
      incTipo: "pie" as const,
      nivel: "media" as const,
      tipoDistancia: "duro" as const,
      radioKm: 2,
      perfil: "convivencia" as const,
    };
    const qs = serializeRespuestas(original);
    const parseado = parseRespuestas(new URLSearchParams(qs));
    expect(parseado).toEqual(original);
  });

  it("ignora valores fuera de rango o inválidos", () => {
    const parseado = parseRespuestas(new URLSearchParams("copago=99&nivel=invalido&perfil=xxx"));
    expect(parseado.techoCopago).toBeUndefined();
    expect(parseado.nivel).toBeUndefined();
    expect(parseado.perfil).toBeUndefined();
  });

  it("nextUrl mergea previas + nuevas", () => {
    const previas = { techoCopago: 0 as const };
    const url = nextUrl("/test/q2a", previas, { quiereInclusion: false });
    expect(url).toContain("/test/q2a?");
    expect(url).toContain("copago=0");
    expect(url).toContain("incl=no");
  });
});

describe("Quiz state — toRespuestasFamilia", () => {
  it("retorna null si falta algún campo obligatorio", () => {
    expect(toRespuestasFamilia({})).toBeNull();
    expect(toRespuestasFamilia({ techoCopago: 0 })).toBeNull();
    expect(toRespuestasFamilia({
      techoCopago: 0,
      quiereInclusion: false,
      nivel: "media",
      tipoDistancia: "duro",
      // falta radioKm cuando distancia es dura
      perfil: "academico",
    })).toBeNull();
  });

  it("construye respuestas completas con lat/lon de Pudahuel", () => {
    const r = toRespuestasFamilia({
      techoCopago: 0,
      quiereInclusion: false,
      nivel: "media",
      tipoDistancia: "duro",
      radioKm: 2,
      perfil: "convivencia",
    });
    expect(r).not.toBeNull();
    expect(r!.latSector).toBe(LAT_PUDAHUEL);
    expect(r!.lonSector).toBe(LON_PUDAHUEL);
  });

  it("distancia flexible no requiere radio", () => {
    const r = toRespuestasFamilia({
      techoCopago: 5,
      quiereInclusion: false,
      nivel: "basica",
      tipoDistancia: "flexible",
      perfil: "academico",
    });
    expect(r).not.toBeNull();
    expect(r!.tipoDistancia).toBe("flexible");
    expect(r!.radioKm).toBeUndefined();
  });
});
