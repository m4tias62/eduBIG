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
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
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
        // 2026-10-14: 0,54 → 0,60. Con 0,54 no llegaba a 4,5:1 sobre los grises
        // del sitio (4,49:1 sobre superficie-elevada, 4,39:1 sobre
        // superficie-hundida). Con 0,60: 5,7:1 en blanco, 5,6:1 en F5 y 5,4:1 en EA.
        "texto-secundario": "rgba(0, 0, 0, 0.6)",
        "texto-terciario": "#767676",       // auditoría WCAG 2.2 sep-2026: 1,8 → 4,5:1
        "texto-sutil": "rgba(0, 0, 0, 0.12)",

        // Texto sobre superficies oscuras
        "texto-sobre-oscuro": "#FFFFFF",
        "texto-sobre-oscuro-secundario": "rgba(255, 255, 255, 0.78)",
        "texto-sobre-oscuro-terciario": "rgba(255, 255, 255, 0.26)",

        // Bordes
        "borde-sutil": "rgba(0, 0, 0, 0.12)",
        "borde-definido": "#8C8C8C",        // auditoría WCAG 2.2 sep-2026: 2,0 → 3,4:1
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
        "temp-calido-acento": "#b2181f",    // auditoría WCAG 2.2 sep-2026

        // Visualización de datos (Comparar colegios, oct-2026; diseño en Claude Design).
        // Color por POSICIÓN del colegio en la comparación (1–4). viz-colegio-1 es
        // también «este colegio» en la ficha. Color = de quién es el dato, nunca juicio.
        "viz-colegio-1": "#007d79", // reemplaza a viz-serie-este (#009d9a): 4,99:1 sobre blanco
        "viz-colegio-2": "#6929c4",
        "viz-colegio-3": "#d3354f",
        "viz-colegio-4": "#012749",
        "viz-colegio-numero": "#FFFFFF",
        // Referencia y estado frente a colegios similares
        "viz-similares-marca": "#1F1F1F", // reemplaza a viz-serie-similares (#4a62d1)
        "viz-similares-halo": "#FFFFFF",
        "viz-sobre": "#1E6A2E",    // = exito-fuerte · solo significancia 1
        "viz-bajo": "#8A6D00",     // = advertencia-fuerte · solo significancia −1
        "viz-a-la-par": "#767676", // = texto-terciario · significancia 0
        "viz-pista": "#EAEAEA",    // = superficie-hundida
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
        // Medidas de visualización y componentes (Comparar colegios, oct-2026)
        "viz-trazado-alto": "48px",
        "viz-trazado-alto-ficha": "168px",
        "viz-marca-alto": "12px",
        "viz-columna-ancho": "28px",
        "viz-columna-ancho-ficha": "40px",
        "viz-eje-ancho": "36px",
        "viz-similares-ancho": "2px",
        "viz-similares-sobresale": "4px",
        "viz-separacion": "2px",
        "viz-punto": "6px",
        "viz-punto-separacion": "3px",
        "viz-puntos-columna": "36px",
        marcador: "28px",
        "chip-alto": "24px",
        "interruptor-ancho": "40px",
        "interruptor-alto": "24px",
        "interruptor-perilla": "16px",
        "icono-s": "16px",
        "icono-m": "20px",
        "icono-l": "24px",
        "objetivo-tactil": "44px",
        "nav-alto": "64px",
        "encabezado-compacto-alto": "64px",
        "barra-colegios-alto": "112px",
      },

      backgroundImage: {
        "viz-faltante-trama":
          "repeating-linear-gradient(135deg, rgba(0,0,0,0.06) 0 2px, transparent 2px 6px)",
      },

      borderWidth: { colegio: "4px" },

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
