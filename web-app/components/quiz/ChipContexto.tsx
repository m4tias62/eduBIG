/**
 * Chip que muestra la respuesta previa en pantallas de Paso 2 (Q2b, Q5b, Q5c).
 * Espejo del elemento Figma "Chip contexto" con el glifo ↳ + copy corto.
 *
 * Reinforcement inline — el usuario ve por qué está en una pantalla de refinement.
 */
export function ChipContexto({ children }: { children: string }) {
  return (
    <p className="text-2xs text-texto-secundario italic">↳ {children}</p>
  );
}
