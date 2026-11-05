/**
 * Estética de «panel» v3 (Matías, 2026-11-05): la del contenedor de los
 * filtros (Figma 927:26930), que toma la de las tarjetas del sitio. Borde
 * rdbu-10 de 2 px arriba e izquierda y 4 px a la derecha y abajo (el
 * «volumen» en pixel art), esquinas de 4 px, sombra y fondo gris claro.
 * Se usa en el panel de filtros y en la tarjeta del Test de Calce.
 *
 * Sin overflow oculto: las listas desplegables deben poder salir del panel.
 */
export const PANEL_V3 =
  "rounded-s border-b-4 border-l-2 border-r-4 border-t-2 border-rdbu-10 bg-superficie-elevada shadow-[0_3px_4px_rgba(0,0,0,0.25)]";

/** Lo mismo, solo desde escritorio (en móvil el Test va sin tarjeta, a todo el ancho). */
export const PANEL_V3_LG =
  "lg:rounded-s lg:border-b-4 lg:border-l-2 lg:border-r-4 lg:border-t-2 lg:border-rdbu-10 lg:bg-superficie-elevada lg:shadow-[0_3px_4px_rgba(0,0,0,0.25)]";
