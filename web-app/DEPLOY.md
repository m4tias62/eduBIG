# Deploy — GitHub + Vercel

Guía paso a paso para publicar Edubig en internet con URL propia, accesible desde cualquier celular.

**Tiempo total**: 15-20 minutos la primera vez.

## Paso 1 · Preparar el repo local (una sola vez)

Desde la carpeta raíz del proyecto (`edubig of/`):

```bash
cd "/Users/matiascaceres/Desktop/edubig of"
git init
git add .
git commit -m "Initial commit — Edubig completo (pipeline + web-app)"
```

Verificá que el commit incluya lo correcto y NO incluya `venv/` ni `node_modules/`:

```bash
git status                    # debe decir "nothing to commit, working tree clean"
git ls-files | wc -l          # cuenta archivos incluidos
git log --stat HEAD -1 | head # resumen del commit
```

Si accidentalmente algo grande quedó adentro, borrá el commit con `git reset HEAD~1` y revisá `.gitignore`.

## Paso 2 · Crear repo en GitHub

1. Andá a [github.com/new](https://github.com/new)
2. **Repository name**: `edubig` (o el nombre que prefieras — puede ser `edubig-plataforma`, etc.)
3. Elegí **Public** (necesario para deploy gratis en Vercel; si querés Private, Vercel free igual funciona pero con limitaciones)
4. **NO** marques "Initialize this repository with a README" (ya lo tenemos local)
5. Click **Create repository**

GitHub te muestra instrucciones "push an existing repository". Copiá los dos comandos:

```bash
git remote add origin https://github.com/TU-USUARIO/edubig.git
git branch -M main
git push -u origin main
```

Reemplazá `TU-USUARIO` con tu username real. Ejecutalo desde la raíz del proyecto.

Si es tu primera vez pusheando desde tu Mac, GitHub te va a pedir autenticación. Lo más simple hoy es instalar [GitHub CLI](https://cli.github.com/):

```bash
brew install gh
gh auth login
```

y seguir el flujo del navegador.

## Paso 3 · Conectar Vercel a GitHub

1. Andá a [vercel.com/signup](https://vercel.com/signup) y creá una cuenta con tu GitHub (single sign-on)
2. Ya logueado, click **Add New → Project**
3. Vercel lista tus repos de GitHub — buscá `edubig` y click **Import**
4. En la configuración del proyecto:
   - **Framework Preset**: Next.js (Vercel lo detecta solo)
   - **Root Directory**: click **Edit** y poné `web-app` — importante, si no lo cambias Vercel intenta buildear desde la raíz y falla
   - **Build Command**, **Output Directory**, **Install Command**: dejalos por default
   - **Environment Variables**: ninguna necesaria
5. Click **Deploy**

Vercel corre el build (npm install + npm run build). Toma 2-3 minutos la primera vez. Cuando termina te muestra la URL pública, algo tipo:

```
https://edubig-XXXXX.vercel.app
```

Esa URL funciona desde cualquier navegador — móvil o desktop.

## Paso 4 · Custom domain (opcional)

Si tenés un dominio propio (ej. `edubig.cl`):

1. En el dashboard del proyecto en Vercel → **Settings → Domains**
2. Agregá `edubig.cl` (o `www.edubig.cl`)
3. Vercel te da 2 registros DNS (A record o CNAME) para agregar donde tengas registrado el dominio (NIC.cl para .cl)
4. En 5-30 min propaga y la URL bonita reemplaza al vercel.app

## Deploys automáticos

De acá en adelante, cada `git push` a `main` dispara un deploy automático en Vercel. Cada push a otra rama crea un **preview deploy** con URL propia — útil para probar cambios sin tocar producción.

Flujo típico:

```bash
# Editás archivos localmente...
git add .
git commit -m "descripción del cambio"
git push
# Vercel deploya en 1-2 min y actualiza la URL pública
```

## Testear en celular

Una vez tenés la URL:

1. Compartí el link por WhatsApp a vos mismo
2. Abrí desde el celular
3. Testeá el quiz completo, entrá a fichas, probá el mapa
4. Chrome iOS / Chrome Android son los objetivos principales

## Troubleshooting

**Build falla en Vercel con "Module not found"**  
Chequeá que en `web-app/package.json` estén todas las dependencias. `npm run build` local debería replicar el error.

**Fuentes / iconos Material Symbols no cargan**  
Se importan por CSS desde Google Fonts. Si Google Fonts está bloqueado en la red donde testeás, no cargarán. Alternativa: self-hostear las fuentes con `next/font/local`.

**Mapa Leaflet en blanco**  
Chequeá la consola del navegador. Común: falta CSS de Leaflet (ya está importado en `MapaLeaflet.tsx`). También puede ser tiles de OSM lentos — refrescá.

**JSON de colegios desactualizado en producción**  
Los JSON viven en `web-app/public/data/`. Cuando el pipeline los regenera, hay que commitear los cambios y pushear. Vercel deploya automáticamente.

## Costo

Vercel Hobby (gratis): 100 GB de bandwidth/mes + build time ilimitado + preview deploys ilimitados. Suficiente para un proyecto en fase de testing.
