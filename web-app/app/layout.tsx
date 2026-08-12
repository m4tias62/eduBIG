import type { Metadata } from "next";
import "./globals.css";

/**
 * metadataBase resuelve URLs relativas de OG/Twitter a absolutas.
 * En Vercel se toma automáticamente del env VERCEL_URL. Localmente
 * cae a localhost:3000.
 */
const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const TITULO = "Edubig — Encuentra el colegio que calza con tu familia";
const DESCRIPCION =
  "Traducimos datos oficiales del Mineduc, Agencia de Calidad y Supereduc en información accesible para familias que están eligiendo colegio en Pudahuel.";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: TITULO,
  description: DESCRIPCION,
  applicationName: "Edubig",
  authors: [{ name: "Matías Cáceres" }, { name: "Israel Rubilar" }],
  keywords: ["colegios", "Pudahuel", "SIMCE", "IDPS", "elegir colegio", "educación Chile"],
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    type: "website",
    locale: "es_CL",
    siteName: "Edubig",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Edubig — Encuentra el colegio que calza con tu familia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRIPCION,
    images: ["/og-image.jpg"],
  },
};

/**
 * Root layout mínimo — solo <html>/<body>. El Footer se importa en las
 * páginas que lo requieren (Home, Fichas, Resultado del quiz). Las
 * pantallas de quiz (Q1-Q5, Loading) son viewport-inmersivas y no llevan
 * Footer para no romper el flujo.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CL">
      <body className="min-h-screen bg-superficie-base">{children}</body>
    </html>
  );
}
