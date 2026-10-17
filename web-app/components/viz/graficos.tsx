"use client";

import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";
import type { CeldaSimce } from "@/lib/data/comparacion";
import { CURSO_CORTO } from "@/lib/data/comparacion";
import { CURSO_GLOSA } from "@/lib/data/detalle";
import {
  COLOR_COLEGIO,
  VIZ_ESCALA_SIMCE,
  VIZ_TOPE_PUNTOS,
  altoBrecha,
  conSigno,
  estadoSig,
  pctAcotado,
  type Posicion,
  type Significancia,
} from "@/lib/viz";
import { ChipEstadoSimilares, MarcaSimilares } from "./basicos";

/**
 * Gráficos del sistema de visualización (Comparar colegios, oct-2026).
 * Todos usan escalas fijas, iguales para todos los colegios.
 */

// ---------------------------------------------------------------------------
// Rótulo "sus similares" sobre la marca (se mantiene dentro de la pista).

function RotuloSimilares({ pct, texto }: { pct: number; texto: string }) {
  return (
    <span
      aria-hidden
      className="absolute bottom-0 -translate-x-1/2 whitespace-nowrap text-2xs leading-4 text-texto-secundario"
      style={{ left: `${Math.min(Math.max(pct, 12), 88)}%` }}
    >
      {texto}
    </span>
  );
}

// ---------------------------------------------------------------------------
// BarraAbsoluta100 — Bienestar (IDPS 0–100)

export function BarraAbsoluta100({
  label,
  valor,
  similares,
  sig,
  posicion,
  rotularSimilares = false,
  similaresConValor = false,
  reservarRotulo = false,
}: {
  label?: string;
  valor: number;
  similares: number | null;
  sig: Significancia;
  posicion: Posicion;
  /** Rotula "sus similares" sobre la marca (primera aparición en cada grupo). */
  rotularSimilares?: boolean;
  /** En la ficha: "sus similares 74". */
  similaresConValor?: boolean;
  /** Reserva la línea del rótulo aunque no se muestre, para alinear barras entre columnas. */
  reservarRotulo?: boolean;
}) {
  const pctSim = similares !== null ? pctAcotado(similares) : null;
  const rotulo = pctSim !== null && (rotularSimilares || similaresConValor);
  return (
    <div className="flex flex-col gap-xxs">
      {/* Con rótulo de dimensión, "sus similares" va en su propia línea para no chocar con él. */}
      {((rotulo && label) || (reservarRotulo && label)) && (
        // Sin rótulo, la línea solo se reserva en escritorio (columnas lado a lado).
        <div aria-hidden className={clsx("relative h-4", !rotulo && "hidden lg:block")}>
          {rotulo && (
            <RotuloSimilares pct={pctSim!} texto={`sus similares${similaresConValor ? ` ${Math.round(similares!)}` : ""}`} />
          )}
        </div>
      )}
      {(label || rotulo) && (
        <div className="relative min-h-[20px] text-xs leading-5 text-texto-secundario">
          {label}
          {rotulo && !label && (
            <RotuloSimilares pct={pctSim!} texto={`sus similares${similaresConValor ? ` ${Math.round(similares!)}` : ""}`} />
          )}
        </div>
      )}
      <div aria-hidden className="relative h-5">
        <span className="absolute inset-x-0 top-viz-similares-sobresale h-viz-marca-alto bg-viz-pista" />
        <span
          className={clsx("absolute left-0 top-viz-similares-sobresale h-viz-marca-alto", COLOR_COLEGIO[posicion].bg)}
          style={{ width: `${pctAcotado(valor)}%` }}
        />
        {pctSim !== null && <MarcaSimilares pct={pctSim} />}
      </div>
      <div className="flex h-chip-alto items-center gap-xs">
        <span className="text-xs font-bold tabular-nums">{Math.round(valor)}</span>
        <ChipEstadoSimilares sig={similares === null ? null : sig} />
        <span className="sr-only">
          {similares !== null ? `Sus similares: ${Math.round(similares)}.` : "Sin comparación publicada."}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TiraBrechas — Académico (SIMCE, brecha vs. similares, escala fija ±56)

function colorBrecha(sig: Significancia): string {
  return sig === 1 ? "bg-viz-sobre" : sig === -1 ? "bg-viz-bajo" : "bg-viz-a-la-par";
}

function textoCelda(c: CeldaSimce): string {
  const curso = CURSO_GLOSA[c.curso];
  if (c.estado === "no_imparte") return `${curso}: no imparte este curso.`;
  if (c.estado === "sin_dato") return `${curso}: sin datos publicados.`;
  if (c.estado === "sin_comparacion") return `${curso}: ${c.puntaje} puntos, sin comparación publicada.`;
  const dif = Math.round(c.dif!);
  const rel = c.sig === 0 ? `${conSigno(dif)}, a la par de sus similares` : `${Math.abs(dif)} ${c.sig === 1 ? "sobre" : c.sig === -1 ? "bajo" : "de diferencia con"} sus similares`;
  const supera = Math.abs(dif) > VIZ_ESCALA_SIMCE ? `; supera la escala de ${VIZ_ESCALA_SIMCE} y la barra llega al borde` : "";
  return `${curso}: ${c.puntaje} puntos, ${rel}${supera}.`;
}

export function TiraBrechas({
  titulo,
  celdas,
  tamano = "mini",
}: {
  titulo: string;
  celdas: CeldaSimce[];
  tamano?: "mini" | "ficha";
}) {
  const ficha = tamano === "ficha";
  return (
    <div className="min-w-0 flex-1">
      <div aria-hidden className={clsx("font-medium", ficha ? "text-sm" : "text-xs leading-5")}>
        {titulo}
      </div>
      <div className="flex">
        {ficha && (
          <div aria-hidden className="relative mt-xxs h-viz-trazado-alto-ficha w-viz-eje-ancho flex-none text-2xs text-texto-secundario">
            <span className="absolute top-0">+{VIZ_ESCALA_SIMCE}</span>
            <span className="absolute top-1/2 -translate-y-1/2">0</span>
            <span className="absolute bottom-0">−{VIZ_ESCALA_SIMCE}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div
            aria-hidden
            className={clsx(
              "relative mt-xxs flex gap-xxs shadow-[inset_0_1px_0_theme(colors.borde-sutil),inset_0_-1px_0_theme(colors.borde-sutil)]",
              ficha ? "h-viz-trazado-alto-ficha" : "h-viz-trazado-alto"
            )}
          >
            {celdas.map((c) => (
              <span key={c.curso} className="relative min-w-0 flex-1">
                {c.estado === "dato" ? (
                  <span
                    className={clsx(
                      "absolute",
                      ficha ? "left-1/2 -translate-x-1/2 w-viz-columna-ancho-ficha" : "left-0 w-viz-columna-ancho",
                      colorBrecha(c.sig)
                    )}
                    style={
                      c.dif! >= 0
                        ? { bottom: "50%", height: `max(${altoBrecha(c.dif!)}%, 2px)` }
                        : { top: "50%", height: `max(${altoBrecha(c.dif!)}%, 2px)` }
                    }
                  />
                ) : (
                  <span
                    className={clsx(
                      "absolute inset-y-0",
                      ficha ? "left-1/2 -translate-x-1/2 w-viz-columna-ancho-ficha" : "left-0 w-viz-columna-ancho",
                      c.estado === "no_imparte" ? "bg-viz-pista" : "bg-viz-pista bg-viz-faltante-trama"
                    )}
                  />
                )}
                {ficha && c.estado === "dato" && (
                  <span
                    className={clsx(
                      "absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold tabular-nums",
                      estadoSig(c.sig).color
                    )}
                    style={
                      c.dif! >= 0
                        ? { bottom: `calc(50% + ${altoBrecha(c.dif!)}% + 4px)` }
                        : { top: `calc(50% + ${altoBrecha(c.dif!)}% + 4px)` }
                    }
                  >
                    {conSigno(c.dif!)} {estadoSig(c.sig).glifo}
                  </span>
                )}
                {ficha && c.estado === "sin_comparacion" && (
                  <span className="absolute left-1/2 top-xs -translate-x-1/2 text-2xs text-texto-secundario">s/d</span>
                )}
              </span>
            ))}
            <span className="absolute inset-x-0 top-1/2 -mt-px h-viz-similares-ancho bg-viz-similares-marca shadow-[0_0_0_1px_theme(colors.viz-similares-halo)]" />
          </div>
          {!ficha && (
            <div aria-hidden className="mt-xxs flex gap-xxs">
              {celdas.map((c) => (
                <span
                  key={c.curso}
                  className={clsx(
                    "min-w-0 flex-1 whitespace-nowrap text-xs font-bold leading-5 tabular-nums",
                    c.estado === "dato" ? estadoSig(c.sig).color : "font-normal text-texto-secundario"
                  )}
                >
                  {c.estado === "dato" ? (
                    `${conSigno(c.dif!)} ${estadoSig(c.sig).glifo}`
                  ) : c.estado === "no_imparte" ? (
                    <Icon nombre="do_not_disturb_on" size={16} className="align-middle" />
                  ) : (
                    "s/d"
                  )}
                </span>
              ))}
            </div>
          )}
          <div aria-hidden className={clsx("flex gap-xxs", ficha && "mt-xs")}>
            {celdas.map((c) => (
              <span
                key={c.curso}
                className={clsx("min-w-0 flex-1 text-2xs text-texto-secundario", ficha && "text-center")}
              >
                {CURSO_CORTO[c.curso]}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="sr-only">
        {titulo}. {celdas.map(textoCelda).join(" ")}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BarraProporcion — Ingreso a la universidad (0–100 %)

function deCada10(x: number): number {
  return Math.round(x * 10);
}

export function BarraProporcion({
  tasa,
  similares,
  posicion,
}: {
  tasa: number;
  similares?: number;
  posicion: Posicion;
}) {
  const pSim = similares !== undefined ? pctAcotado(similares * 100) : null;
  return (
    <div className="flex flex-col gap-xxs">
      <div aria-hidden className="relative h-5">
        {pSim !== null && (
          <span
            className="absolute bottom-0 -translate-x-1/2 whitespace-nowrap text-2xs leading-4 text-texto-secundario"
            style={{ left: `${Math.min(Math.max(pSim, 12), 88)}%` }}
          >
            sus similares
          </span>
        )}
      </div>
      <div aria-hidden className="relative h-5">
        <span className="absolute inset-x-0 top-viz-similares-sobresale h-viz-marca-alto bg-viz-pista" />
        <span
          className={clsx("absolute left-0 top-viz-similares-sobresale h-viz-marca-alto", COLOR_COLEGIO[posicion].bg)}
          style={{ width: `${pctAcotado(tasa * 100)}%` }}
        />
        {pSim !== null && <MarcaSimilares pct={pSim} />}
      </div>
      <p className="min-h-[42px] text-xs">
        {deCada10(tasa)} de cada 10 egresados
        {similares !== undefined && (
          <>
            <br />
            sus similares: {deCada10(similares)} de cada 10
          </>
        )}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PuntosConteo — Seguridad (1 punto = 1 denuncia, tope común de 10 por año)

export function PuntosConteo({
  anos,
  posicion,
}: {
  anos: Array<{ ano: number; n: number | null }>;
  posicion: Posicion;
}) {
  return (
    <>
      <div aria-hidden className="flex items-end gap-s">
        {anos.map(({ ano, n }) => (
          <div key={ano} className="flex w-viz-puntos-columna flex-col gap-xxs">
            <span className={clsx("text-xs font-medium leading-5 tabular-nums", n === null && "font-normal text-texto-secundario")}>
              {n === null ? "s/d" : n.toLocaleString("es-CL")}
            </span>
            {n === null ? (
              <span className="h-[42px] w-m bg-viz-pista bg-viz-faltante-trama" />
            ) : (
              <span className="flex h-[42px] w-m flex-wrap-reverse content-start gap-viz-punto-separacion">
                {Array.from({ length: VIZ_TOPE_PUNTOS }, (_, i) => (
                  <span
                    key={i}
                    className={clsx("block size-viz-punto rounded-full", i < n ? COLOR_COLEGIO[posicion].bg : "bg-viz-pista")}
                  />
                ))}
              </span>
            )}
            <span className="text-2xs leading-[18px] text-texto-secundario">{ano}</span>
          </div>
        ))}
      </div>
      <p className="sr-only">
        Denuncias por año: {anos.map(({ ano, n }) => `${ano}, ${n === null ? "sin datos publicados" : n}`).join("; ")}.
      </p>
    </>
  );
}

// ---------------------------------------------------------------------------
// PistaTramos — Costo (6 tramos iguales para todos; se rellena solo el del colegio)

export function PistaTramos({
  tramo,
  posicion,
  tramos = 6,
}: {
  tramo: number;
  posicion: Posicion;
  tramos?: number;
}) {
  return (
    <div aria-hidden className="flex h-viz-marca-alto gap-viz-separacion">
      {Array.from({ length: tramos }, (_, i) => (
        <span key={i} className={clsx("flex-1", i === tramo ? COLOR_COLEGIO[posicion].bg : "bg-viz-pista")} />
      ))}
    </div>
  );
}
