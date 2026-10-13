/** Regiones de Chile, de norte a sur (códigos del dataset nacional). */
export const REGIONES: Array<{ cod: string; nombre: string }> = [
  { cod: "AYP", nombre: "Arica y Parinacota" },
  { cod: "TPCA", nombre: "Tarapacá" },
  { cod: "ANTOF", nombre: "Antofagasta" },
  { cod: "ATCMA", nombre: "Atacama" },
  { cod: "COQ", nombre: "Coquimbo" },
  { cod: "VALPO", nombre: "Valparaíso" },
  { cod: "RM", nombre: "Metropolitana" },
  { cod: "LGBO", nombre: "O'Higgins" },
  { cod: "MAULE", nombre: "Maule" },
  { cod: "NUBLE", nombre: "Ñuble" },
  { cod: "BBIO", nombre: "Biobío" },
  { cod: "ARAUC", nombre: "La Araucanía" },
  { cod: "RIOS", nombre: "Los Ríos" },
  { cod: "LAGOS", nombre: "Los Lagos" },
  { cod: "AYSEN", nombre: "Aysén" },
  { cod: "MAG", nombre: "Magallanes" },
];

export const REGION_NOMBRE: Record<string, string> = Object.fromEntries(
  REGIONES.map((r) => [r.cod, r.nombre])
);
