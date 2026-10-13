# Edubig · Web App

Frontend Next.js 14 de Edubig a escala nacional (8.250 colegios, datos oficiales 2025). Consume los JSON que genera el pipeline en `../data-pipeline/`.

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
```

## Datos

Los JSON de `public/data/nacional/` se generan desde el dataset nacional:

```bash
cd ../data-pipeline/scripts
python3 06_datos_web.py
```

| Archivo | Qué es | Quién lo usa |
|---|---|---|
| `indice.json` | Un registro compacto por colegio (~1,8 MB) | Navegador: exploración, búsqueda y motor del Test |
| `comunas.json` | 345 comunas con centro y comunas cercanas | Navegador y servidor |
| `fichas/<cod_comuna>.json` | Detalle completo + frases de la capa de traducción | Servidor: ficha y comparación |

La ubicación de la familia (GPS o comuna) vive solo en el navegador (`sessionStorage`), nunca en la URL. Por eso el motor corre en el cliente.

## Rutas

```
/                       Home: Test de Calce (CTA) + "¿Dónde buscas colegio?"
/test/q1 … q5c          Test de Calce v2 (Q4 pide la ubicación)
/test/resultado         Shortlist de 3 + bloque sin datos + ampliar distancia
/explorar               Exploración por comuna, GPS o nombre (lista y mapa)
/colegio/[rbd]          Ficha (se renderiza a pedido en el servidor)
/comparar?rbd=a,b,c     Comparación mínima de hasta 3 colegios
```

## Estructura

```
web-app/
├── app/                      Rutas (App Router)
├── components/
│   ├── home/                 Hero, entrada a la exploración
│   ├── explorar/             Exploración: filtros, tarjetas, mapa
│   ├── quiz/                 Test, shortlist, modal de ubicación
│   ├── ficha/                Cabecera, Lo esencial, módulos, gráficos
│   ├── comparar/             Comparación
│   ├── ubicacion/            Selector GPS / comuna
│   └── platform/ · ui/       Footer, Isologo, Icon
└── lib/
    ├── motor/                Motor del Test (Capa 1 filtros + Capa 2 ponderación)
    ├── data/                 Carga de datos (servidor y cliente), formatos
    ├── quiz/                 Estado del Test en la URL, razones del calce
    ├── home/                 Filtros y orden de la exploración
    ├── ubicacion.tsx         Ubicación de la familia
    └── comparar.ts           Selección para comparar
```

## Design system

Los tokens de Figma están espejados en `tailwind.config.ts` (colores, tipografía Work Sans + Roboto, Material Symbols, espaciado y radios). La escala RdBu se reserva al eje de temperatura frío/cálido.

## Testing

```bash
npm run test
```

- `lib/motor/__tests__/motor.test.ts` — pesos, filtros D21/D36, percentiles y el motor sobre el dataset nacional.
- `lib/quiz/__tests__/state.test.ts` — estado del Test en la URL.
- `lib/home/__tests__/filtros.test.ts` — exploración sobre el índice nacional.
- `components/ficha/__tests__/FichaColegio.test.tsx` — render de fichas reales, incluidos los estados sin comparación y sin dato de costo.

## Deploy

Ver `DEPLOY.md`. Las rutas de ficha y comparación leen los JSON con `fs`: `next.config.mjs` los incluye en las funciones de Vercel.
