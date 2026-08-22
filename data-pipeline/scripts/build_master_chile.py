#!/usr/bin/env python3
"""
build_master_chile.py — Genera el master JSON nacional de Edubig.

Cruza los siguientes datasets por RBD (todos deben vivir en `data-pipeline/raw/`):
  - Sistema_Colegios_Basica.csv                    → base 7.168 colegios (partner Israel)
  - 20250926_Directorio_Oficial_EE_2025_20250430_WEB.csv → MINEDUC
  - simce{4b,8b,2m}2025_rbd_final.csv              → Agencia de Calidad
  - idps{4B,8B,2M}2025_rbd_final.csv               → Agencia de Calidad
  - 20260421_Detalle_Subvenciones_2025_20240520.xlsx → MINEDUC

Salida:
  - web-app/public/data/master-chile.json (35 MB, gitignoreado)
  - web-app/public/data/master-chile.json.gz (1.6 MB, sí commiteable)
  - data-pipeline/master-chile-cobertura.md (reporte)

Uso:
    cd data-pipeline/scripts
    python build_master_chile.py
"""

import gzip
import json
import shutil
import sys
from collections import Counter, defaultdict
from pathlib import Path
import warnings

import pandas as pd

warnings.filterwarnings('ignore')

# ---------------------------------------------------------------------------
# Rutas relativas al repo (este script vive en data-pipeline/scripts/)
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent            # <repo>/
RAW_DIR = SCRIPT_DIR.parent / "raw"             # <repo>/data-pipeline/raw/
OUT_DATA_DIR = REPO_ROOT / "web-app" / "public" / "data"
OUT_REPORT_DIR = SCRIPT_DIR.parent              # <repo>/data-pipeline/

FILES = {
    "israel":       RAW_DIR / "Sistema_Colegios_Basica.csv",
    "directorio":   RAW_DIR / "20250926_Directorio_Oficial_EE_2025_20250430_WEB.csv",
    "simce_4b":     RAW_DIR / "simce4b2025_rbd_final.csv",
    "simce_8b":     RAW_DIR / "simce8b2025_rbd_final.csv",
    "simce_2m":     RAW_DIR / "simce2m2025_rbd_final.csv",
    "idps_4b":      RAW_DIR / "idps4B2025_rbd_final.csv",
    "idps_8b":      RAW_DIR / "idps8B2025_rbd_final.csv",
    "idps_2m":      RAW_DIR / "idps2M2025_rbd_final.csv",
    "subvenciones": RAW_DIR / "20260421_Detalle_Subvenciones_2025_20240520.xlsx",
}

# ---------------------------------------------------------------------------
# Mapeos oficiales
# ---------------------------------------------------------------------------
DEPENDENCIA_NAMES = {
    1: "Municipal",
    2: "Particular Subvencionado",
    3: "Particular Pagado",
    4: "Corporación de Administración Delegada",
    5: "Servicio Local de Educación",
}
GSE_LABELS = {1: "Bajo", 2: "Medio Bajo", 3: "Medio", 4: "Medio Alto", 5: "Alto"}
IDPS_DIMENSIONES = {
    1: "autoestima_academica_motivacion",
    2: "clima_convivencia_escolar",
    3: "participacion_formacion_ciudadana",
    4: "habitos_vida_saludable",
}
# Códigos MINEDUC de tipo de enseñanza (columnas ENS_01..ENS_11 del Directorio Oficial)
NIVEL_CODES = {
    "prebasica": {10},
    "basica": {110},
    "basica_especial": {165, 167, 211, 212, 213, 214, 215, 216, 217, 218, 219, 299},
    "basica_adultos": {363},
    "media_hc": {310},
    "media_hc_adultos": {410},
    "media_tp": {510, 610, 710, 810, 910},
    "media_tp_adultos": {463, 563, 663, 763},
}
# Rangos de arancel categóricos (para chip "Gratuito" + semáforo de costo)
ARANCEL_RANK = {
    "GRATUITO": 0,
    "$1.000 A $10.000": 1,
    "$10.001 A $25.000": 2,
    "$25.001 A $50.000": 3,
    "$50.001 A $100.000": 4,
    "MAS DE $100.000": 5,
    "SIN INFORMACION": None,
}


# ---------------------------------------------------------------------------
# Utilidades de parseo
# ---------------------------------------------------------------------------
def parse_float_es(v):
    """Convierte string con coma decimal a float. Devuelve None si no parseable."""
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    s = str(v).strip()
    if s in ("", "-", " - ", "nan", "NaN", "*", "**"):
        return None
    try:
        return float(s.replace(",", "."))
    except (ValueError, AttributeError):
        return None


def parse_int(v):
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    try:
        return int(float(str(v).strip()))
    except (ValueError, AttributeError):
        return None


# ---------------------------------------------------------------------------
# Loaders
# ---------------------------------------------------------------------------
def load_israel():
    print(f"→ Cargando CSV base (Israel): {FILES['israel'].name}")
    df = pd.read_csv(FILES["israel"], sep=';', encoding='latin-1')
    df['RBD'] = df['RBD'].astype(str).str.strip()
    print(f"   {len(df)} filas, {df['RBD'].nunique()} RBDs únicos")
    return df


def load_directorio():
    print(f"→ Cargando Directorio Oficial MINEDUC: {FILES['directorio'].name}")
    df = pd.read_csv(FILES["directorio"], sep=';', encoding='utf-8-sig', low_memory=False)
    df['RBD'] = df['RBD'].astype(str).str.strip()
    df = df.drop_duplicates(subset='RBD', keep='first')
    print(f"   {len(df)} filas únicas por RBD")
    return df.set_index('RBD')


def load_simce():
    """Carga SIMCE 4B, 8B, 2M. Devuelve dict {nivel: DataFrame indexado por rbd}."""
    print("→ Cargando SIMCE oficial (4B, 8B, 2M)...")
    result = {}
    for lvl, key in [("4b", "simce_4b"), ("8b", "simce_8b"), ("2m", "simce_2m")]:
        enc = 'latin-1' if lvl != "2m" else 'cp850'
        df = pd.read_csv(FILES[key], sep=';', encoding=enc, low_memory=False)
        df['rbd'] = df['rbd'].astype(str).str.strip()
        df = df.drop_duplicates(subset='rbd', keep='first').set_index('rbd')
        result[lvl] = df
        print(f"   SIMCE {lvl.upper()}: {len(df)} RBDs")
    return result


def load_idps():
    """Carga IDPS rbd_final para 4B, 8B, 2M. Pivotea a formato wide por RBD."""
    print("→ Cargando IDPS oficial (4B, 8B, 2M)...")
    result = {}
    for lvl, key, enc in [("4b", "idps_4b", "latin-1"),
                          ("8b", "idps_8b", "latin-1"),
                          ("2m", "idps_2m", "cp850")]:
        df = pd.read_csv(FILES[key], sep=';', encoding=enc, low_memory=False)
        df['rbd'] = df['rbd'].astype(str).str.strip()
        records = defaultdict(dict)
        for _, row in df.iterrows():
            rbd = row['rbd']
            ind = int(row['id_indicador'])
            dim_name = IDPS_DIMENSIONES.get(ind)
            if not dim_name:
                continue
            records[rbd][dim_name] = {
                "promedio": parse_float_es(row.get('prom')),
                "dif_vs_pais": parse_float_es(row.get('dif')),
                "sig_dif_vs_pais": parse_int(row.get('sigdif')),
                "dif_vs_grupo_gse": parse_float_es(row.get('difgru')),
                "sig_dif_vs_grupo_gse": parse_int(row.get('sigdifgru')),
            }
        result[lvl] = dict(records)
        print(f"   IDPS {lvl.upper()}: {len(records)} RBDs con datos")
    return result


def load_subvenciones():
    """Agrega el detalle mensual por RBD."""
    print(f"→ Cargando Detalle Subvenciones (Excel, esto tarda): {FILES['subvenciones'].name}")
    df = pd.read_excel(FILES["subvenciones"], sheet_name="Sheet1")
    df['RBD'] = df['RBD'].astype(str).str.strip()
    for c in ['APOR_GRATUIDAD', 'SEP_PRIO', 'SEP_PREF']:
        df[c] = pd.to_numeric(df[c], errors='coerce').fillna(0)
    agg = df.groupby('RBD').agg(
        monto_gratuidad_anual=('APOR_GRATUIDAD', 'sum'),
        monto_sep_prio_anual=('SEP_PRIO', 'sum'),
        monto_sep_pref_anual=('SEP_PREF', 'sum'),
    )
    result = {}
    for rbd, row in agg.iterrows():
        result[rbd] = {
            "adhiere_gratuidad": bool(row['monto_gratuidad_anual'] > 0),
            "adhiere_sep": bool(row['monto_sep_prio_anual'] > 0 or row['monto_sep_pref_anual'] > 0),
            "monto_gratuidad_anual": float(row['monto_gratuidad_anual']),
            "monto_sep_anual": float(row['monto_sep_prio_anual'] + row['monto_sep_pref_anual']),
        }
    print(f"   Subvenciones: {len(result)} RBDs agregados")
    return result


# ---------------------------------------------------------------------------
# Transformaciones por colegio
# ---------------------------------------------------------------------------
def get_gse_cascade(rbd, simce):
    """Cascada 4B → 8B → 2M para obtener el GSE de un RBD."""
    for lvl in ("4b", "8b", "2m"):
        df = simce[lvl]
        if rbd in df.index:
            g = parse_int(df.loc[rbd].get('cod_grupo'))
            if g and 1 <= g <= 5:
                return g, lvl
    return None, None


def build_niveles_ofrecidos(dir_row):
    """Determina qué niveles ofrece el colegio a partir de códigos MINEDUC en ENS_01..ENS_11."""
    codigos = set()
    for i in range(1, 12):
        v = parse_int(dir_row.get(f'ENS_{i:02d}'))
        if v and v != 0:
            codigos.add(v)
    niveles = {grupo: bool(codigos & codes) for grupo, codes in NIVEL_CODES.items()}
    niveles["media"] = niveles["media_hc"] or niveles["media_tp"]
    niveles["adultos"] = (niveles["basica_adultos"]
                          or niveles["media_hc_adultos"]
                          or niveles["media_tp_adultos"])
    return niveles


def build_costo(dir_row):
    """Interpreta PAGO_MATRICULA/PAGO_MENSUAL como categorías de string (no montos)."""
    pm = str(dir_row.get('PAGO_MATRICULA', '')).strip() or None
    pmen = str(dir_row.get('PAGO_MENSUAL', '')).strip() or None
    if pm in ('nan', ''):
        pm = None
    if pmen in ('nan', ''):
        pmen = None
    return {
        "pago_matricula_categoria": pm,
        "pago_mensual_categoria": pmen,
        "pago_matricula_rank": ARANCEL_RANK.get(pm),
        "pago_mensual_rank": ARANCEL_RANK.get(pmen),
        "es_gratuito": pmen == "GRATUITO",
        "adhiere_pie": parse_int(dir_row.get('CONVENIO_PIE')) == 1,
        "adhiere_pace": parse_int(dir_row.get('PACE')) == 1,
    }


def build_simce_4b(israel_row, simce_row_4b):
    """Combina SIMCE histórico Israel (2022-2025) con detalle oficial 2025 (dif vs grupo GSE)."""
    out = {
        "lectura": {
            "prom_2022": parse_int(israel_row.get('Simce_Lect_2022_4B')),
            "prom_2023": parse_int(israel_row.get('Simce_Lect_2023_4B')),
            "prom_2024": parse_int(israel_row.get('Simce_Lect_2024_4B')),
            "prom_2025": parse_int(israel_row.get('Simce_Lect_2025_4B')),
        },
        "matematica": {
            "prom_2022": parse_int(israel_row.get('Simce_Mate_2022_4B')),
            "prom_2023": parse_int(israel_row.get('Simce_Mate_2023_4B')),
            "prom_2024": parse_int(israel_row.get('Simce_Mate_2024_4B')),
            "prom_2025": parse_int(israel_row.get('Simce_Mate_2025_4B')),
        },
    }
    if simce_row_4b is not None:
        out["comparacion_2025"] = {
            "lectura_dif_vs_grupo_gse": parse_float_es(simce_row_4b.get('difgru_lect4b_rbd')),
            "matematica_dif_vs_grupo_gse": parse_float_es(simce_row_4b.get('difgru_mate4b_rbd')),
            "n_alumnos_lectura": parse_int(simce_row_4b.get('nalu_lect4b_rbd')),
            "n_alumnos_matematica": parse_int(simce_row_4b.get('nalu_mate4b_rbd')),
        }
    return out


# ---------------------------------------------------------------------------
# Build principal
# ---------------------------------------------------------------------------
def build_master():
    israel_df = load_israel()
    dir_df = load_directorio()
    simce = load_simce()
    idps = load_idps()
    subv = load_subvenciones()

    print("\n→ Construyendo master JSON...")
    colegios = []
    coverage = Counter()
    warnings_log = defaultdict(list)
    gse_source_stats = Counter()

    for _, r in israel_df.iterrows():
        rbd = r['RBD']
        record = {"rbd": rbd}
        fuentes = ["israel"]
        warns = []

        # ---- Identidad + directorio ----
        if rbd in dir_df.index:
            d = dir_df.loc[rbd]
            fuentes.append("directorio")
            estado = parse_int(d.get('ESTADO_ESTAB'))
            record["identidad"] = {
                "nombre": str(r['Nombre_Establecimiento']).strip(),
                "comuna": str(d.get('NOM_COM_RBD', r['Comuna'])).strip(),
                "region": str(d.get('NOM_REG_RBD_A', '')).strip() or None,
                "provincia": str(d.get('NOM_DEPROV_RBD', '')).strip() or None,
                "rut_sostenedor": str(d.get('RUT_SOSTENEDOR', '')).strip() or None,
                "dependencia": {
                    "codigo": parse_int(d.get('COD_DEPE2')),
                    "nombre": DEPENDENCIA_NAMES.get(parse_int(d.get('COD_DEPE2'))),
                },
                "rural": parse_int(d.get('RURAL_RBD')) == 1,
                "estado": "funcionando" if estado == 1 else "cerrado",
                "cerrado": estado != 1,
                "orientacion_religiosa": parse_int(d.get('ORI_RELIGIOSA')),
            }
            record["ubicacion"] = {
                "lat": parse_float_es(d.get('LATITUD')),
                "lng": parse_float_es(d.get('LONGITUD')),
            }
            record["niveles_ofrecidos"] = build_niveles_ofrecidos(d)
            record["matricula"] = {
                "total": parse_int(d.get('MAT_TOTAL')),
                "por_nivel": {
                    "ens_1_basica": parse_int(d.get('MAT_ENS_1')),
                    "ens_2_basica_adultos": parse_int(d.get('MAT_ENS_2')),
                    "ens_3_media_hc": parse_int(d.get('MAT_ENS_3')),
                    "ens_4_media_hc_adultos": parse_int(d.get('MAT_ENS_4')),
                    "ens_5_media_tp_industrial": parse_int(d.get('MAT_ENS_5')),
                    "ens_6_media_tp_comercial": parse_int(d.get('MAT_ENS_6')),
                    "ens_7_media_tp_tecnica": parse_int(d.get('MAT_ENS_7')),
                    "ens_8_media_tp_agricola": parse_int(d.get('MAT_ENS_8')),
                },
            }
            record["costo"] = build_costo(d)
            if estado != 1:
                warns.append("colegio_cerrado_o_sin_reconocimiento")
        else:
            record["identidad"] = {
                "nombre": str(r['Nombre_Establecimiento']).strip(),
                "comuna": str(r['Comuna']).strip(),
                "dependencia": {"codigo": None, "nombre": r.get('Dependencia', '')},
                "estado": "desconocido",
                "cerrado": None,
            }
            record["ubicacion"] = {"lat": None, "lng": None}
            record["niveles_ofrecidos"] = None
            record["matricula"] = None
            record["costo"] = None
            warns.append("no_encontrado_en_directorio")

        # ---- GSE con cascada ----
        gse_code, gse_source = get_gse_cascade(rbd, simce)
        gse_source_stats[gse_source or "sin_gse"] += 1
        if gse_code:
            record["gse"] = {
                "codigo": gse_code,
                "etiqueta": GSE_LABELS[gse_code],
                "fuente": f"SIMCE {gse_source.upper()} 2025",
            }
        else:
            record["gse"] = None
            warns.append("sin_gse_oficial")

        # ---- Académico ----
        simce_4b_row = simce["4b"].loc[rbd] if rbd in simce["4b"].index else None
        if simce_4b_row is not None:
            fuentes.append("simce_4b_2025")
        record["academico"] = {
            "simce_4b": build_simce_4b(r, simce_4b_row),
            "indices_israel": {
                "foto_actual": parse_float_es(r.get('Foto actual')),
                "puntaje_final": parse_float_es(r.get('Puntaje final')),
                "tendencia_lectura": parse_float_es(r.get('tendencia Lect')),
                "tendencia_matematica": parse_float_es(r.get('Tendencia Mat')),
                "tendencia_promedio": parse_float_es(r.get('Promedio Tendencia')),
            },
        }

        # ---- Bienestar (IDPS) ----
        bienestar = {}
        for lvl in ("4b", "8b", "2m"):
            if rbd in idps[lvl]:
                bienestar[f"idps_{lvl}"] = idps[lvl][rbd]
                fuentes.append(f"idps_{lvl}_2025")
            else:
                bienestar[f"idps_{lvl}"] = None
        record["bienestar"] = bienestar

        # ---- Seguridad (denuncias del CSV Israel) ----
        record["seguridad"] = {
            "denuncias_tasa": {
                "2023": parse_float_es(r.get('Denuncias 2023')),
                "2024": parse_float_es(r.get('Denuncias 2024')),
                "2025": parse_float_es(r.get('Denuncias 2025')),
            },
            "denuncias_normalizadas": {
                "2023": parse_float_es(r.get('N_Denuncias 2023')),
                "2024": parse_float_es(r.get('N_Denuncias 2024')),
                "2025": parse_float_es(r.get('N_Denuncias 2025')),
            },
        }

        # ---- Subvenciones (flags SEP/gratuidad) ----
        if rbd in subv:
            record["financiamiento"] = subv[rbd]
            fuentes.append("subvenciones_2025")
        else:
            record["financiamiento"] = {
                "adhiere_gratuidad": False,
                "adhiere_sep": False,
                "monto_gratuidad_anual": 0,
                "monto_sep_anual": 0,
            }

        # ---- Universidad (pendiente CSV Media) ----
        record["universidad"] = None

        record["fuentes_disponibles"] = fuentes
        record["warnings"] = warns

        for f in fuentes:
            coverage[f] += 1
        for w in warns:
            warnings_log[w].append(rbd)

        colegios.append(record)

    total = len(colegios)

    # ---- Meta ----
    meta = {
        "generated_at_utc": pd.Timestamp.utcnow().isoformat(),
        "generator": "data-pipeline/scripts/build_master_chile.py v1.0",
        "total_colegios": total,
        "cobertura_por_fuente": {k: {"n": v, "pct": round(v / total * 100, 2)}
                                  for k, v in coverage.items()},
        "cobertura_gse": {k: {"n": v, "pct": round(v / total * 100, 2)}
                          for k, v in gse_source_stats.items()},
        "warnings_summary": {k: len(v) for k, v in warnings_log.items()},
        "sources": [
            {"key": "israel", "file": FILES["israel"].name,
             "provider": "Israel Rubilar (data partner)"},
            {"key": "directorio", "file": FILES["directorio"].name,
             "provider": "MINEDUC — Datos Abiertos"},
            {"key": "simce_4b/8b/2m", "file": "simce{4b,8b,2m}2025_rbd_final.csv",
             "provider": "Agencia de Calidad de la Educación"},
            {"key": "idps_4b/8b/2m", "file": "idps{4B,8B,2M}2025_rbd_final.csv",
             "provider": "Agencia de Calidad de la Educación"},
            {"key": "subvenciones", "file": FILES["subvenciones"].name,
             "provider": "MINEDUC — Subsecretaría de Educación"},
        ],
    }

    out = {"meta": meta, "colegios": colegios}

    # ---- Escribir salidas ----
    OUT_DATA_DIR.mkdir(parents=True, exist_ok=True)
    OUT_REPORT_DIR.mkdir(parents=True, exist_ok=True)

    json_path = OUT_DATA_DIR / "master-chile.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    size_mb = json_path.stat().st_size / (1024 * 1024)
    print(f"\n✓ {json_path.relative_to(REPO_ROOT)} — {size_mb:.2f} MB (gitignoreado)")

    gz_path = OUT_DATA_DIR / "master-chile.json.gz"
    with open(json_path, 'rb') as f_in, gzip.open(gz_path, 'wb', compresslevel=9) as f_out:
        shutil.copyfileobj(f_in, f_out)
    size_gz = gz_path.stat().st_size / (1024 * 1024)
    print(f"✓ {gz_path.relative_to(REPO_ROOT)} — {size_gz:.2f} MB (versionado)")

    report_path = OUT_REPORT_DIR / "master-chile-cobertura.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("# Reporte de cobertura — master-chile.json\n\n")
        f.write(f"Generado: `{meta['generated_at_utc']}`  \n")
        f.write(f"Total colegios: **{total}**\n\n")
        f.write("## Cobertura por fuente\n\n")
        for k, v in sorted(coverage.items(), key=lambda x: -x[1]):
            f.write(f"- `{k}`: {v} ({v / total * 100:.1f}%)\n")
        f.write("\n## Cobertura de GSE (cascada 4B → 8B → 2M)\n\n")
        for k, v in sorted(gse_source_stats.items(), key=lambda x: -x[1]):
            label = f"desde SIMCE {k.upper()}" if k != "sin_gse" else "SIN GSE"
            f.write(f"- {label}: {v} ({v / total * 100:.1f}%)\n")
        f.write("\n## Warnings\n\n")
        for k, v in warnings_log.items():
            f.write(f"- `{k}`: {len(v)} colegios")
            if len(v) <= 10:
                f.write(f" (RBDs: {', '.join(v)})")
            f.write("\n")
    print(f"✓ {report_path.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    # Verificar que todos los raw existen
    faltantes = [str(p) for k, p in FILES.items() if not p.exists()]
    if faltantes:
        print("❌ Faltan archivos raw:")
        for p in faltantes:
            print(f"   - {p}")
        sys.exit(1)
    build_master()
