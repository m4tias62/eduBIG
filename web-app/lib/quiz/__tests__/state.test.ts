import { describe, it, expect } from "vitest";
import { nextUrl, parseRespuestas, serializeRespuestas, toRespuestasFamilia } from "@/lib/quiz/state";

describe("estado del Test en la URL", () => {
  it("parse y serialize son inversos", () => {
    const qs = "copago=0&inc=pie&nivel=media&alc=cercanas&perfil=superior";
    expect(serializeRespuestas(parseRespuestas(new URLSearchParams(qs)))).toBe(qs);
  });

  it("descarta valores inválidos", () => {
    const r = parseRespuestas({ copago: "9", inc: "quizas", nivel: "x", alc: "10km", perfil: "otro" });
    expect(r).toEqual({});
  });

  it("'superior' solo vale si eligió media o ambos niveles (D30)", () => {
    expect(parseRespuestas({ nivel: "basica", perfil: "superior" }).perfil).toBeUndefined();
    expect(parseRespuestas({ nivel: "basica_y_media", perfil: "superior" }).perfil).toBe("superior");
  });

  it("toRespuestasFamilia exige las 5 respuestas", () => {
    expect(toRespuestasFamilia({ techoCopago: 0, inclusion: "no", nivel: "basica", alcance: "1km" })).toBeNull();
    expect(
      toRespuestasFamilia({ techoCopago: 0, inclusion: "no", nivel: "basica", alcance: "1km", perfil: "academico" })
    ).not.toBeNull();
  });

  it("nextUrl combina respuestas previas y nuevas", () => {
    expect(nextUrl("/test/q3", { techoCopago: 2 }, { inclusion: "entorno" })).toBe("/test/q3?copago=2&inc=entorno");
  });
});
