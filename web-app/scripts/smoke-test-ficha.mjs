// Smoke test: renderiza fichas a HTML con react-dom/server para validar
// que los componentes de Fase 2 funcionan sin depender del build de Next.
//
// Uso: node --loader ts-node/esm scripts/smoke-test-ficha.mjs
// (o mejor: transpile a JS y correr con node)
//
// Se usa desde el CI de shell para probar rápido sin arrancar Next dev.

import { renderToString } from "react-dom/server";
import React from "react";
import { FichaColegio } from "../components/ficha/FichaColegio.js";
import { getColegio, getConclusionesColegio } from "../lib/data/schools.js";

const rbdsPrueba = [10090, 10130, 10077];

for (const rbd of rbdsPrueba) {
  const colegio = getColegio(rbd);
  const conclusiones = getConclusionesColegio(rbd);
  if (!colegio) {
    console.log(`✗ RBD ${rbd}: no encontrado`);
    continue;
  }
  const html = renderToString(
    React.createElement(FichaColegio, { colegio, conclusiones })
  );
  console.log(`✓ RBD ${rbd} · ${colegio.NOM_RBD} · ${html.length} bytes HTML`);
}
