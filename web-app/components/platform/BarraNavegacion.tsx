"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Isologo from "./Isologo";
import { AvisoEnConstruccion } from "./AvisoEnConstruccion";
import { BotonEnlace } from "@/components/ui/Boton";
import { EnlaceTexto } from "@/components/ui/EnlaceTexto";
import { useComparar } from "@/lib/comparar";

/**
 * Navegación superior de ESCRITORIO (≥ 1024 px). En móvil no se muestra: ahí
 * la navegación sigue siendo el botón Volver, los enlaces de cada pantalla y
 * el footer (decisión de Matías, 2026-10-14).
 *
 * v3 (Figma «Explorar mapa + lista → Soluciones», nodo 837:897):
 * - Fondo gris (superficie-hundida).
 * - «¿Qué hacemos?» baja a las tarjetas de la Home que explican lo que hace
 *   Edubig (#que-hacemos).
 * - «Explorar colegios» sale de la barra: la exploración vive en la Home.
 * - «Comparar colegios» conserva el contador de colegios elegidos: dice en
 *   todo momento cuántos hay (Nielsen #1, visibilidad del estado).
 * - «Más datos sobre educación» abre un aviso de «en construcción».
 * - «Hacer el Test de Calce» sigue siendo la acción principal.
 */
export const ALTO_NAV = 64;

export function BarraNavegacion() {
  const ruta = usePathname() ?? "/";
  const { rbds, url } = useComparar();
  const enTest = ruta.startsWith("/test");

  return (
    <header className="hidden lg:block sticky top-0 z-40 bg-superficie-hundida border-b border-borde-sutil">
      {/* v3 (2026-11-05): la barra ocupa todo el ancho con 48 px a cada lado,
          como en el diseño (nodo 837:897), y el logo queda alineado con el
          título del hero. min-h y no h fija: el texto puede crecer sin
          cortarse (WCAG 1.4.12). */}
      <nav aria-label="Principal" className="flex min-h-16 w-full items-center justify-between px-xxl">
        <Link href="/" aria-label="Edubig, inicio" className="inline-flex items-center rounded-m transition-opacity hover:opacity-80">
          <Isologo width={72} priority />
        </Link>
        <div className="flex items-center gap-m">
          <EnlaceTexto href="/#que-hacemos">¿Qué hacemos?</EnlaceTexto>
          <EnlaceTexto href={url} aria-current={ruta.startsWith("/comparar") ? "page" : undefined}>
            {rbds.length ? `Comparar colegios (${rbds.length})` : "Comparar colegios"}
          </EnlaceTexto>
          <AvisoEnConstruccion etiqueta="Más datos sobre educación" />
          <BotonEnlace href="/test" aria-current={enTest ? "page" : undefined} className="ml-s">
            Hacer el Test de Calce
          </BotonEnlace>
        </div>
      </nav>
    </header>
  );
}
