# Edubig

Plataforma que traduce datos oficiales del Mineduc, Agencia de Calidad y Supereduc en información accesible para familias que están eligiendo colegio.

Servicio en producción para Pudahuel (Región Metropolitana, Chile). Universo cubierto: 57 colegios activos al momento del pipeline (agosto 2026).

## Filosofía

**Anti-ranking**: no se ordenan colegios contra colegios en absoluto. Todas las comparaciones son contra el grupo socioeconómico similar (GSE), y las diferencias se comunican con transparencia sobre la volatilidad de muestras pequeñas.

**"Un sistema que se traduce en cuidado"**: la plataforma opera como puente entre dos cadenas — la cadena fría de los datos oficiales (imparcial, honesto) y la cadena cálida de la familia (cuidado, preocupación, seguridad). El concepto rector es traducción fiel a ambos lados, sin flattening.

Ver `data-pipeline/Edubig_FaseB_Ruleset_Traduccion.md` para el detalle de la capa de traducción.

## Estructura del repo

```
edubig/
├── data-pipeline/          Pipeline de datos (Python + Jupyter)
│   ├── raw/                Fuentes oficiales descargadas
│   ├── scripts/            Notebooks numerados (01→04) + módulos .py
│   └── *.md                Bitácora + auditoría + ruleset
│
├── web-app/                Frontend (Next.js 14 + TypeScript + Tailwind)
│   ├── app/                Rutas (App Router)
│   ├── components/         Ficha, quiz, home, platform, ui
│   ├── lib/                Motor de scoring, tipos, formatters, filtros
│   └── public/data/        JSON generados por el pipeline (input runtime)
│
└── README.md               Este archivo
```

Separación estricta: `data-pipeline/` produce los JSON en `web-app/public/data/`; el frontend nunca modifica datos.

## Stack

**Data**: Python 3, Pandas, Jupyter. Fuentes: Directorio Mineduc, SIMCE (Agencia de Calidad), IDPS (Agencia de Calidad), Denuncias formales (Supereduc).

**Motor de scoring**: Capa 1 filtros duros (copago, nivel, distancia haversine) + Capa 2 ponderación de 6 perfiles con bono inclusión. Implementado en Python (source of truth) y portado a TypeScript con paridad de test 100%.

**Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, react-leaflet + OpenStreetMap, Material Symbols. Sin backend — todo estático, servido desde CDN.

**Testing**: vitest — 28 tests que validan el motor contra fixtures generadas por Python y verifican el render de las 57 fichas.

## Cómo correr localmente

**Frontend**:
```bash
cd web-app
npm install
npm run dev
# abrir http://localhost:3000
```

**Pipeline** (opcional — los JSON ya están commiteados en web-app/public/data/):
```bash
cd data-pipeline
python3 -m venv venv
source venv/bin/activate
pip install pandas jupyter
jupyter notebook scripts/
```

## Deploy

Ver `web-app/DEPLOY.md` para la guía completa GitHub → Vercel.

## Créditos

- **Diseño UX/UI + producto**: Matías Cáceres
- **Datos y pipeline**: Israel Rubilar
- Cofinanciado por la vocación de traducir información pública en decisiones familiares informadas.
