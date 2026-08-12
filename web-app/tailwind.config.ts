import type { Config } from "tailwindcss";

/**
 * Edubig design tokens — espejo de las variables de Figma.
 *
 * Convenciones:
 * - Colores semánticos (superficie, texto, borde, estado) apuntan a valores
 *   directos. Los aliases de Figma a la librería gob.cl (Blanco/Base,
 *   Negro/Text, etc.) se resuelven aquí con valores estándar Material.
 * - Escala RdBu (rdbu-01..rdbu-11) queda disponible como paleta primitiva
 *   pero SU USO ESTÁ RESERVADO al eje temperatura frío/cálido — NO usar
 *   para semáforos, juicio de datos ni superficies UI.
 * - Espaciado, radios y tipografía siguen la escala semántica de Figma.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Superficies
        "superficie-base": "#FFFFFF",
        "superficie-elevada": "#F5F5F5",
        "superficie-hundida": "#EAEAEA",
        "superficie-inversa": "#1F1F1F",

        // Texto sobre superficies claras
        "texto-primario": "#1F1F1F",
        "texto-secundario": "rgba(0, 0, 0, 0.54)",
        "texto-terciario": "rgba(0, 0, 0, 0.26)",
        "texto-sutil": "rgba(0, 0, 0, 0.12)",

        // Texto sobre superficies oscuras
        "texto-sobre-oscuro": "#FFFFFF",
        "texto-sobre-oscuro-secundario": "rgba(255, 255, 255, 0.78)",
        "texto-sobre-oscuro-terciario": "rgba(255, 255, 255, 0.26)",

        // Bordes
        "borde-sutil": "rgba(0, 0, 0, 0.12)",
        "borde-definido": "#B8B8B8",
        "borde-enfatico": "#757575",

        // Estados
        "exito-fuerte": "#1E6A2E",
        "exito-suave": "#E8F5EA",
        "error-fuerte": "#B3261E",
        "error-suave": "#FDECEA",
        "advertencia-fuerte": "#8A6D00",
        "advertencia-suave": "#FFF6DE",
        "info-fuerte": "#1A5FB4",
        "info-suave": "#E8F0FE",

        // Interacción
        "interaccion-foco": "#005FCC",
        "interaccion-foco-texto": "#FFFFFF",
        "interaccion-enlace": "#0958D9",
        "interaccion-enlace-hover": "#003EB3",
        "interaccion-enlace-activo": "#001D66",

        // Paleta primitiva RdBu (SOLO para eje temperatura)
        "rdbu-01": "#053061",
        "rdbu-02": "#2166ac",
        "rdbu-03": "#4393c3",
        "rdbu-04": "#92c5de",
        "rdbu-05": "#d1e5f0",
        "rdbu-06": "#f7f7f7",
        "rdbu-07": "#fddbc7",
        "rdbu-08": "#f4a582",
        "rdbu-09": "#d6604d",
        "rdbu-10": "#b2181f",
        "rdbu-11": "#67001f",

        // Aliases semánticos de temperatura (referencia al RdBu)
        "temp-frio-profundo": "#4393c3",
        "temp-frio-medio": "#92c5de",
        "temp-frio-suave": "#d1e5f0",
        "temp-neutro": "#f7f7f7",
        "temp-calido-suave": "#fddbc7",
        "temp-calido-pleno": "#f4a582",
        "temp-calido-profundo": "#d6604d",
      },

      fontFamily: {
        // Se importan en app/globals.css via @import de Google Fonts.
        heading: ['"Work Sans"', "system-ui", "sans-serif"],
        body: ["Roboto", "system-ui", "sans-serif"],
      },

      fontSize: {
        // Escala tipográfica de Figma (tamaño/*)
        "2xs": ["12px", { lineHeight: "1.5" }],
        xs: ["14px", { lineHeight: "1.5" }],
        sm: ["16px", { lineHeight: "1.5" }],
        md: ["18px", { lineHeight: "1.5" }],
        lg: ["24px", { lineHeight: "1.3" }],
        xl: ["32px", { lineHeight: "1.2" }],
      },

      fontWeight: {
        regular: "400",
        medium: "500",
        bold: "700",
      },

      spacing: {
        // Escala espaciado semántica (espaciado/*)
        xxs: "4px",
        xs: "8px",
        s: "12px",
        m: "16px",
        l: "24px",
        xl: "32px",
        xxl: "48px",
      },

      borderRadius: {
        none: "0",
        s: "4px",
        m: "8px",
        l: "12px",
        xl: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
