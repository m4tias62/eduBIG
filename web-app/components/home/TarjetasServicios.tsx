"use client";

import Link from "next/link";
import { useComparar } from "@/lib/comparar";
import { cn } from "@/lib/utils";
import { Ilustracion, type NombreIlustracion } from "@/components/ui/Ilustracion";

/**
 * «¿Qué hacemos?» (v3, Figma «Cards servicios», nodo 841:1165): las tres
 * promesas de Edubig (D31) como tarjetas enlazadas.
 *
 * Estados (diseño de Matías):
 * - Reposo: sin borde.
 * - Hover: borde de 1 px en rdbu-10, sombra y título subrayado.
 * - Presionado: borde de 2 px en rdbu-10 (el segundo píxel es una sombra
 *   interior, para que el contenido no salte), sombra y título subrayado.
 * - Foco: borde de 1 px en rdbu-10, contorno exterior de 2 px en rdbu-11 a
 *   3 px de distancia, sombra y título subrayado.
 *
 * Ilustraciones (Matías, 2026-11-05): primero se agrandaron (a 144 px no se
 * notaba el pixel art); luego, con sus versiones rediseñadas, quedaron a
 * 208 px de alto y con 16 px entre tarjetas, para que el borde de un estado
 * no toque la ilustración ni la tarjeta vecina.
 *
 * Nombre accesible: el título; la descripción va como descripción, para que
 * la lista de enlaces del lector de pantalla no lea el párrafo completo.
 */
const SERVICIOS: Array<{
  id: string;
  ilustracion: NombreIlustracion;
  titulo: string;
  texto: string;
  destino: "test" | "explorar" | "comparar";
}> = [
  {
    id: "recomendar",
    ilustracion: "recomendar",
    titulo: "Recomendar",
    texto: "El Test de Calce arma una lista de 3 colegios según lo que tu familia necesita y prioriza.",
    destino: "test",
  },
  {
    id: "explorar",
    ilustracion: "explorar",
    titulo: "Explorar",
    texto: "Más de 8.000 colegios de todo Chile, con sus datos oficiales traducidos.",
    destino: "explorar",
  },
  {
    id: "comparar",
    ilustracion: "comparar",
    titulo: "Comparar",
    texto:
      "Pon colegios lado a lado (3 en el celular, 4 en el computador). Cada dato se lee contra colegios similares, nunca como ranking.",
    destino: "comparar",
  },
];

export function TarjetasServicios() {
  const { url: urlComparar } = useComparar();
  const href = { test: "/test", explorar: "/#explorar", comparar: urlComparar };

  return (
    <ul className="mx-auto flex max-w-md flex-col gap-m lg:grid lg:max-w-6xl lg:grid-cols-3 lg:gap-m lg:px-xl">
      {SERVICIOS.map((s) => (
        <li key={s.id} className="flex">
          <Link
            href={href[s.destino]}
            aria-labelledby={`servicio-${s.id}`}
            aria-describedby={`servicio-${s.id}-texto`}
            // Clases escritas completas: Tailwind no detecta clases armadas con variables.
            className={cn(
              "group flex w-full flex-col items-center gap-l border border-transparent px-xs pb-xs pt-m transition-shadow",
              "hover:border-rdbu-10 hover:shadow-[0_4px_4px_rgba(0,0,0,0.25)]",
              "active:border-rdbu-10 active:shadow-[inset_0_0_0_1px_#b2181f,0_4px_4px_rgba(0,0,0,0.25)]",
              "focus-visible:border-rdbu-10 focus-visible:shadow-[0_4px_4px_rgba(0,0,0,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-rdbu-11"
            )}
          >
            <Ilustracion nombre={s.ilustracion} />
            <span className="flex w-full flex-col gap-xxs">
              <span
                id={`servicio-${s.id}`}
                className="text-sm font-bold uppercase leading-[24px] text-texto-primario group-hover:underline group-focus-visible:underline group-active:underline"
              >
                {s.titulo}
              </span>
              <span id={`servicio-${s.id}-texto`} className="text-xs leading-[21px] text-texto-primario">
                {s.texto}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
