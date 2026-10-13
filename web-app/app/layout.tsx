import type { Metadata } from "next";
import "./globals.css";
import { UbicacionProvider } from "@/lib/ubicacion";

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
  "Traducimos datos oficiales del Mineduc, la Agencia de Calidad y la Supereduc en información clara para familias que están eligiendo colegio en Chile.";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: TITULO,
  description: DESCRIPCION,
  applicationName: "Edubig",
  authors: [{ name: "Matías Cáceres" }, { name: "Israel Rubilar" }],
  keywords: ["colegios", "Chile", "SIMCE", "IDPS", "elegir colegio", "educación Chile"],
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
 * Root layout — <html>/<body> + proveedor de ubicación (vive en sessionStorage
 * y se comparte entre Test, exploración y shortlist). El Footer se importa en
 * las páginas que lo requieren; las pantallas del Test no lo llevan.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CL">
      <body className="min-h-screen bg-superficie-base">
        <UbicacionProvider>{children}</UbicacionProvider>
      </body>
    </html>
  );
}
