"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ChipFiltro } from "@/components/ui/ChipFiltro";
import { cn } from "@/lib/utils";
import { urlExplorar, type FiltrosExploracion } from "@/lib/home/filtros";
import { TIPO_GLOSA, type TipoColegio } from "@/lib/data/formatters";

/**
 * BarraFiltros de la exploración — chips en una línea con panel acordeón.
 *  - Gratuito: toggle directo (incluye "gratuito por ley", D36).
 *  - Nivel / Tipo de colegio: panel con checkboxes.
 *  - Distancia (solo con GPS): radio máximo.
 *  - Comunas cercanas (solo con comuna): toggle.
 * Todo vive en la URL: cada combinación es compartible.
 */

type PanelId = "nivel" | "distancia" | "tipo";

const NIVELES: { key: "basica" | "media"; label: string }[] = [
  { key: "basica", label: "Básica" },
  { key: "media", label: "Media" },
];

const TIPOS: TipoColegio[] = ["publica", "part_subvencionado", "part_pagado"];

const DISTANCIAS: { value: number; label: string }[] = [
  { value: 1, label: "Hasta 1 km" },
  { value: 3, label: "Hasta 3 km" },
  { value: 5, label: "Hasta 5 km" },
];

export function BarraFiltros({
  filtros,
  modo,
}: {
  filtros: FiltrosExploracion;
  modo: "comuna" | "gps" | "nombre";
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState<PanelId | null>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    function onDown(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(null);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [abierto]);

  function navegar(next: FiltrosExploracion) {
    router.replace(urlExplorar(next), { scroll: false });
  }

  function alternarPanel(id: PanelId) {
    setAbierto((prev) => (prev === id ? null : id));
  }

  const nivelSel = {
    basica: filtros.nivel === "basica" || filtros.nivel === "basica_y_media",
    media: filtros.nivel === "media" || filtros.nivel === "basica_y_media",
  };
  function toggleNivel(k: "basica" | "media") {
    const s = { ...nivelSel, [k]: !nivelSel[k] };
    const nivel: FiltrosExploracion["nivel"] =
      s.basica && s.media ? "basica_y_media" : s.basica ? "basica" : s.media ? "media" : undefined;
    // Sin media, el orden por ingreso a la U deja de aplicar (D33).
    const orden = filtros.orden === "ingreso_u" && !s.media ? undefined : filtros.orden;
    navegar({ ...filtros, nivel, orden });
  }

  const tiposSel = new Set<TipoColegio>(filtros.tipos ?? []);
  function toggleTipo(k: TipoColegio) {
    const s = new Set(tiposSel);
    if (s.has(k)) s.delete(k);
    else s.add(k);
    navegar({ ...filtros, tipos: s.size ? Array.from(s) : undefined });
  }

  const nivelActivo = filtros.nivel !== undefined;
  const nivelLabel = !nivelActivo
    ? "Nivel"
    : filtros.nivel === "basica_y_media"
      ? "Básica y media"
      : filtros.nivel === "basica"
        ? "Básica"
        : "Media";

  const distActivo = filtros.distanciaMaxKm !== undefined;
  const distLabel = distActivo ? `Hasta ${filtros.distanciaMaxKm} km` : "Distancia";

  const tipoActivo = tiposSel.size > 0;
  const tipoLabel = !tipoActivo
    ? "Tipo de colegio"
    : tiposSel.size === 1
      ? TIPO_GLOSA[Array.from(tiposSel)[0]]
      : `Tipo (${tiposSel.size})`;

  return (
    <div ref={contenedorRef} className="flex flex-col gap-xs">
      <div className="flex items-center gap-xs overflow-x-auto no-scrollbar -mx-l px-l lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
        <ChipToggle
          label="Gratuito"
          activo={!!filtros.gratuito}
          onClick={() => navegar({ ...filtros, gratuito: filtros.gratuito ? undefined : true })}
        />
        <ChipDesplegable
          label={nivelLabel}
          activo={nivelActivo}
          abierto={abierto === "nivel"}
          onClick={() => alternarPanel("nivel")}
        />
        <ChipDesplegable
          label={tipoLabel}
          activo={tipoActivo}
          abierto={abierto === "tipo"}
          onClick={() => alternarPanel("tipo")}
        />
        {modo === "gps" && (
          <ChipDesplegable
            label={distLabel}
            activo={distActivo}
            abierto={abierto === "distancia"}
            onClick={() => alternarPanel("distancia")}
          />
        )}
        {modo === "comuna" && (
          <ChipToggle
            label="Sumar comunas cercanas"
            activo={!!filtros.cercanas}
            onClick={() => navegar({ ...filtros, cercanas: filtros.cercanas ? undefined : true })}
          />
        )}
      </div>

      {abierto === "nivel" && (
        <PanelFiltro
          titulo="Nivel educativo"
          onLimpiar={nivelActivo ? () => navegar({ ...filtros, nivel: undefined, orden: filtros.orden === "ingreso_u" ? undefined : filtros.orden }) : undefined}
        >
          {NIVELES.map((n) => (
            <OpcionCheck key={n.key} label={n.label} checked={nivelSel[n.key]} onClick={() => toggleNivel(n.key)} />
          ))}
        </PanelFiltro>
      )}

      {abierto === "distancia" && (
        <PanelFiltro
          titulo="Distancia desde tu ubicación"
          onLimpiar={distActivo ? () => navegar({ ...filtros, distanciaMaxKm: undefined }) : undefined}
        >
          {DISTANCIAS.map((d) => (
            <OpcionRadio
              key={d.value}
              label={d.label}
              checked={filtros.distanciaMaxKm === d.value}
              onClick={() => navegar({ ...filtros, distanciaMaxKm: d.value })}
            />
          ))}
          <OpcionRadio
            label="Sin límite"
            checked={filtros.distanciaMaxKm === undefined}
            onClick={() => navegar({ ...filtros, distanciaMaxKm: undefined })}
          />
        </PanelFiltro>
      )}

      {abierto === "tipo" && (
        <PanelFiltro
          titulo="Tipo de colegio"
          onLimpiar={tipoActivo ? () => navegar({ ...filtros, tipos: undefined }) : undefined}
        >
          {TIPOS.map((t) => (
            <OpcionCheck key={t} label={TIPO_GLOSA[t]} checked={tiposSel.has(t)} onClick={() => toggleTipo(t)} />
          ))}
          <p className="pt-xs text-2xs text-texto-secundario">
            «Pública» incluye colegios municipales, de Servicios Locales y de administración delegada.
          </p>
        </PanelFiltro>
      )}
    </div>
  );
}

/* ---------- Sub-componentes ---------- */

/** Chip de alternar: el chip de filtro único del sitio (components/ui/ChipFiltro). */
const ChipToggle = ChipFiltro;

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
        "min-h-[44px] inline-flex items-center gap-xxs rounded-s px-m py-xs text-xs whitespace-nowrap shrink-0 border-2 transition-colors",
        activo
          ? "bg-temp-calido-acento text-texto-sobre-oscuro border-temp-calido-acento"
          : "bg-superficie-base text-texto-primario border-temp-frio-profundo hover:bg-temp-frio-suave",
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
      className="group min-h-[44px] flex items-center gap-xs py-xs text-left"
    >
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-s border transition-colors",
          checked
            ? "bg-temp-calido-profundo border-temp-calido-profundo"
            : "bg-superficie-base border-borde-definido group-hover:border-texto-primario"
        )}
      >
        {checked && <Icon nombre="check" size={16} className="text-texto-sobre-oscuro" />}
      </span>
      <span className="text-xs text-texto-primario group-hover:underline">{label}</span>
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
      className="group min-h-[44px] flex items-center gap-xs py-xs text-left"
    >
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
          checked ? "border-temp-calido-profundo" : "border-borde-definido group-hover:border-texto-primario"
        )}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-temp-calido-profundo" />}
      </span>
      <span className="text-xs text-texto-primario group-hover:underline">{label}</span>
    </button>
  );
}
