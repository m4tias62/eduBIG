#!/usr/bin/env python3
"""
06_datos_web.py — Datos que consume la web-app a escala nacional.

Entrada: data-pipeline/nacional/dataset_nacional_2025.csv (8.250 colegios, script 05).
Salida (web-app/public/data/nacional/):
  indice.json            Un registro compacto por colegio: lo que necesitan la
                         exploración, la búsqueda por nombre y el motor del Test.
  comunas.json           345 comunas con su centro (mediana de las coordenadas de
                         sus colegios, D22) y sus comunas cercanas.
  fichas/<cod_comuna>.json
                         Detalle completo de cada colegio de la comuna + las frases
                         de la capa de traducción (capa_traduccion.traducir_nacional).
  meta.json              Fecha de generación, totales y promedios de referencia.

Decisiones que aplica:
  D30  Tasa de ingreso a la universidad relativa a colegios similares:
       tasa del colegio − promedio de la tasa de los colegios de su mismo GSE de 2° medio.
  D36  Estado de costo según la dependencia cuando el Directorio no informa el pago.
  D24  Marca `cmp` = el colegio tiene alguna comparación oficial con similares
       (SIMCE o IDPS). Sin ella, el colegio no entra a la shortlist.

Uso:  cd data-pipeline/scripts && python3 06_datos_web.py
"""
import json
import math
import warnings
import re
import shutil
from datetime import date
from pathlib import Path

import numpy as np
import pandas as pd

import capa_traduccion as ct

warnings.filterwarnings("ignore", category=pd.errors.PerformanceWarning)

SCRIPT_DIR = Path(__file__).resolve().parent
F_DATASET = SCRIPT_DIR.parent / "nacional" / "dataset_nacional_2025.csv"
OUT = SCRIPT_DIR.parent.parent / "web-app" / "public" / "data" / "nacional"

REGIONES = {
    "AYP": "Arica y Parinacota", "TPCA": "Tarapacá", "ANTOF": "Antofagasta",
    "ATCMA": "Atacama", "COQ": "Coquimbo", "VALPO": "Valparaíso",
    "RM": "Metropolitana", "LGBO": "O'Higgins", "MAULE": "Maule", "NUBLE": "Ñuble",
    "BBIO": "Biobío", "ARAUC": "La Araucanía", "RIOS": "Los Ríos",
    "LAGOS": "Los Lagos", "AYSEN": "Aysén", "MAG": "Magallanes",
}
# Orden norte → sur, para listas de regiones
ORDEN_REGIONES = list(REGIONES.keys())

RANGO_PAGO = {"GRATUITO": 0, "$1.000 A $10.000": 1, "$10.001 A $25.000": 2,
              "$25.001 A $50.000": 3, "$50.001 A $100.000": 4, "MAS DE $100.000": 5}

CURSOS_SIMCE = {"4b": ["lect", "mate"], "8b": ["lect", "mate", "hist"], "2m": ["lect", "mate"]}
DIMS = ["autoestima", "clima", "participacion", "habitos"]
CURSOS_IDPS = ["4b", "8b", "2m"]

# Comunas cercanas: las K más próximas de la misma región (supuesto, por validar)
K_CERCANAS = 4

MINUSCULAS = {"de", "del", "la", "las", "los", "y", "e", "el", "en", "a"}
ROMANOS = re.compile(r"^(i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)$", re.I)


def titulo(s: str) -> str:
    """'ESCUELA LOS ANGELES DE PUDAHUEL' → 'Escuela Los Angeles de Pudahuel'."""
    if not isinstance(s, str):
        return s
    palabras = s.strip().lower().split()
    out = []
    for i, p in enumerate(palabras):
        if i > 0 and p in MINUSCULAS:
            out.append(p)
        elif ROMANOS.match(p.strip(".,")):
            out.append(p.upper())
        else:
            # capitaliza cada tramo separado por guion, punto o apóstrofo
            out.append(re.sub(r"(^|[-.'(])(\w)", lambda m: m[1] + m[2].upper(), p))
    return " ".join(out)


def num(v, nd=None):
    """NaN → None; redondeo opcional; enteros sin decimales."""
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return None
    if isinstance(v, (np.bool_, bool)):
        return bool(v)
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.floating, float)):
        v = float(v)
        if nd is not None:
            v = round(v, nd)
        if v.is_integer() and nd is None:
            return int(v)
        return v
    return v


def tasa_denuncias(r):
    """Denuncias por 100 estudiantes, promedio de los años con dato (2024, 2025)."""
    mat = r["matricula_total"]
    if not mat:
        return None
    tasas = [r[f"denuncias_total_{a}"] / mat * 100 for a in (2024, 2025)
             if not pd.isna(r[f"denuncias_total_{a}"])]
    return sum(tasas) / len(tasas) if tasas else None


def promedio(vals):
    vals = [v for v in vals if v is not None and not pd.isna(v)]
    return sum(vals) / len(vals) if vals else None


def adaptar(r):
    """Fila nacional → dict con los nombres de campo que usa capa_traduccion (MVP)."""
    c = {"rbd": int(r["rbd"]), "MAT_TOTAL": int(r["matricula_total"]),
         "PAGO_MENSUAL": r["pago_mensual"], "PAGO_MATRICULA": r["pago_matricula"],
         "gratuito": r["gratuito"], "dependencia_cod": int(r["dependencia_cod"]),
         "ofrece_media": bool(r["ofrece_media"]),
         "tasa_ingreso_u_2025": num(r["tasa_ingreso_u_2025"]),
         "tasa_ingreso_u_similares_2025": num(r["tasa_ingreso_u_similares_2025"]),
         "conteo_denuncias_24": num(r["denuncias_total_2024"]),
         "conteo_denuncias_25": num(r["denuncias_total_2025"])}
    for cur, mats in CURSOS_SIMCE.items():
        for m in mats:
            c[f"difgru_{m}{cur}_rbd"] = num(r[f"simce_{m}_{cur}_2025_difgru"])
            c[f"siggru_{m}{cur}_rbd"] = num(r[f"simce_{m}_{cur}_2025_siggru"])
    for d in DIMS:
        for cur in CURSOS_IDPS:
            c[f"{d}_sigdifgru_{cur}"] = num(r[f"idps_{d}_{cur}_2025_sigdifgru"])
    return c


def main():
    df = pd.read_csv(F_DATASET, low_memory=False).copy()
    print(f"Dataset: {len(df)} colegios × {df.shape[1]} columnas")

    # --- D30: tasa de ingreso relativa a colegios similares (GSE de 2° medio) ---
    con_tasa = df["tasa_ingreso_u_2025"].notna() & df["gse_2m"].notna()
    prom_gse = df[con_tasa].groupby("gse_2m")["tasa_ingreso_u_2025"].mean()
    df["tasa_ingreso_u_similares_2025"] = df["gse_2m"].map(prom_gse)
    df.loc[df["tasa_ingreso_u_2025"].isna(), "tasa_ingreso_u_similares_2025"] = np.nan
    df["tasa_ingreso_u_relativa_2025"] = df["tasa_ingreso_u_2025"] - df["tasa_ingreso_u_similares_2025"]
    print("Promedio de tasa de ingreso U por GSE 2°M:",
          {int(k): round(v, 3) for k, v in prom_gse.items()})

    # --- Insumos del motor ---
    simce_cols = [f"simce_{m}_{cur}_2025_difgru" for cur, ms in CURSOS_SIMCE.items() for m in ms]
    df["_simce"] = df[simce_cols].mean(axis=1, skipna=True)
    for d in DIMS:
        df[f"_{d}"] = df[[f"idps_{d}_{cur}_2025_difgru" for cur in CURSOS_IDPS]].mean(axis=1, skipna=True)
    df["_denuncias"] = df.apply(tasa_denuncias, axis=1)
    df["_cmp"] = df["tiene_comparacion_simce"] | df["tiene_comparacion_idps"]

    df["_estado_costo"] = df.apply(
        lambda r: ct.estado_costo_nacional(r["gratuito"], int(r["dependencia_cod"])), axis=1)

    # --- Comunas ---
    comunas = []
    for cod, g in df.groupby("cod_comuna"):
        comunas.append({
            "cod": int(cod),
            "nombre": titulo(g["comuna"].iloc[0]),
            "region": g["region"].iloc[0],
            "lat": round(float(g["latitud"].median()), 5),
            "lon": round(float(g["longitud"].median()), 5),
            "n": int(len(g)),
        })
    # cercanas: K más próximas de la misma región
    for c in comunas:
        mismas = [o for o in comunas if o["region"] == c["region"] and o["cod"] != c["cod"]]
        mismas.sort(key=lambda o: haversine(c["lat"], c["lon"], o["lat"], o["lon"]))
        c["cercanas"] = [o["cod"] for o in mismas[:K_CERCANAS]]
    comunas.sort(key=lambda c: (ORDEN_REGIONES.index(c["region"]), c["nombre"]))
    nombre_comuna = {c["cod"]: c["nombre"] for c in comunas}

    # --- Índice compacto ---
    indice = []
    for _, r in df.iterrows():
        rango = RANGO_PAGO.get(r["pago_mensual"])
        indice.append({
            "rbd": int(r["rbd"]),
            "n": titulo(r["nombre"]),
            "c": int(r["cod_comuna"]),
            "lat": round(float(r["latitud"]), 5),
            "lon": round(float(r["longitud"]), 5),
            "d": int(r["dependencia_cod"]),
            "b": int(bool(r["ofrece_basica"])),
            "m": int(bool(r["ofrece_media"])),
            "e": int(bool(r["ofrece_especial"])),
            "p": int(bool(r["pie"])),
            "k": r["_estado_costo"],                       # estado de costo (D36)
            "r": rango,                                     # rango de pago mensual 0..5 o null
            "mt": int(r["matricula_total"]),
            "cmp": int(bool(r["_cmp"])),                    # tiene comparación oficial (D24)
            "s": num(r["_simce"], 2),                       # SIMCE: promedio de difgru 2025
            "ia": num(r["_autoestima"], 2),                 # IDPS: promedio de difgru por dimensión
            "ic": num(r["_clima"], 2),
            "ip": num(r["_participacion"], 2),
            "ih": num(r["_habitos"], 2),
            "dn": num(r["_denuncias"], 3),                  # denuncias por 100 estudiantes
            "tu": num(r["tasa_ingreso_u_2025"], 4),         # tasa de ingreso U 2025 (0–1)
            "tr": num(r["tasa_ingreso_u_relativa_2025"], 4),  # relativa a similares (D30)
        })
    indice = [{k: v for k, v in x.items() if v is not None} for x in indice]

    # --- Fichas por comuna (detalle + traducción) ---
    detalle_cols = [c for c in df.columns if not c.startswith("_")]
    if (OUT / "fichas").exists():
        shutil.rmtree(OUT / "fichas")
    (OUT / "fichas").mkdir(parents=True)
    n_fichas = 0
    for cod, g in df.groupby("cod_comuna"):
        fichas = []
        for _, r in g.iterrows():
            f = {k: num(r[k]) for k in detalle_cols}
            f = {k: v for k, v in f.items() if v is not None}
            f["nombre"] = titulo(r["nombre"])
            f["comuna"] = nombre_comuna[int(cod)]
            f["region_nombre"] = REGIONES[r["region"]]
            f["estado_costo"] = r["_estado_costo"]
            f["dependencia"] = ct.DEP_NACIONAL[int(r["dependencia_cod"])]
            f["traduccion"] = ct.traducir_nacional(adaptar(r))
            fichas.append(f)
            n_fichas += 1
        with open(OUT / "fichas" / f"{int(cod)}.json", "w", encoding="utf-8") as fh:
            json.dump(fichas, fh, ensure_ascii=False, separators=(",", ":"))

    OUT.mkdir(parents=True, exist_ok=True)
    with open(OUT / "indice.json", "w", encoding="utf-8") as fh:
        json.dump(indice, fh, ensure_ascii=False, separators=(",", ":"))
    with open(OUT / "comunas.json", "w", encoding="utf-8") as fh:
        json.dump(comunas, fh, ensure_ascii=False, separators=(",", ":"))
    meta = {
        "generado": date.today().isoformat(),
        "fuente": "data-pipeline/nacional/dataset_nacional_2025.csv",
        "colegios": len(indice),
        "comunas": len(comunas),
        "regiones": {k: REGIONES[k] for k in ORDEN_REGIONES},
        "tasa_ingreso_u_promedio_por_gse_2m": {int(k): round(float(v), 4) for k, v in prom_gse.items()},
    }
    with open(OUT / "meta.json", "w", encoding="utf-8") as fh:
        json.dump(meta, fh, ensure_ascii=False, indent=2)

    tam = sum(p.stat().st_size for p in (OUT / "fichas").glob("*.json"))
    print(f"indice.json: {len(indice)} colegios, {(OUT / 'indice.json').stat().st_size / 1e6:.2f} MB")
    print(f"comunas.json: {len(comunas)} comunas")
    print(f"fichas/: {n_fichas} colegios en {len(list((OUT / 'fichas').glob('*.json')))} archivos, {tam / 1e6:.1f} MB")
    print("Sin comparación oficial (fuera de la shortlist, D24):", int((~df["_cmp"]).sum()))
    print("Estado de costo:", df["_estado_costo"].value_counts().to_dict())


def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


if __name__ == "__main__":
    main()
