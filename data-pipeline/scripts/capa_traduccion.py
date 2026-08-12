"""
Edubig · Capa de Traducción (Fase B)
=====================================
Convierte el dato oficial crudo (colegios_enriquecidos.json) en las oraciones
que muestra la ficha. Determinista, auditable y testeable: la misma entrada
produce siempre la misma frase, y "Lo esencial" y cada módulo salen de la
MISMA función -> es imposible que se contradigan (fix de §4.1 de la auditoría).

Reglas clave (decididas con Matías, 06-08-2026):
- SIMCE: la banda la da el flag de significancia de la Agencia (siggru):
    +1 -> "sobre" | -1 -> "bajo" | 0 -> "en torno a" | None -> sin dato.
- IDPS: mismo criterio, con el flag `sigdifgru` de la Agencia (nacional):
    +1 -> "sobre" | -1 -> "bajo" | 0 -> "en torno a" | None -> sin dato.
    (Antes usábamos un umbral ±5; se RETIRÓ: a nivel nacional subdeclaraba el
     15% de los casos y borraba el 36% de las diferencias significativas. El
     flag es más honesto, consistente con SIMCE y escalable.)
- Marco de referencia: SOLO grupo similar (mismo GSE). El nacional no se afirma.
- Cuantificador universal: si todas las celdas comparten banda -> frase plena;
    si no, se degrada nombrando las excepciones (nunca se sobre-afirma).
- Trazabilidad: el año de la fuente refleja el año real del dato.
"""

from collections import Counter

# --- Denuncias: bajo este total, la tasa es volátil y se avisa ---
UMBRAL_VOLATILIDAD_DENUNCIAS = 5

FRASE = {"sobre": "Sobre colegios similares",
         "en torno a": "A la par de colegios similares",
         "bajo": "Bajo colegios similares"}
FRASE_LOW = {"sobre": "sobre", "en torno a": "a la par", "bajo": "bajo"}
ORDEN = ["sobre", "en torno a", "bajo"]

DEP = {1: "Municipal", 2: "Municipal", 3: "Particular subvencionado",
       4: "Particular pagado", 5: "Administración delegada",
       6: "Educación pública (SLEP)"}

CURSO = {"4b": "4° básico", "6b": "6° básico", "8b": "8° básico", "2m": "2° medio"}
MATERIA = {"lect": "Lectura", "mate": "Matemática"}
DIM = {"clima": "Clima escolar", "autoestima": "Autoestima académica",
       "habitos": "Hábitos de vida saludable",
       "participacion": "Participación y formación ciudadana"}


# ---------------------------------------------------------------------------
# Clasificadores de banda (una sola celda)
# ---------------------------------------------------------------------------
def banda_por_flag(sig):
    """Banda a partir del flag de significancia de la Agencia (mismo para SIMCE e IDPS)."""
    if sig is None:
        return None
    if sig == 1:
        return "sobre"
    if sig == -1:
        return "bajo"
    return "en torno a"          # 0: sin diferencia significativa vs. su grupo


def banda_simce(difgru, siggru):
    """SIMCE: la banda la fija el flag `siggru`."""
    if difgru is None:
        return None
    return banda_por_flag(siggru)


def banda_idps(sigdifgru):
    """IDPS: la banda la fija el flag `sigdifgru` (antes ±5, retirado)."""
    return banda_por_flag(sigdifgru)


# ---------------------------------------------------------------------------
# Agregación de celdas -> una oración honesta
# ---------------------------------------------------------------------------
def _join(labels):
    labels = list(labels)
    if len(labels) == 1:
        return labels[0]
    return ", ".join(labels[:-1]) + " y " + labels[-1]


def agregar(celdas, scope_all, unidad_plural):
    """
    celdas: dict {label_legible: banda|None}
    Devuelve una oración. Si todas comparten banda -> frase plena con scope_all.
    Si hay mezcla -> banda dominante + excepciones nombradas. None -> empty state.
    """
    presentes = {k: v for k, v in celdas.items() if v}
    if not presentes:
        return "Sin datos publicados."
    cnt = Counter(presentes.values())
    n = len(presentes)
    if len(cnt) == 1:
        banda = next(iter(cnt))
        return f"{FRASE[banda]} {scope_all}."
    dominante = max(ORDEN, key=lambda b: (cnt.get(b, 0), -ORDEN.index(b)))
    partes = [f"{FRASE[dominante]} en {cnt[dominante]} de {n} {unidad_plural}"]
    for b in ORDEN:
        if b in cnt and b != dominante:
            labels = [lab for lab, bb in presentes.items() if bb == b]
            partes.append(f"{FRASE_LOW[b]} en {_join(labels)}")
    return "; ".join(partes) + "."


def resumen(celdas, scope_all, unidad):
    """
    Headline corto (fuente del encabezado y de 'Lo esencial').
    - Uniforme  -> frase plena con scope_all.
    - Mixto     -> resumen cualitativo breve (fortalezas/brechas + ámbito).
    La especificidad exacta vive en el detalle por dimensión/curso.
    `celdas`: dict {label: (banda, ámbito)}.
    """
    presentes = {k: v for k, v in celdas.items() if v and v[0]}
    if not presentes:
        return "Sin datos publicados."
    bandas = [v[0] for v in presentes.values()]
    cnt = Counter(bandas)
    if len(cnt) == 1:
        return f"{FRASE[bandas[0]]} {scope_all}."
    dominante = max(ORDEN, key=lambda b: (cnt.get(b, 0), -ORDEN.index(b)))
    present = set(cnt)

    def ambito(banda):
        ambs = {v[1] for v in presentes.values() if v[0] == banda and v[1]}
        return f" en {next(iter(ambs))}" if len(ambs) == 1 else " puntuales"

    base = {
        "en torno a": "A la par de colegios similares",
        "sobre": f"Por sobre colegios similares en la mayoría de {unidad}",
        "bajo": f"Bajo colegios similares en la mayoría de {unidad}",
    }[dominante]
    extras = []
    if "sobre" in present and dominante != "sobre":
        extras.append(f"fortalezas{ambito('sobre')}")
    if "bajo" in present and dominante != "bajo":
        extras.append(f"brechas{ambito('bajo')}")
    if extras:
        return f"{base}, con {' y '.join(extras)}."
    return f"{base}."


# ---------------------------------------------------------------------------
# Builders por módulo (fuente única: Lo esencial reusa estas funciones)
# ---------------------------------------------------------------------------
def conclusion_academico(c, materias=("lect", "mate"), cursos=("4b", "6b", "8b", "2m")):
    celdas = {}
    for m in materias:
        for lv in cursos:
            b = banda_simce(c.get(f"difgru_{m}{lv}_rbd"), c.get(f"siggru_{m}{lv}_rbd"))
            if b is not None:
                celdas[f"{MATERIA[m]} {CURSO[lv]}"] = (b, CURSO[lv])
    scope = "en las dos materias, en todos los cursos evaluados" if len(materias) == 2 \
            else "en todos los cursos evaluados"
    return resumen(celdas, scope, "los cursos")


def conclusion_bienestar(c, dims=("clima", "autoestima", "habitos", "participacion"),
                         niveles=("8b", "2m")):
    celdas = {}
    for d in dims:
        for lv in niveles:
            b = banda_idps(c.get(f"{d}_sigdifgru_{lv}"))
            if b is not None:
                celdas[f"{DIM[d]} {CURSO[lv]}"] = (b, CURSO[lv])
    return resumen(celdas, "en las cuatro dimensiones", "las dimensiones")


def detalle_bienestar(c, dims=("clima", "autoestima", "habitos", "participacion"),
                      niveles=("8b", "2m")):
    """Nivel 2 de disclosure: una frase por dimensión (agregando sus niveles)."""
    out = {}
    for d in dims:
        celdas = {}
        for lv in niveles:
            b = banda_idps(c.get(f"{d}_sigdifgru_{lv}"))
            if b is not None:
                celdas[CURSO[lv]] = b
        # el alcance refleja los niveles con dato (no asume 2° medio)
        presentes = list(celdas.keys())
        scope = "(" + " y ".join(presentes) + ")" if presentes else ""
        out[DIM[d]] = agregar(celdas, scope, "niveles")
    return out


def conclusion_seguridad(c, umbral_vol=UMBRAL_VOLATILIDAD_DENUNCIAS):
    d24, d25 = c.get("conteo_denuncias_24"), c.get("conteo_denuncias_25")
    mat = c.get("MAT_TOTAL") or 0
    if d24 is None and d25 is None:
        return "Sin registros de denuncias publicados."
    # null = sin datos publicados (no se asume 0); decisión de Matías 2026-08-06
    if d25 is not None:
        n25 = int(d25)
        s25 = f"{n25} denuncia{'s' if n25 != 1 else ''} en 2025"
        if mat:
            s25 += f" ({n25 / mat * 1000:.1f} por cada 1.000 estudiantes)"
    else:
        s25 = "2025 sin datos publicados"
    if d24 is not None:
        n24 = int(d24)
        s24 = f"{n24} en 2024" if d25 is not None else \
              f"{n24} denuncia{'s' if n24 != 1 else ''} en 2024"
    else:
        s24 = "2024 sin datos publicados"
    frase = f"{s25} y {s24}, ante la Superintendencia."
    conocidas = sum(int(x) for x in (d24, d25) if x is not None)
    if conocidas <= umbral_vol:
        frase += (" En colegios con pocos casos, una o dos denuncias mueven mucho "
                  "la tasa: conviene leerla con cautela.")
    return frase


def conclusion_costo(c):
    pm, pmen = c.get("PAGO_MATRICULA"), c.get("PAGO_MENSUAL")
    if pm is None and pmen is None:
        return "Costo no informado."
    if str(pm).upper() == "GRATUITO" and str(pmen).upper() == "GRATUITO":
        return "Gratuito, sin copago."
    if str(pmen).upper() == "GRATUITO":
        return "Sin copago mensual."
    return f"Copago: {pmen}."


def identidad(c):
    niveles = []
    if any(c.get(f"prom_lect{lv}_rbd") is not None for lv in ("4b", "6b", "8b")):
        niveles.append("Básica")
    if c.get("prom_lect2m_rbd") is not None:
        niveles.append("Media")
    return {
        "nombre": str(c.get("NOM_RBD", "")).title(),
        "dependencia": DEP.get(c.get("COD_DEPE"), "Dependencia no informada"),
        "matricula": f"{int(c['MAT_TOTAL'])} estudiantes" if c.get("MAT_TOTAL") else "Matrícula no informada",
        "niveles": " y ".join(niveles) if niveles else "Niveles no informados",
    }


def fuente_academico(cursos=("4b", "6b", "8b", "2m")):
    tiene_6b = "6b" in cursos
    base = "Fuente: Agencia de Calidad de la Educación · SIMCE 2025 (preliminar)"
    return base + ("; 6° básico 2024 (final)." if tiene_6b else ".")


def fuente_bienestar(niveles=("8b", "2m")):
    etiqueta = "8° básico y 2° medio" if set(niveles) == {"8b", "2m"} else \
               ", ".join(CURSO[lv] for lv in niveles)
    return f"Fuente: Agencia de Calidad de la Educación · IDPS {etiqueta} 2025 (preliminar)."


# ---------------------------------------------------------------------------
# Ficha completa (una sola fuente de verdad)
# ---------------------------------------------------------------------------
def traducir(c):
    academico = conclusion_academico(c)
    bienestar = conclusion_bienestar(c)
    return {
        "rbd": c.get("rbd"),
        "identidad": identidad(c),
        "lo_esencial": {           # <- reusa exactamente las mismas frases
            "Seguridad": conclusion_seguridad(c),
            "Bienestar": bienestar,
            "Académico": academico,
            "Costo": conclusion_costo(c),
        },
        "modulos": {
            "Bienestar": {"conclusion": bienestar,
                          "detalle": detalle_bienestar(c),
                          "fuente": fuente_bienestar()},
            "Académico": {"conclusion": academico,
                          "fuente": fuente_academico()},
            "Seguridad": {"conclusion": conclusion_seguridad(c)},
        },
    }
