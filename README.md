# Edubig

Plataforma que traduce datos oficiales del Mineduc, Agencia de Calidad y Supereduc en información accesible para familias que están eligiendo colegio.

Escala nacional: 8.250 colegios de básica, media y educación especial con matrícula 2025 (branch `data/master-chile-nacional`). El MVP publicado en Vercel cubre los 57 colegios de Pudahuel.

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

**Motor de scoring**: Capa 1 filtros duros (copago, nivel, inclusión, alcance) + Capa 2 suma ponderada con percentiles nacionales. La versión nacional (decisiones D21–D36) vive en TypeScript (`web-app/lib/motor`); el notebook Python 04 corresponde al motor del MVP.

**Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, react-leaflet + OpenStreetMap, Material Symbols. Sin backend — todo estático, servido desde CDN.

**Testing**: vitest — motor, estado del Test, exploración y render de fichas sobre el dataset nacional.

## Cómo correr localmente

**Frontend**:
```bash
cd web-app
npm install
npm run dev
# abrir http://localhost:3000
```

**Datos nacionales** (los JSON ya están versionados en `web-app/public/data/nacional/`):
```bash
cd data-pipeline/scripts
python3 05_dataset_nacional.py   # dataset nacional 2025 (desde raw/)
python3 06_datos_web.py          # JSON para la web-app
```

**Pipeline del MVP** (notebooks):
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
