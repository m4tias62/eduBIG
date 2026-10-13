"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * El footer acompaña a todas las páginas salvo las preguntas del Test y la
 * pantalla de carga (pantallas inmersivas). Vive en el layout, fuera de
 * <main>, para que funcione como región "contentinfo" (WCAG 1.3.1).
 */
export function PieCondicional({ children }: { children: ReactNode }) {
  const ruta = usePathname() ?? "/";
  if (ruta.startsWith("/test") && !ruta.startsWith("/test/resultado")) return null;
  return <>{children}</>;
}
