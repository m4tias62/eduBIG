import { describe, it, expect, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { FichaColegio } from "@/components/ficha/FichaColegio";
import { getDetalle, getIndice } from "@/lib/data/servidor";

// La ficha usa el router de Next (BotonVolver); en el test basta un doble.
vi.mock("next/navigation", () => ({ useRouter: () => ({ back() {}, push() {} }) }));

/**
 * Render de fichas reales del dataset nacional, incluidos los estados sin
 * comparación (D19, D24) y sin dato de costo (D36).
 */
describe("FichaColegio", () => {
  it("Liceo Ciudad de Brasilia (10130): media, con trayectoria", () => {
    const d = getDetalle(10130)!;
    const html = renderToString(<FichaColegio detalle={d} />);
    expect(html).toContain("Liceo Ciudad de Brasilia");
    expect(html).toContain("Ingreso a la universidad");
    expect(html).toContain("Sobre colegios similares en las dos materias");
  });

  it("Escuela Alexander Graham Bell (10090): básica, sin módulo de trayectoria", () => {
    const html = renderToString(<FichaColegio detalle={getDetalle(10090)!} />);
    expect(html).toContain("Escuela Alexander Graham Bell");
    expect(html).not.toContain("Ingreso a la universidad");
  });

  it("colegio sin GSE: dice que no hay SIMCE publicado (D19)", () => {
    const sinGse = getIndice().find((c) => !c.cmp && c.s === undefined)!;
    const d = getDetalle(sinGse.rbd)!;
    const html = renderToString(<FichaColegio detalle={d} />);
    expect(html).toMatch(/no tiene SIMCE 2025 publicado|no publicó resultados SIMCE/);
  });

  it("colegio particular subvencionado sin dato de costo (D36)", () => {
    const c = getIndice().find((x) => x.k === "sin_dato")!;
    const html = renderToString(<FichaColegio detalle={getDetalle(c.rbd)!} />);
    expect(html).toContain("Sin dato de costo");
  });

  it("todas las fichas de una comuna grande renderizan", () => {
    const rbds = getIndice().filter((c) => c.c === 13201).map((c) => c.rbd);
    for (const rbd of rbds) {
      expect(() => renderToString(<FichaColegio detalle={getDetalle(rbd)!} />)).not.toThrow();
    }
  });
});
