"""
Genera fixtures de referencia del Motor para validar el port a TypeScript.

Ejecuta el motor con los 3 perfiles de familia (Carolina, Herrera, Martín) y
serializa los outputs esperados a JSON. El test suite de TypeScript compara
contra este archivo para asegurar paridad exacta con el pipeline Python.

Uso:
    python generar_fixtures_motor.py

Output:
    ../../web-app/lib/motor/__tests__/fixtures.json
"""
import json
from math import radians, sin, cos, sqrt, atan2
from pathlib import Path
import pandas as pd


# ---------------------------------------------------------------------------
# Capa 1 — Filtros duros
# ---------------------------------------------------------------------------

def pasa_filtro_copago(rango_colegio, techo_familia):
    if pd.isna(rango_colegio):
        return True
    return rango_colegio <= techo_familia


def pasa_filtro_nivel(ofrece_basica, ofrece_media, nivel_familia):
    if not ofrece_basica and not ofrece_media:
        return True  # educación especial pura -> bypass
    if nivel_familia == 'basica':
        return ofrece_basica
    if nivel_familia == 'media':
        return ofrece_media
    if nivel_familia == 'basica_y_media':
        return ofrece_basica and ofrece_media


def distancia_km(lat1, lon1, lat2, lon2):
    R = 6371
    dlat, dlon = radians(lat2 - lat1), radians(lon2 - lon1)
    a = (sin(dlat / 2) ** 2
         + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2)
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


def pasa_filtro_distancia(lat_colegio, lon_colegio, lat_sector, lon_sector, tipo, radio_km):
    if tipo == 'flexible':
        return True
    return distancia_km(lat_colegio, lon_colegio, lat_sector, lon_sector) <= radio_km


def pasa_filtros_duros(colegio, prefs):
    if not pasa_filtro_copago(colegio['pago_mensual_rango'], prefs['techo_copago']):
        return False
    if not pasa_filtro_nivel(colegio['ofrece_basica'], colegio['ofrece_media'], prefs['nivel']):
        return False
    if not pasa_filtro_distancia(colegio['LATITUD'], colegio['LONGITUD'],
                                  prefs['lat_sector'], prefs['lon_sector'],
                                  prefs['tipo_distancia'], prefs.get('radio_km')):
        return False
    return True


# ---------------------------------------------------------------------------
# Capa 2 — Scoring
# ---------------------------------------------------------------------------

def normalizar(serie, invertir=False):
    minimo, maximo = serie.min(), serie.max()
    normalizado = (serie - minimo) / (maximo - minimo)
    return 1 - normalizado if invertir else normalizado


def promedio_dimension(colegios, prefijo):
    cols = [c for c in colegios.columns if c.startswith(prefijo + '_difgru_')]
    return colegios[cols].mean(axis=1)


def preparar_scores(colegios, prefs):
    """Precalcula scores por dimensión sobre el universo completo.
    Necesita prefs para el score_distancia (depende de lat/lon sector)."""
    # Denuncias — tasa por 100 estudiantes, promediada 2024+2025
    tasa_24 = colegios['conteo_denuncias_24'].fillna(0) / colegios['MAT_TOTAL'] * 100
    tasa_25 = colegios['conteo_denuncias_25'].fillna(0) / colegios['MAT_TOTAL'] * 100
    colegios['tasa_denuncias_promedio'] = (tasa_24 + tasa_25) / 2

    # SIMCE — promedio de todas las diferencias vs. grupo (todos los cursos+materias)
    simce_cols = [c for c in colegios.columns if c.startswith('difgru_')]
    colegios['simce_dif_promedio'] = colegios[simce_cols].mean(axis=1)

    # Distancia — haversine al sector
    colegios['dist'] = colegios.apply(
        lambda r: distancia_km(r['LATITUD'], r['LONGITUD'],
                                prefs['lat_sector'], prefs['lon_sector']),
        axis=1
    )

    # Scores base
    colegios['score_academico'] = normalizar(colegios['simce_dif_promedio']).fillna(0.5)
    colegios['score_seguridad'] = normalizar(colegios['tasa_denuncias_promedio'], invertir=True)
    colegios['score_distancia'] = normalizar(colegios['dist'], invertir=True)

    # Scores IDPS por dimensión
    for dim in ['autoestima', 'habitos', 'participacion', 'clima']:
        colegios[f'{dim}_dif_promedio'] = promedio_dimension(colegios, dim)
        colegios[f'score_{dim}'] = normalizar(colegios[f'{dim}_dif_promedio']).fillna(0.5)

    # Convivencia = (clima IDPS + seguridad denuncias) / 2
    colegios['score_convivencia'] = (colegios['score_clima'] + colegios['score_seguridad']) / 2

    return colegios


pesos_base = {
    'academico':     {'academico': 0.50, 'autoestima': 0.05, 'habitos': 0.05,
                       'convivencia': 0.05, 'participacion': 0.05, 'distancia': 0.30},
    'autoestima':    {'academico': 0.05, 'autoestima': 0.50, 'habitos': 0.05,
                       'convivencia': 0.05, 'participacion': 0.05, 'distancia': 0.30},
    'habitos':       {'academico': 0.05, 'autoestima': 0.05, 'habitos': 0.50,
                       'convivencia': 0.05, 'participacion': 0.05, 'distancia': 0.30},
    'convivencia':   {'academico': 0.05, 'autoestima': 0.05, 'habitos': 0.05,
                       'convivencia': 0.50, 'participacion': 0.05, 'distancia': 0.30},
    'participacion': {'academico': 0.05, 'autoestima': 0.05, 'habitos': 0.05,
                       'convivencia': 0.05, 'participacion': 0.50, 'distancia': 0.30},
    'todo_por_igual': {'academico': 0.14, 'autoestima': 0.14, 'habitos': 0.14,
                        'convivencia': 0.14, 'participacion': 0.14, 'distancia': 0.30},
}


def calcular_pesos_finales(perfil, tipo_distancia):
    pesos = pesos_base[perfil].copy()
    if tipo_distancia == 'duro':
        pesos.pop('distancia')
        total = sum(pesos.values())
        pesos = {k: v / total for k, v in pesos.items()}
    return pesos


def calcular_score(colegio, perfil, tipo_distancia, quiere_inclusion, peso_bono=0.05):
    pesos = calcular_pesos_finales(perfil, tipo_distancia)
    pesos = {k: v * (1 - peso_bono) for k, v in pesos.items()}
    score = sum(colegio[f'score_{dim}'] * peso for dim, peso in pesos.items())
    if quiere_inclusion and (colegio['ofrece_educacion_especial'] or colegio['CONVENIO_PIE']):
        score += peso_bono
    return score


# ---------------------------------------------------------------------------
# Runner + serialización de fixtures
# ---------------------------------------------------------------------------

def run_motor(colegios_raw, prefs):
    colegios = colegios_raw.copy()
    colegios['pasa_capa1'] = colegios.apply(lambda r: pasa_filtros_duros(r, prefs), axis=1)
    colegios = preparar_scores(colegios, prefs)
    elegibles = colegios[colegios['pasa_capa1']].copy()
    elegibles['score_final'] = elegibles.apply(
        lambda r: calcular_score(r, prefs['perfil'], prefs['tipo_distancia'], prefs['quiere_inclusion']),
        axis=1
    )
    return elegibles.sort_values('score_final', ascending=False)


LAT_TC, LON_TC = -33.43913, -70.7411

PERFILES = {
    'carolina': {
        'descripcion': 'Perfil P1 (Carolina) — solo gratuitos, media, 2km duro, prioridad convivencia',
        'prefs': {
            'techo_copago': 0, 'nivel': 'media',
            'lat_sector': LAT_TC, 'lon_sector': LON_TC,
            'tipo_distancia': 'duro', 'radio_km': 2,
            'perfil': 'convivencia', 'quiere_inclusion': False,
        },
    },
    'herrera': {
        'descripcion': 'Perfil P2 (Herrera) — cualquier copago, básica, distancia flexible, prioridad académico',
        'prefs': {
            'techo_copago': 5, 'nivel': 'basica',
            'lat_sector': LAT_TC, 'lon_sector': LON_TC,
            'tipo_distancia': 'flexible', 'radio_km': None,
            'perfil': 'academico', 'quiere_inclusion': False,
        },
    },
    'martin': {
        'descripcion': 'Perfil P3 (Martín) — gratuito, básica, 3km duro, todo por igual + inclusión',
        'prefs': {
            'techo_copago': 0, 'nivel': 'basica',
            'lat_sector': LAT_TC, 'lon_sector': LON_TC,
            'tipo_distancia': 'duro', 'radio_km': 3,
            'perfil': 'todo_por_igual', 'quiere_inclusion': True,
        },
    },
}


def main():
    root = Path(__file__).parent.parent.parent
    universo_path = root / 'web-app' / 'public' / 'data' / 'colegios_universo.json'
    fixtures_path = root / 'web-app' / 'lib' / 'motor' / '__tests__' / 'fixtures.json'
    fixtures_path.parent.mkdir(parents=True, exist_ok=True)

    colegios_raw = pd.read_json(universo_path)
    print(f'Universo: {len(colegios_raw)} colegios')

    fixtures = {}
    for nombre, config in PERFILES.items():
        print(f'\n=== {nombre.upper()} ===')
        print(config['descripcion'])
        elegibles = run_motor(colegios_raw, config['prefs'])
        print(f'Elegibles Capa 1: {len(elegibles)} colegios')
        top = elegibles[['rbd', 'NOM_RBD', 'score_final']].head(10)
        print(top.to_string(index=False))

        fixtures[nombre] = {
            'descripcion': config['descripcion'],
            'prefs': config['prefs'],
            'total_elegibles': int(len(elegibles)),
            'top10': [
                {'rbd': int(r.rbd), 'nombre': r.NOM_RBD, 'score_final': float(r.score_final)}
                for r in elegibles.head(10).itertuples()
            ],
        }

    with open(fixtures_path, 'w', encoding='utf-8') as f:
        json.dump(fixtures, f, ensure_ascii=False, indent=2)
    print(f'\n✓ Fixtures escritas en {fixtures_path}')


if __name__ == '__main__':
    main()
