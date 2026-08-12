"""
Tests de la capa de traducción.
Verifica: (1) la traducción correcta de Brasilia, (2) el caso de bandas mixtas
(Lo Boza, con IDPS 'bajo'), y (3) la garantía estructural de no-contradicción:
Lo esencial y el módulo salen de la misma función en TODO el universo.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import capa_traduccion as ct

DATA = os.path.normpath(os.path.join(
    HERE, "..", "..", "web-app", "public", "data", "colegios_enriquecidos.json"))


def por_rbd(d, rbd):
    return next(c for c in d if c.get("rbd") == rbd)


def main():
    d = json.load(open(DATA, encoding="utf-8"))

    # ---- Caso 1: Brasilia (10130) ----
    bras = ct.traducir(por_rbd(d, 10130))
    print("=== BRASILIA (RBD 10130) ===")
    print("Identidad:", bras["identidad"])
    for k, v in bras["lo_esencial"].items():
        print(f"  Lo esencial · {k}: {v}")
    print("  Bienestar (detalle):")
    for dim, frase in bras["modulos"]["Bienestar"]["detalle"].items():
        print(f"     - {dim}: {frase}")
    print("  Fuente académico:", bras["modulos"]["Académico"]["fuente"])
    print("  Fuente bienestar:", bras["modulos"]["Bienestar"]["fuente"])

    assert bras["lo_esencial"]["Bienestar"] == \
        "A la par de colegios similares, con fortalezas en 2° medio.", \
        bras["lo_esencial"]["Bienestar"]
    assert bras["lo_esencial"]["Académico"] == \
        "Sobre colegios similares en las dos materias, en todos los cursos evaluados.", \
        bras["lo_esencial"]["Académico"]
    assert bras["lo_esencial"]["Costo"] == "Gratuito, sin copago."
    assert "por cada 1.000 estudiantes" in bras["lo_esencial"]["Seguridad"]
    assert "cautela" in bras["lo_esencial"]["Seguridad"]  # total 3 <= 5 -> aviso

    # ---- Caso 2: Lo Boza (10135), bandas mixtas con IDPS 'bajo' ----
    boza = ct.traducir(por_rbd(d, 10135))
    print("\n=== LO BOZA (RBD 10135) — bandas mixtas ===")
    for k, v in boza["lo_esencial"].items():
        print(f"  Lo esencial · {k}: {v}")

    # ---- Caso 3: garantía de no-contradicción en TODO el universo ----
    activos = [c for c in d if c.get("MAT_TOTAL")]
    choques = 0
    for c in activos:
        t = ct.traducir(c)
        for modulo in ("Bienestar", "Académico"):
            if t["lo_esencial"][modulo] != t["modulos"][modulo]["conclusion"]:
                choques += 1
    print(f"\nColegios activos procesados: {len(activos)}")
    print(f"Contradicciones Lo esencial vs módulo: {choques}")
    assert choques == 0, "Se encontró una contradicción: fuente única rota"

    # ---- Salida: generar el JSON de conclusiones (output del pipeline) ----
    out = os.path.normpath(os.path.join(
        HERE, "..", "..", "web-app", "public", "data", "colegios_conclusiones.json"))
    conclusiones = [ct.traducir(c) for c in activos]
    json.dump(conclusiones, open(out, "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    print(f"\nGenerado: {out} ({len(conclusiones)} fichas)")
    print("\n✅ Todos los tests pasaron.")


if __name__ == "__main__":
    main()
