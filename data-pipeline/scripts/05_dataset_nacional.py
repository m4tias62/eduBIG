#!/usr/bin/env python3
"""
05_dataset_nacional.py — Dataset nacional de Edubig (base: Datos_globales_colegios.xlsx).

Base (fuente de verdad): raw/Datos_globales_colegios.xlsx, hoja 'base' (Israel Rubilar, 2026-09-28).
Se complementa SOLO con fuentes 2025, mismo año que el dato más reciente del xlsx:
  - raw/20250926_Directorio_Oficial_EE_2025_20250430_WEB.csv  → coordenadas, niveles, PIE, pago mensual
  - raw/simce{4b,8b,2m}2025_rbd_final.csv                      → GSE (cod_grupo) por prueba
No se usan años anteriores ni el master anterior.

Salidas (data-pipeline/nacional/), sin tocar el xlsx original:
  dataset_nacional_2025.csv / .json   dataset enriquecido
  cobertura.md                         % de colegios con dato por campo
  residual.csv                         colegios sin dato o con marca, con motivo
  excluidos.csv                        colegios fuera del universo
  validacion_pudahuel.md               contraste con web-app/public/data/colegios_universo.json

Uso:  cd data-pipeline/scripts && python3 05_dataset_nacional.py
"""
import json
import re
import warnings
from pathlib import Path

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

SCRIPT_DIR = Path(__file__).resolve().parent
RAW = SCRIPT_DIR.parent / "raw"
OUT = SCRIPT_DIR.parent / "nacional"
UNIVERSO = SCRIPT_DIR.parent.parent / "web-app" / "public" / "data" / "colegios_universo.json"

F_BASE = RAW / "Datos_globales_colegios.xlsx"
F_DIR = RAW / "20250926_Directorio_Oficial_EE_2025_20250430_WEB.csv"
F_SIMCE = {"4b": RAW / "simce4b2025_rbd_final.csv",
           "8b": RAW / "simce8b2025_rbd_final.csv",
           "2m": RAW / "simce2m2025_rbd_final.csv"}

F_IDPS = {"4b": RAW / "idps4B2025_rbd_final.csv",
          "8b": RAW / "idps8B2025_rbd_final.csv",
          "2m": RAW / "idps2M2025_rbd_final.csv"}
MATERIAS = {"4b": ["lect", "mate"], "8b": ["lect", "mate", "hist"], "2m": ["lect", "mate"]}
# id_indicador de los archivos IDPS (verificado: el promedio de sus subdimensiones = valor del xlsx)
IDPS_ID = {"1": "autoestima", "2": "clima", "3": "participacion", "4": "habitos"}

GSE_LABELS = {1: "Bajo", 2: "Medio Bajo", 3: "Medio", 4: "Medio Alto", 5: "Alto"}

# Códigos de tipo de enseñanza (ENS_01..ENS_11 del Directorio Mineduc)
NIVELES = {
    "ofrece_parvularia": {10},
    "ofrece_basica": {110},
    "ofrece_especial": {165, 167, 211, 212, 213, 214, 215, 216, 217, 218, 219, 299},
    "ofrece_media_hc": {310},
    "ofrece_media_tp": {510, 610, 710, 810, 910},
    "ofrece_adultos": {363, 410, 463, 563, 663, 763, 863, 963},
}

IDPS = {"1 Autoestima Académica y Motivación Escolar": "autoestima",
        "2 Clima de Convivencia Escolar": "clima",
        "3 Participación y Formación Ciudadana": "participacion",
        "4 Hábitos de Vida Saludable": "habitos"}


# ---------------------------------------------------------------------------
# 1. Base: xlsx
# ---------------------------------------------------------------------------
def leer_base():
    b = pd.read_excel(F_BASE, sheet_name="base")
    n_total = len(b)
    b = b[b["rbd"].notna()].copy()            # filas sin RBD = cálculos sueltos bajo la tabla
    b["rbd"] = b["rbd"].astype(int)
    assert b["rbd"].is_unique, "RBD duplicados en la base"

    ren = {"NOM RBD": "nombre", "NOM_COM_RBD": "comuna", "NOM_REG_RBD_A": "region"}
    for c in b.columns:
        m = re.match(r"Simce (Lect|Mate) (\d{4}) (4B|2M)$", str(c))
        if m:
            ren[c] = f"simce_{m[1].lower()}_{m[3].lower()}_{m[2]}"
        m = re.match(r"([PUD])_(\d{4}) 2M$", str(c))
        if m:
            pref = {"P": "paes_prom", "U": "tasa_ingreso_u", "D": "denuncias_total"}[m[1]]
            ren[c] = f"{pref}_{m[2]}"
        for k, v in IDPS.items():
            for cur in ("4B", "2M"):
                if c == f"{k} {cur}":
                    ren[c] = f"idps_{v}_{cur.lower()}_2025"
    b = b.rename(columns=ren)

    dep = b.pop("COD_DEPE2").astype(str).str.split(":", n=1, expand=True)
    b.insert(4, "dependencia_cod", pd.to_numeric(dep[0], errors="coerce").astype("Int64"))
    b.insert(5, "dependencia", dep[1].str.strip())
    return b, n_total


# ---------------------------------------------------------------------------
# 2. Directorio 2025
# ---------------------------------------------------------------------------
def leer_directorio():
    d = pd.read_csv(F_DIR, sep=";", encoding="utf-8", dtype=str)
    d["rbd"] = pd.to_numeric(d["RBD"], errors="coerce").astype("Int64")
    d = d[d["rbd"].notna()].drop_duplicates("rbd")
    ens = d[[f"ENS_{i:02d}" for i in range(1, 12)]].apply(pd.to_numeric, errors="coerce")
    out = pd.DataFrame({"rbd": d["rbd"].astype(int).values})
    out["cod_comuna"] = pd.to_numeric(d["COD_COM_RBD"], errors="coerce").astype("Int64").values
    out["latitud"] = pd.to_numeric(d["LATITUD"].str.replace(",", "."), errors="coerce").values
    out["longitud"] = pd.to_numeric(d["LONGITUD"].str.replace(",", "."), errors="coerce").values
    out["rural"] = (d["RURAL_RBD"] == "1").values
    out["estado_estab"] = pd.to_numeric(d["ESTADO_ESTAB"], errors="coerce").astype("Int64").values
    out["matricula_total"] = pd.to_numeric(d["MAT_TOTAL"], errors="coerce").astype("Int64").values
    for col, codes in NIVELES.items():
        out[col] = ens.isin(codes).any(axis=1).values
    out["ofrece_media"] = out["ofrece_media_hc"] | out["ofrece_media_tp"]
    out["pie"] = d["CONVENIO_PIE"].map({"1": True, "0": False}).values
    out["pago_mensual"] = d["PAGO_MENSUAL"].values
    out["pago_matricula"] = d["PAGO_MATRICULA"].values
    pm = d["PAGO_MENSUAL"].fillna("SIN INFORMACION").str.upper().str.strip()
    out["gratuito"] = np.select([pm.eq("GRATUITO").values, pm.eq("SIN INFORMACION").values],
                                ["si", "sin_dato"], "no")
    return out


# ---------------------------------------------------------------------------
# 3. GSE por prueba (SIMCE 2025)
# ---------------------------------------------------------------------------
def leer_gse():
    res = None
    for k, f in F_SIMCE.items():
        s = pd.read_csv(f, sep=";", encoding="latin-1", dtype=str)
        g = pd.DataFrame({"rbd": pd.to_numeric(s["rbd"], errors="coerce"),
                          f"gse_{k}": pd.to_numeric(s["cod_grupo"], errors="coerce")})
        g = g[g["rbd"].notna()].astype({"rbd": int})
        g.loc[~g[f"gse_{k}"].between(1, 5), f"gse_{k}"] = np.nan
        g[f"gse_{k}"] = g[f"gse_{k}"].astype("Int64")
        g[f"gse_{k}_etiqueta"] = g[f"gse_{k}"].map(GSE_LABELS)
        res = g if res is None else res.merge(g, on="rbd", how="outer")
    return res


# ---------------------------------------------------------------------------
# 3b. Comparación con colegios similares (SIMCE e IDPS 2025, Agencia de Calidad)
#     Decisiones 2026-10-06: se agregan 4°B, 8°B y 2°M (opción B) y el IDPS usa
#     el indicador oficial de la Agencia en vez del promedio de subdimensiones del xlsx.
# ---------------------------------------------------------------------------
def leer_simce_comparacion():
    res = None
    for k, mats in MATERIAS.items():
        s = pd.read_csv(F_SIMCE[k], sep=";", encoding="latin-1", dtype=str)
        out = pd.DataFrame({"rbd": pd.to_numeric(s["rbd"], errors="coerce")})
        for m in mats:
            out[f"simce_{m}_{k}_2025_oficial"] = pd.to_numeric(s[f"prom_{m}{k}_rbd"], errors="coerce")
            out[f"simce_{m}_{k}_2025_difgru"] = pd.to_numeric(s[f"difgru_{m}{k}_rbd"], errors="coerce")
            out[f"simce_{m}_{k}_2025_siggru"] = pd.to_numeric(s[f"siggru_{m}{k}_rbd"], errors="coerce").astype("Int64")
        out = out[out["rbd"].notna()].astype({"rbd": int})
        res = out if res is None else res.merge(out, on="rbd", how="outer")
    return res


def leer_idps_oficial():
    res = None
    for k, f in F_IDPS.items():
        i = pd.read_csv(f, sep=";", encoding="latin-1", dtype=str)
        i["rbd"] = pd.to_numeric(i["rbd"], errors="coerce")
        i = i[i["rbd"].notna()].astype({"rbd": int})
        for col in ("prom", "difgru", "sigdifgru"):
            i[col] = pd.to_numeric(i[col], errors="coerce")
        w = i.pivot_table(index="rbd", columns="id_indicador", values=["prom", "difgru", "sigdifgru"], aggfunc="first")
        out = pd.DataFrame(index=w.index)
        for idn, dim in IDPS_ID.items():
            out[f"idps_{dim}_{k}_2025"] = w[("prom", idn)]
            out[f"idps_{dim}_{k}_2025_difgru"] = w[("difgru", idn)]
            out[f"idps_{dim}_{k}_2025_sigdifgru"] = w[("sigdifgru", idn)].astype("Int64")
        out = out.reset_index()
        res = out if res is None else res.merge(out, on="rbd", how="outer")
    return res


# ---------------------------------------------------------------------------
# 4. Construcción
# ---------------------------------------------------------------------------
def main():
    OUT.mkdir(exist_ok=True)
    base, n_filas_xlsx = leer_base()
    dirx = leer_directorio()
    gse = leer_gse()

    df = base.merge(dirx, on="rbd", how="left", indicator="_dir")
    sin_directorio = df.loc[df["_dir"] == "left_only", "rbd"].tolist()
    df = df.drop(columns="_dir").merge(gse, on="rbd", how="left")
    df["tiene_gse"] = df[["gse_4b", "gse_8b", "gse_2m"]].notna().any(axis=1)

    # SIMCE: comparación oficial. Control: el puntaje del xlsx (4°B, 2°M) debe ser idéntico al oficial.
    simce = leer_simce_comparacion()
    df = df.merge(simce, on="rbd", how="left")
    global CONTROL
    CONTROL = {}
    for k in ("4b", "2m"):
        for m in MATERIAS[k]:
            a, b = df[f"simce_{m}_{k}_2025"], df[f"simce_{m}_{k}_2025_oficial"]
            CONTROL[f"SIMCE {m} {k}"] = int(((a - b).abs() > 0.001).sum() + (a.isna() != b.isna()).sum())
            df = df.drop(columns=f"simce_{m}_{k}_2025_oficial")
    for m in MATERIAS["8b"]:
        df = df.rename(columns={f"simce_{m}_8b_2025_oficial": f"simce_{m}_8b_2025"})

    # IDPS: el indicador oficial reemplaza al promedio de subdimensiones del xlsx (decisión A, 2026-10-06)
    idps_xlsx = [c for c in df.columns if c.startswith("idps_") and c.endswith("_2025")]
    xlsx_ceros = (df[idps_xlsx] == 0)
    idps = leer_idps_oficial()
    df = df.drop(columns=idps_xlsx).merge(idps, on="rbd", how="left")
    CONTROL["IDPS: ceros del xlsx que en la fuente oficial son vacíos"] = int(
        sum((xlsx_ceros[c] & df[c].isna()).sum() for c in idps_xlsx))
    CONTROL["IDPS: ceros del xlsx que en la fuente oficial son 0"] = int(
        sum((xlsx_ceros[c] & (df[c] == 0)).sum() for c in idps_xlsx))

    # Marcas (no se corrige ningún valor)
    df["coord_fuera_continente"] = ~(df["latitud"].between(-56, -17) & df["longitud"].between(-76, -66))
    idps_prom = [c for c in df.columns if c.startswith("idps_") and c.endswith("_2025")]
    df["idps_cero_ambiguo"] = (df[idps_prom] == 0).any(axis=1)
    dif_simce = [c for c in df.columns if c.startswith("simce_") and c.endswith("_difgru")]
    dif_idps = [c for c in df.columns if c.startswith("idps_") and c.endswith("_difgru")]
    df["tiene_comparacion_simce"] = df[dif_simce].notna().any(axis=1)
    df["tiene_comparacion_idps"] = df[dif_idps].notna().any(axis=1)

    # Universo: básica, media o especial (decisión 2026-10-05)
    en_universo = df["ofrece_basica"] | df["ofrece_media"] | df["ofrece_especial"]
    excl = df.loc[~en_universo.fillna(False)].copy()
    excl["motivo"] = np.where(excl["ofrece_adultos"] & ~excl["ofrece_parvularia"].fillna(False), "solo adultos",
                     np.where(excl["ofrece_parvularia"].fillna(False) & ~excl["ofrece_adultos"].fillna(False),
                              "solo parvularia", "sin matricula 2025"))
    df = df.loc[en_universo.fillna(False)].reset_index(drop=True)

    # ---- salidas de datos
    df.to_csv(OUT / "dataset_nacional_2025.csv", index=False, encoding="utf-8")
    recs = json.loads(df.to_json(orient="records", force_ascii=False))
    (OUT / "dataset_nacional_2025.json").write_text(json.dumps(recs, ensure_ascii=False), encoding="utf-8")
    excl[["rbd", "nombre", "comuna", "region", "dependencia", "motivo"]].to_csv(
        OUT / "excluidos.csv", index=False, encoding="utf-8")

    # ---- cobertura
    n = len(df)
    def pct(mask):
        k = int(mask.sum()); return k, f"{k / n * 100:.1f} %"
    filas = [
        ("Coordenadas", df["latitud"].notna() & df["longitud"].notna()),
        ("Niveles (al menos uno)", df[list(NIVELES)].any(axis=1)),
        ("GSE (al menos una prueba)", df["tiene_gse"]),
        ("GSE 4° básico", df["gse_4b"].notna()),
        ("GSE 8° básico", df["gse_8b"].notna()),
        ("GSE 2° medio", df["gse_2m"].notna()),
        ("Comparación SIMCE con similares (al menos un curso)", df["tiene_comparacion_simce"]),
        ("Comparación IDPS con similares (al menos un curso)", df["tiene_comparacion_idps"]),
        ("SIMCE 8° básico 2025 (lectura)", df["simce_lect_8b_2025"].notna()),
        ("PIE (sí/no)", df["pie"].notna()),
        ("Gratuidad (sí/no, sin 'sin dato')", df["gratuito"].isin(["si", "no"])),
    ]
    lines = [f"# Cobertura — dataset nacional 2025\n",
             f"Base: {n_filas_xlsx} filas en el xlsx → {len(base)} con RBD → {n} en el universo "
             f"({len(excl)} excluidos; {len(sin_directorio)} sin match en Directorio).\n",
             "| Campo | Con dato | % |", "|---|---|---|"]
    for nom, m in filas:
        k, p = pct(m); lines.append(f"| {nom} | {k} | {p} |")
    lines += ["", "Desglose:",
              f"- Gratuito: sí {int((df.gratuito=='si').sum())}, no {int((df.gratuito=='no').sum())}, "
              f"sin dato {int((df.gratuito=='sin_dato').sum())}.",
              f"- PIE: sí {int((df.pie==True).sum())}, no {int((df.pie==False).sum())}.",
              f"- Coordenadas fuera de Chile continental (marcadas, no corregidas): {int(df.coord_fuera_continente.sum())}.",
              f"- Colegios con algún IDPS en 0 (marcados, no imputados): {int(df.idps_cero_ambiguo.sum())}.",
              "- Controles contra la fuente oficial: " + "; ".join(f"{k}: {v}" for k, v in CONTROL.items()) + ".",
              f"- Excluidos por universo: " + ", ".join(f"{k} {v}" for k, v in excl.motivo.value_counts().items()) + "."]
    (OUT / "cobertura.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    # ---- residual
    motivos = {
        "sin_coordenadas": df["latitud"].isna() | df["longitud"].isna(),
        "coord_fuera_continente": df["coord_fuera_continente"],
        "sin_niveles": ~df[list(NIVELES)].any(axis=1),
        "sin_gse": ~df["tiene_gse"],
        "puntaje_simce_sin_comparacion": df[[c for c in df.columns if c.startswith("simce_") and c.endswith("_2025")]].notna().any(axis=1) & ~df["tiene_comparacion_simce"],
        "sin_pie": df["pie"].isna(),
        "gratuidad_sin_dato": df["gratuito"].eq("sin_dato"),
        "idps_cero_ambiguo": df["idps_cero_ambiguo"],
    }
    res = []
    for mot, m in motivos.items():
        t = df.loc[m.fillna(False), ["rbd", "nombre", "comuna", "region", "dependencia"]].copy()
        t["motivo"] = mot; res.append(t)
    pd.concat(res).sort_values(["motivo", "region", "comuna", "rbd"]).to_csv(
        OUT / "residual.csv", index=False, encoding="utf-8")

    # ---- validación Pudahuel
    validar_pudahuel(df)
    print("\n".join(lines))


def validar_pudahuel(df):
    u = pd.DataFrame(json.loads(UNIVERSO.read_text(encoding="utf-8")))
    u["rbd"] = u["rbd"].astype(int)
    m = u.merge(df, on="rbd", how="left", indicator=True, suffixes=("_u", ""))
    fuera = m.loc[m["_merge"] == "left_only", "rbd"].tolist()
    m = m[m["_merge"] == "both"]
    def tf(s):
        return s.map(lambda v: None if pd.isna(v) else bool(int(v)) if not isinstance(v, bool) else v)
    checks = {
        "Latitud": (m["LATITUD"].astype(float) - m["latitud"]).abs() < 1e-5,
        "Longitud": (m["LONGITUD"].astype(float) - m["longitud"]).abs() < 1e-5,
        "PIE": tf(m["CONVENIO_PIE"]) == m["pie"],
        "Pago mensual (texto)": m["PAGO_MENSUAL"].fillna("") == m["pago_mensual"].fillna(""),
        "Ofrece básica": m["ofrece_basica_u"].astype(bool) == m["ofrece_basica"],
        "Ofrece media": m["ofrece_media_u"].astype(bool) == m["ofrece_media"],
        "GSE 4° básico": (m["cod_grupo_4b"].astype(float).fillna(-1) == m["gse_4b"].astype(float).fillna(-1)),
        "GSE 2° medio": (m["cod_grupo_2m"].astype(float).fillna(-1) == m["gse_2m"].astype(float).fillna(-1)),
    }
    def igual(a, b):
        return (pd.to_numeric(m[a], errors="coerce").fillna(-999) - pd.to_numeric(m[b], errors="coerce").fillna(-999)).abs() < 0.001
    for k in ("4b", "8b", "2m"):
        checks[f"SIMCE lectura {k}: diferencia con similares"] = igual(f"difgru_lect{k}_rbd", f"simce_lect_{k}_2025_difgru")
        checks[f"SIMCE lectura {k}: significancia"] = igual(f"siggru_lect{k}_rbd", f"simce_lect_{k}_2025_siggru")
        checks[f"IDPS autoestima {k}: valor"] = igual(f"autoestima_prom_{k}", f"idps_autoestima_{k}_2025")
        checks[f"IDPS autoestima {k}: diferencia con similares"] = igual(f"autoestima_difgru_{k}", f"idps_autoestima_{k}_2025_difgru")
    L = ["# Validación contra colegios_universo.json (Pudahuel)\n",
         f"Universo MVP: {len(u)} colegios. En el dataset nacional: {len(m)}. "
         f"No están (no figuran en el xlsx): {len(fuera)} → {fuera}\n",
         "Nota: el MVP se armó con las bases preliminares de la Agencia (junio de 2026); el dataset nacional usa las finales (30-06-2026, v2). Las discrepancias en comparación pueden venir de esa diferencia.\n",
         "| Campo | Coinciden | Discrepan (RBD) |", "|---|---|---|"]
    for k, ok in checks.items():
        bad = m.loc[~ok.fillna(False), "rbd"].tolist()
        L.append(f"| {k} | {int(ok.fillna(False).sum())}/{len(m)} | {bad if bad else '—'} |")
    (OUT / "validacion_pudahuel.md").write_text("\n".join(L) + "\n", encoding="utf-8")
    print("\n".join(L))


if __name__ == "__main__":
    main()
