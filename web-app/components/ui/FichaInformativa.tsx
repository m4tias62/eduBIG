import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

/**
 * Ficha informativa (v3, componente «Información» de Matías, Figma 927:26816).
 * Bloque de texto para leer con calma: cómo usar una sección, alertas o
 * avisos. Anotación de Matías: «este elemento de información se debe aplicar
 * a otras secciones donde haya información que deba leerse, por ejemplo en
 * las fichas o en las "alertas o avisos" en las comparaciones».
 *
 * Usos (fondo, ícono):
 * - informativo: info-suave (#BBDEFB), «info».
 * - alerta: advertencia-suave (#FFCCBC), «warning».
 * - aviso: exito-suave (#C8E6C9), «notifications».
 * Cada uso tiene su propio ícono (misma familia, Material Symbols), para que
 * la diferencia no dependa solo del color (WCAG 1.4.1). En alerta y aviso el
 * lector de pantalla además oye el tipo al comienzo («Alerta:», «Aviso:»).
 *
 * Forma: ícono y línea vertical de 1 px en rdbu-01 a la izquierda (25 px
 * entre ambos) y 32 px hasta el texto; título opcional en Work Sans Bold 32
 * cuando es el título de la página (h1) y 18 cuando es una sección (h2, h3);
 * párrafos en Roboto 16/24, separados por una línea en blanco (24 px).
 * Contraste del texto (#1F1F1F) sobre los tres fondos: 11,5:1 o más; de los
 * enlaces (interaccion/enlace-hover, #003078), 8,6:1 o más.
 */
export type UsoFicha = "informativo" | "alerta" | "aviso";

const FONDO: Record<UsoFicha, string> = {
  informativo: "bg-info-suave",
  alerta: "bg-advertencia-suave",
  aviso: "bg-exito-suave",
};
const ICONO: Record<UsoFicha, string> = { informativo: "info", alerta: "warning", aviso: "notifications" };
const TIPO: Partial<Record<UsoFicha, string>> = { alerta: "Alerta", aviso: "Aviso" };

export function FichaInformativa({
  uso = "informativo",
  titulo,
  nivelTitulo = "h2",
  idTitulo,
  compacta = false,
  children,
  className,
}: {
  uso?: UsoFicha;
  titulo?: string;
  /** Nivel del título en la página (en Comparar es el h1). */
  nivelTitulo?: "h1" | "h2" | "h3";
  idTitulo?: string;
  /** Para columnas angostas (celdas de Comparar): separaciones de 12–16 px
   *  en vez de 25–32, para que el texto no quede en una columna mínima. */
  compacta?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const Titulo = nivelTitulo;
  const tipo = TIPO[uso];
  return (
    <div className={cn("flex gap-m px-m pb-[11px] pt-s", !compacta && "sm:gap-xl sm:px-l", FONDO[uso], className)}>
      {/* Ícono y línea: decorativos. */}
      <div aria-hidden className={cn("flex shrink-0 items-start gap-s", !compacta && "sm:gap-[25px]")}>
        <Icon nombre={ICONO[uso]} size={24} className="text-rdbu-01" />
        <span className="w-px self-stretch bg-rdbu-01" />
      </div>
      <div className="flex min-w-0 max-w-[851px] flex-col gap-[20px] text-sm leading-[24px] text-texto-primario">
        {titulo && (
          // Título de página (h1) en 32 px, como en Figma; dentro de una
          // página (h2, h3), 18 px, para no competir con el título de la página.
          <Titulo
            id={idTitulo}
            className={cn(
              "font-heading font-bold leading-[1.2] tracking-[0.015em]",
              nivelTitulo === "h1" ? "text-lg sm:text-xl" : "text-md"
            )}
          >
            {titulo}
          </Titulo>
        )}
        {/* Enlaces escritos dentro de la ficha: los estados del enlace del
            sitio (Enlace, sobre color): #003078 (8,6:1 o más sobre los tres
            fondos), subrayado de 1 px que pasa a 2 px en hover y presionado,
            fondo celeste claro al presionar y foco en rdbu-01. */}
        <div className="[&>p+p]:mt-l [&_a:active]:bg-interaccion-tinte [&_a:focus-visible]:outline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-rdbu-01 [&_a:hover]:decoration-2 [&_a]:text-interaccion-enlace-hover [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-[3px]">
          {tipo && <span className="sr-only">{tipo}: </span>}
          {children}
        </div>
      </div>
    </div>
  );
}
