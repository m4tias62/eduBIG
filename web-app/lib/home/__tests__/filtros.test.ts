import { describe, it, expect } from "vitest";
import {
  parseFiltros,
  serializeFiltros,
  parseVista,
  filtrarUniverso,
  pasaFiltros,
} from "@/lib/home/filtros";
import { getUniverso, getColegio } from "@/lib/data/schools";
import { distanciaKm } from "@/lib/motor/haversine";
import { LAT_PUDAHUEL, LON_PUDAHUEL } from "@/lib/quiz/state";

describe("Filtros Home — parse/serialize", () => {
  it("roundtrip completo", () => {
    const original = {
      q: "graham",
      gratuito: true,
      nivel: "media" as const,
      distanciaMaxKm: 2,
      dependencia: "publica" as const,
    };
    const qs = serializeFiltros(original);
    expect(parseFiltros(new URLSearchParams(qs))).toEqual(original);
  });

  it("ignora valores inválidos", () => {
    const p = parseFiltros(new URLSearchParams("nivel=xxx&dep=???&dist=-5"));
    expect(p.nivel).toBeUndefined();
    expect(p.dependencia).toBeUndefined();
    expect(p.distanciaMaxKm).toBeUndefined();
  });

  it("parseVista default a lista", () => {
    expect(parseVista(new URLSearchParams(""))).toBe("lista");
    expect(parseVista(new URLSearchParams("vista=mapa"))).toBe("mapa");
    expect(parseVista(new URLSearchParams("vista=lista"))).toBe("lista");
    expect(parseVista(new URLSearchParams("vista=otro"))).toBe("lista");
  });
});

describe("Filtros Home — aplicación sobre universo real", () => {
  const universo = getUniverso();

  it("sin filtros retorna todo el universo", () => {
    expect(filtrarUniverso(universo, {}).length).toBe(universo.length);
  });

  it("gratuito filtra los con copago", () => {
    const gratuitos = filtrarUniverso(universo, { gratuito: true });
    expect(gratuitos.length).toBeGreaterThan(0);
    expect(gratuitos.length).toBeLessThan(universo.length);
    for (const c of gratuitos) expect(c.PAGO_MENSUAL).toBe("GRATUITO");
  });

  it("nivel media requiere ofrece_media", () => {
    const media = filtrarUniverso(universo, { nivel: "media" });
    for (const c of media) expect(c.ofrece_media).toBe(true);
  });

  it("dependencia pública devuelve solo COD_DEPE=6", () => {
    const pub = filtrarUniverso(universo, { dependencia: "publica" });
    for (const c of pub) expect(c.COD_DEPE).toBe(6);
  });

  it("distancia máxima limita al radio", () => {
    const cerca = filtrarUniverso(universo, { distanciaMaxKm: 1 });
    const lejos = filtrarUniverso(universo, { distanciaMaxKm: 10 });
    expect(cerca.length).toBeLessThanOrEqual(lejos.length);
  });

  it("búsqueda por texto es case-insensitive y parcial", () => {
    const graham = filtrarUniverso(universo, { q: "graham" });
    const grahamUpper = filtrarUniverso(universo, { q: "GRAHAM" });
    expect(graham.length).toBe(grahamUpper.length);
    expect(graham.length).toBeGreaterThan(0);
  });

  it("orden: los resultados salen ordenados por distancia ascendente (haversine)", () => {
    const todos = filtrarUniverso(universo, {});
    for (let i = 1; i < todos.length; i++) {
      const dPrev = distanciaKm(todos[i - 1].LATITUD, todos[i - 1].LONGITUD, LAT_PUDAHUEL, LON_PUDAHUEL);
      const dCurr = distanciaKm(todos[i].LATITUD, todos[i].LONGITUD, LAT_PUDAHUEL, LON_PUDAHUEL);
      expect(dCurr).toBeGreaterThanOrEqual(dPrev);
    }
  });

  it("combinación de filtros (gratuito + básica) reduce más que cada uno solo", () => {
    const gratuitos = filtrarUniverso(universo, { gratuito: true });
    const basica = filtrarUniverso(universo, { nivel: "basica" });
    const combo = filtrarUniverso(universo, { gratuito: true, nivel: "basica" });
    expect(combo.length).toBeLessThanOrEqual(gratuitos.length);
    expect(combo.length).toBeLessThanOrEqual(basica.length);
  });

  it("Graham Bell pasa filtros de básica + público + gratuito", () => {
    const c = getColegio(10090);
    expect(c).not.toBeNull();
    expect(pasaFiltros(c!, {
      gratuito: true,
      nivel: "basica",
      dependencia: "publica",
    })).toBe(true);
  });
});
