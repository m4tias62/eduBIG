import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { FichaColegio } from "@/components/ficha/FichaColegio";
import { getColegio, getConclusionesColegio, getUniverso } from "@/lib/data/schools";

/**
 * Test de integración de Fase 2 — renderiza fichas reales a HTML con
 * react-dom/server y valida que:
 *   1. Los componentes se montan sin errores runtime.
 *   2. Contienen los strings esperados (nombre del colegio, conclusiones,
 *      labels de módulos, texto de fuentes).
 *
 * NO valida estilos ni interacción — para eso está el navegador. Este
 * suite atrapa regresiones de datos / props / imports rápidamente.
 */

// Nombres esperados en sentence case (los que produce identidad.nombre del
// pipeline). Si la ficha no encuentra conclusiones, cae al NOM_RBD en ALL CAPS.
const RBDS_DEMO = [
  { rbd: 10090, esperado: "Graham Bell" },
  { rbd: 10130, esperado: "Brasilia" },
  { rbd: 10077, esperado: "Caren" },
] as const;

describe("FichaColegio — render integración", () => {
  it.each(RBDS_DEMO)("rbd $rbd contiene '$esperado' y los 4 módulos", ({ rbd, esperado }) => {
    const colegio = getColegio(rbd);
    const conclusiones = getConclusionesColegio(rbd);
    expect(colegio).not.toBeNull();

    const html = renderToString(
      <FichaColegio colegio={colegio!} conclusiones={conclusiones} />
    );

    // Nombre del colegio presente
    expect(html).toContain(esperado);

    // Los 4 módulos presentes en el encabezado
    expect(html).toContain("Seguridad");
    expect(html).toContain("Bienestar");
    expect(html).toContain("Académico");
    expect(html).toContain("Costo");

    // Lo esencial
    expect(html).toContain("Lo esencial");

    // Al menos un texto de "Fuente:" (viene de los módulos abiertos)
    expect(html).toContain("Fuente:");

    // No hay marcadores de undefined/null rotos en el output
    expect(html).not.toContain(">undefined<");
    expect(html).not.toContain(">null<");
    expect(html).not.toContain("NaN");
  });

  it("todos los 57 colegios del universo renderizan sin error", () => {
    const universo = getUniverso();
    for (const c of universo) {
      const conclusiones = getConclusionesColegio(c.rbd);
      const html = renderToString(
        <FichaColegio colegio={c} conclusiones={conclusiones} />
      );
      expect(html.length, `RBD ${c.rbd}`).toBeGreaterThan(1000);
    }
  });
});
