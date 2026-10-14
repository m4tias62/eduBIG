"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Isologo from "./Isologo";
import { useComparar } from "@/lib/comparar";
import { cn } from "@/lib/utils";

/**
 * Navegación superior de ESCRITORIO (≥ 1024 px): hace visibles las tres
 * promesas (D31) desde cualquier página, incluido el Test de Calce (decisión
 * de Matías, 2026-10-14: el Test es parte del sitio, no una página aparte).
 * El Test mantiene el lugar de CTA principal. En móvil no se muestra: ahí la
 * navegación sigue siendo el botón Volver y los enlaces de cada pantalla.
 */
export const ALTO_NAV = 64;

export function BarraNavegacion() {
  const ruta = usePathname() ?? "/";
  const { rbds } = useComparar();
  const enTest = ruta.startsWith("/test");

  const enlace = (href: string, label: string, activo: boolean) => (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={cn(
        "min-h-[44px] inline-flex items-center px-s text-xs font-bold border-b-2",
        activo
          ? "border-texto-primario text-texto-primario"
          : "border-transparent text-texto-secundario hover:text-texto-primario"
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="hidden lg:block sticky top-0 z-40 bg-superficie-base border-b border-borde-sutil">
      {/* Misma retícula que el resto del sitio (.contenedor), en todas las páginas.
          min-h y no h fija: el texto puede crecer sin cortarse (WCAG 1.4.12). */}
      <nav aria-label="Principal" className="contenedor flex min-h-16 items-center justify-between">
        <Link href="/" aria-label="Edubig, inicio" className="inline-flex items-center">
          <Isologo width={72} priority />
        </Link>
        <div className="flex items-center gap-m">
          {enlace("/explorar", "Explorar colegios", ruta.startsWith("/explorar") || ruta.startsWith("/colegio"))}
          {enlace(
            rbds.length ? `/comparar?rbd=${rbds.join(",")}` : "/comparar",
            rbds.length ? `Comparar colegios (${rbds.length})` : "Comparar colegios",
            ruta.startsWith("/comparar")
          )}
          <Link
            href="/test"
            aria-current={enTest ? "page" : undefined}
            className="ml-s min-h-[44px] inline-flex items-center rounded-m bg-interaccion-enlace px-l text-xs font-bold text-texto-sobre-oscuro hover:bg-interaccion-enlace-hover"
          >
            Hacer el Test de Calce
          </Link>
        </div>
      </nav>
    </header>
  );
}
