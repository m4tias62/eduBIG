# Edubig · Web App

Frontend Next.js 14 de la plataforma Edubig. Consume los JSON generados por el pipeline en `../data-pipeline/`.

## Requisitos

- Node.js 18.17 o superior
- npm 9+

## Scripts

```bash
npm install          # una vez, instala dependencias
npm run dev          # dev server en localhost:3000
npm run build        # build producción (genera .next/)
npm run start        # sirve el build producción
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run test         # vitest run
npm run test:watch   # vitest en modo watch
```

## Estructura

```
web-app/
├── app/
│   ├── page.tsx                     Home (Hero + toggle Lista/Mapa)
│   ├── layout.tsx                   Root layout (mínimo)
│   ├── globals.css                  Tailwind + fonts + Material Symbols
│   ├── colegio/[rbd]/page.tsx       Ficha estática por RBD (57 rutas)
│   └── test/                        Quiz Q1-Q5 + Loading + Resultado
├── components/
│   ├── ficha/                       Cabecera, LoEsencial, Módulos, charts
│   ├── quiz/                        BarraProgreso, OpcionPregunta, TarjetaColegio
│   ├── home/                        Hero, Filtros, VistaLista, VistaMapa
│   ├── platform/                    Footer, Isologo
│   └── ui/                          Icon (Material Symbols wrapper)
├── lib/
│   ├── motor/                       Port TypeScript del scoring engine
│   ├── data/                        Loaders + formatters
│   ├── quiz/                        State URL-driven del quiz
│   ├── home/                        Filtros browse
│   ├── types.ts
│   └── utils.ts
└── public/
    ├── data/                        JSON del pipeline (universo, conclusiones)
    ├── isologo-edubig.png
    └── hero-classroom.jpg
```

## Design system

Los tokens de Figma están espejados en `tailwind.config.ts`:

- **Colores**: `superficie/*`, `texto/*`, `borde/*`, `estado/*`, `interaccion/*`, `rdbu-01..11` (paleta primitiva del eje temperatura, solo para firma de marca).
- **Tipografía**: Work Sans (headings), Roboto (body). Cargadas vía Google Fonts.
- **Iconografía**: Material Symbols Outlined (misma familia que el gob.cl UI Kit).
- **Escala**: `2xs..xl` en tipografía · `xxs..xxl` en spacing · `s..xl` en radios.

## Testing

```bash
npm run test
```

Coverage principal:
- `lib/motor/__tests__/motor.test.ts` — 6 tests: paridad exacta con el motor Python contra fixtures de 3 perfiles familiares (Carolina, Herrera, Martín).
- `lib/quiz/__tests__/state.test.ts` — 6 tests: URL state parse/serialize del quiz.
- `lib/home/__tests__/filtros.test.ts` — 12 tests: filtros aplicados sobre universo real.
- `components/ficha/__tests__/FichaColegio.test.tsx` — 4 tests: render integración de las 57 fichas.

## Deploy

Ver `DEPLOY.md`.
