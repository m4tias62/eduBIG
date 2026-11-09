import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

/**
 * Enlace (v3, 2026-11-09). Pedido de Matías en Figma («Problema en los
 * links»): un solo enlace para las acciones y enlaces dentro del contenido,
 * «consistentes en todo el sitio, con estados que respeten lo que venimos
 * trabajando pero diferentes para que se entiendan lo que son».
 *
 * Se distingue del enlace de texto de la navegación (EnlaceTexto: negro en
 * negrita con raya roja; menú, «Volver», «Quitar», nombres de colegios) por
 * color, subrayado y estados a la vez (WCAG 1.4.1: el color no es la única
 * señal).
 *
 * Estados (Roboto 16 regular):
 * - Reposo: texto interaccion/enlace (#1D70B8, 5,17:1 sobre blanco),
 *   subrayado de 1 px.
 * - Hover: texto enlace-hover (#003078, 12,4:1) y subrayado de 2 px.
 * - Presionado: fondo interaccion-tinte, texto #003078 (10,82:1), subrayado
 *   de 2 px.
 * - Foco: contorno de 2 px en rdbu-01 a 2 px, como los botones.
 * Sobre fondos de color (fichas informativas, grises), con `sobreColor`, el
 * reposo ya va en #003078 (8,6:1 o más), porque #1D70B8 no alcanza 4,5:1
 * sobre el celeste.
 *
 * Usos:
 * - Suelto: 44 px de alto como mínimo (objetivo táctil); ícono opcional a la
 *   izquierda (`icono`) o a la derecha (`iconoDerecha`), sin subrayar.
 * - En línea (`enLinea`), dentro de un párrafo: toma el tamaño del texto.
 *
 * Componentes:
 * - `Enlace`: lleva a otra página o a otra parte de la página (Next Link).
 * - `AccionEnlace`: una acción en la misma página (<button>) con el mismo
 *   aspecto: compartir, ver la tabla, agregar un colegio, cambiar el lugar.
 * - `claseEnlace()`: las mismas clases, para disparadores ajenos (el globo
 *   de «¿Por qué?»).
 */
type Opciones = { enLinea?: boolean; sobreColor?: boolean };

const FOCO =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rdbu-01";

export function claseEnlace({ enLinea = false, sobreColor = false }: Opciones = {}) {
  const color = sobreColor ? "text-interaccion-enlace-hover" : "text-interaccion-enlace";
  const estados = "hover:text-interaccion-enlace-hover active:bg-interaccion-tinte active:text-interaccion-enlace-hover active:!filter-none";
  if (enLinea)
    return cn(
      color,
      estados,
      FOCO,
      "underline decoration-1 underline-offset-[3px] hover:decoration-2 active:decoration-2"
    );
  return cn(
    "group/enlace inline-flex min-h-objetivo-tactil items-center gap-xs px-xxs text-left text-sm font-normal transition-colors",
    color,
    estados,
    FOCO
  );
}

/** Texto subrayado del enlace suelto (los íconos quedan sin subrayar). */
const TEXTO =
  "underline decoration-1 underline-offset-[3px] group-hover/enlace:decoration-2 group-active/enlace:decoration-2";

function Contenido({ icono, iconoDerecha, children }: { icono?: string; iconoDerecha?: string; children: ReactNode }) {
  return (
    <>
      {icono && <Icon nombre={icono} size={20} />}
      <span className={TEXTO}>{children}</span>
      {iconoDerecha && <Icon nombre={iconoDerecha} size={20} />}
    </>
  );
}

type Comun = Opciones & { icono?: string; iconoDerecha?: string };

export function Enlace({
  enLinea,
  sobreColor,
  icono,
  iconoDerecha,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & Comun) {
  return (
    <Link {...props} className={cn(claseEnlace({ enLinea, sobreColor }), className)}>
      {enLinea ? children : <Contenido icono={icono} iconoDerecha={iconoDerecha}>{children}</Contenido>}
    </Link>
  );
}

export function AccionEnlace({
  enLinea,
  sobreColor,
  icono,
  iconoDerecha,
  className,
  children,
  type = "button",
  ...props
}: ComponentProps<"button"> & Comun) {
  return (
    <button type={type} {...props} className={cn(claseEnlace({ enLinea, sobreColor }), className)}>
      {enLinea ? children : <Contenido icono={icono} iconoDerecha={iconoDerecha}>{children}</Contenido>}
    </button>
  );
}
