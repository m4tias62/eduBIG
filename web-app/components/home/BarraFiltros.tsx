"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { FiltrosHome, Dependencia } from "@/lib/home/filtros";
import { ControlUbicacion } from "@/components/ui/ControlUbicacion";

/**
 * BarraFiltros — chips de filtro con acordeón desplegable (browse mode).
 *
 * Reemplaza a los FiltroChip que solo "ciclaban" valores. Comportamientos:
 *  - Gratuito: toggle directo (aplica al instante).
 *  - Nivel / Distancia / Tipo de colegio: al hacer click abren un panel
 *    acordeón debajo de la fila con sus opciones.
 *      · Nivel  → checkboxes Básica / Media (una o ambas → basica_y_media).
 *      · Tipo   → checkboxes multi-selección (Pública / Subv. / Pagado).
 *      · Distancia → radios (una sola opción: radio máximo desde Pudahuel).
 *
 * URL-driven igual que antes: cada cambio serializa los filtros en la query
 * (?gratuito, ?nivel, ?dist, ?dep) con router.replace({ scroll:false }). Como
 * es una navegación "soft" y este componente no se desmonta, el panel abierto
 * se mantiene mientras seleccionás varias opciones.
 *
 * Los chips van en una sola línea con scroll horizontal (no se cortan en dos
 * filas); el panel se renderiza fuera del contenedor scrolleable para que no
 * quede recortado.
 */

type PanelId = "nivel" | "distancia" | "tipo";

const NIVELES: { key: "basica" | "media"; label: string }[] = [
  { key: "basica", label: "Básica" },
  { key: "media", label: "Media" },
];

const TIPOS: { key: Dependencia; label: string }[] = [
  { key: "publica", label: "Pública (SLEP)" },
  { key: "part_subvencionado", label: "Particular subvencionado" },
  { key: "part_pagado", label: "Particular pagado" },
];

const DISTANCIAS: { value: number; label: string }[] = [
  { value: 1, label: "Hasta 1 km" },
  { value: 2, label: "Hasta 2 km" },
  { value: 5, label: "Hasta 5 km" },
];

export function BarraFiltros({
  vista,
  filtros,
}: {
  vista: "lista" | "mapa";
  filtros: FiltrosHome;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState<PanelId | null>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);

  // Cerrar el panel al hacer click fuera de la barra completa.
  useEffect(() => {
    if (!abierto) return;
    function onDown(e: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(e.target as Node)
      ) {
        setAbierto(null);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [abierto]);

  /** Serializa un set de filtros y navega sin resetear el scroll. */
  function navegar(next: FiltrosHome) {
    const p = new URLSearchParams();
    if (next.q) p.set("q", next.q);
    if (next.gratuito) p.set("gratuito", "1");
    if (next.nivel) p.set("nivel", next.nivel);
    if (next.distanciaMaxKm !== undefined) p.set("dist", String(next.distanciaMaxKm));
    if (next.dependencias && next.dependencias.length)
      p.set("dep", next.dependencias.join(","));
    p.set("vista", vista);
    router.replace(`/?${p.toString()}`, { scroll: false });
  }

  function alternarPanel(id: PanelId) {
    setAbierto((prev) => (prev === id ? null : id));
  }

  // --- Gratuito (toggle directo) ---
  function toggleGratuito() {
    navegar({ ...filtros, gratuito: filtros.gratuito ? undefined : true });
  }

  // --- Nivel (checkboxes básica / media → enum) ---
  const nivelSel = {
    basica: filtros.nivel === "basica" || filtros.nivel === "basica_y_media",
    media: filtros.nivel === "media" || filtros.nivel === "basica_y_media",
  };
  function toggleNivel(k: "basica" | "media") {
    const s = { ...nivelSel, [k]: !nivelSel[k] };
    const nivel: FiltrosHome["nivel"] =
      s.basica && s.media ? "basica_y_media"
      : s.basica ? "basica"
      : s.media ? "media"
      : undefined;
    navegar({ ...filtros, nivel });
  }

  // --- Tipo de colegio (multi-selección) ---
  const tiposSel = new Set<Dependencia>(filtros.dependencias ?? []);
  function toggleTipo(k: Dependencia) {
    const s = new Set(tiposSel);
    if (s.has(k)) s.delete(k);
    else s.add(k);
    navegar({ ...filtros, dependencias: s.size ? Array.from(s) : undefined });
  }

  // --- Distancia (radio) ---
  function setDistancia(v: number | undefined) {
    navegar({ ...filtros, distanciaMaxKm: v });
  }

  // Estado activo + etiquetas dinámicas de cada chip.
  const nivelActivo = filtros.nivel !== undefined;
  const nivelLabel = !nivelActivo
    ? "Nivel"
    : filtros.nivel === "basica_y_media" ? "Básica y Media"
    : filtros.nivel === "basica" ? "Básica"
    : "Media";

  const distActivo = filtros.distanciaMaxKm !== undefined;
  const distLabel = distActivo ? `Hasta ${filtros.distanciaMaxKm} km` : "Distancia";

  const tipoActivo = tiposSel.size > 0;
  const tipoLabel =
    !tipoActivo ? "Tipo de colegio"
    : tiposSel.size === 1 ? TIPOS.find((t) => tiposSel.has(t.key))!.label
    : `Tipo (${tiposSel.size})`;

  return (
    <div ref={contenedorRef} className="flex flex-col gap-xs">
      {/* Fila de chips — una sola línea, scroll horizontal en móvil */}
      <div className="flex items-center gap-xs overflow-x-auto no-scrollbar -mx-l px-l">
        <ChipToggle label="Gratuito" activo={!!filtros.gratuito} onClick={toggleGratuito} />
        <ChipDesplegable
          label={nivelLabel}
          activo={nivelActivo}
          abierto={abierto === "nivel"}
          onClick={() => alternarPanel("nivel")}
        />
        <ChipDesplegable
          label={distLabel}
          activo={distActivo}
          abierto={abierto === "distancia"}
          onClick={() => alternarPanel("distancia")}
        />
        <ChipDesplegable
          label={tipoLabel}
          activo={tipoActivo}
          abierto={abierto === "tipo"}
          onClick={() => alternarPanel("tipo")}
        />
      </div>

      {/* Panel acordeón — debajo de la fila, ancho completo, sin recorte */}
      {abierto === "nivel" && (
        <PanelFiltro
          titulo="Nivel educativo"
          onLimpiar={nivelActivo ? () => navegar({ ...filtros, nivel: undefined }) : undefined}
        >
          {NIVELES.map((n) => (
            <OpcionCheck
              key={n.key}
              label={n.label}
              checked={nivelSel[n.key]}
              onClick={() => toggleNivel(n.key)}
            />
          ))}
        </PanelFiltro>
      )}

      {abierto === "distancia" && (
        <PanelFiltro
          titulo="Distancia"
          onLimpiar={distActivo ? () => setDistancia(undefined) : undefined}
        >
          <ControlUbicacion className="border-b border-borde-sutil pb-xs mb-xxs" />
          {DISTANCIAS.map((d) => (
            <OpcionRadio
              key={d.value}
              label={d.label}
              checked={filtros.distanciaMaxKm === d.value}
              onClick={() => setDistancia(d.value)}
            />
          ))}
          <OpcionRadio
            label="Sin límite"
            checked={filtros.distanciaMaxKm === undefined}
            onClick={() => setDistancia(undefined)}
          />
        </PanelFiltro>
      )}

      {abierto === "tipo" && (
        <PanelFiltro
          titulo="Tipo de colegio"
          onLimpiar={tipoActivo ? () => navegar({ ...filtros, dependencias: undefined }) : undefined}
        >
          {TIPOS.map((t) => (
            <OpcionCheck
              key={t.key}
              label={t.label}
              checked={tiposSel.has(t.key)}
              onClick={() => toggleTipo(t.key)}
            />
          ))}
        </PanelFiltro>
      )}
    </div>
  );
}

/* ---------- Sub-componentes ---------- */

function ChipToggle({
  label,
  activo,
  onClick,
}: {
  label: string;
  activo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={cn(
        "inline-flex items-center gap-xxs rounded-s px-m py-xs text-xs whitespace-nowrap shrink-0 border transition-colors",
        activo
          ? "bg-temp-calido-profundo text-texto-sobre-oscuro border-temp-calido-profundo"
          : "bg-superficie-base text-temp-frio-profundo border-temp-frio-profundo hover:bg-temp-frio-suave"
      )}
    >
      {label}
    </button>
  );
}

function ChipDesplegable({
  label,
  activo,
  abierto,
  onClick,
}: {
  label: string;
  activo: boolean;
  abierto: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={abierto}
      className={cn(
        "inline-flex items-center gap-xxs rounded-s px-m py-xs text-xs whitespace-nowrap shrink-0 border transition-colors",
        activo
          ? "bg-temp-calido-profundo text-texto-sobre-oscuro border-temp-calido-profundo"
          : "bg-superficie-base text-temp-frio-profundo border-temp-frio-profundo hover:bg-temp-frio-suave",
        !activo && abierto && "bg-temp-frio-suave"
      )}
    >
      {label}
      <Icon
        nombre="arrow_drop_down"
        size={16}
        className={cn(
          "transition-transform",
          abierto && "rotate-180",
          activo ? "text-texto-sobre-oscuro" : "text-temp-frio-profundo"
        )}
      />
    </button>
  );
}

function PanelFiltro({
  titulo,
  onLimpiar,
  children,
}: {
  titulo: string;
  onLimpiar?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-m border border-borde-sutil bg-superficie-base p-m flex flex-col gap-xs shadow-sm">
      <div className="flex items-center justify-between gap-m">
        <p className="text-2xs font-bold uppercase tracking-wide text-texto-secundario">
          {titulo}
        </p>
        {onLimpiar && (
          <button
            type="button"
            onClick={onLimpiar}
            className="text-2xs font-medium text-interaccion-enlace hover:text-interaccion-enlace-hover"
          >
            Limpiar
          </button>
        )}
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function OpcionCheck({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onClick}
      className="flex items-center gap-xs py-xs text-left"
    >
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-s border transition-colors",
          checked
            ? "bg-temp-calido-profundo border-temp-calido-profundo"
            : "bg-superficie-base border-borde-definido"
        )}
      >
        {checked && <Icon nombre="check" size={16} className="text-texto-sobre-oscuro" />}
      </span>
      <span className="text-xs text-texto-primario">{label}</span>
    </button>
  );
}

function OpcionRadio({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onClick}
      className="flex items-center gap-xs py-xs text-left"
    >
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
          checked ? "border-temp-calido-profundo" : "border-borde-definido"
        )}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-temp-calido-profundo" />}
      </span>
      <span className="text-xs text-texto-primario">{label}</span>
    </button>
  );
}
