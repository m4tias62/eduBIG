# Edubig — Fase B: Ruleset de la Capa de Traducción

**Fecha:** 6 de agosto de 2026
**Implementación:** `data-pipeline/scripts/capa_traduccion.py` (+ `test_capa_traduccion.py`)
**Salida:** `web-app/public/data/colegios_conclusiones.json`
**Antecede:** `Edubig_Auditoria_Capa_Traduccion_FaseA.md`

---

## 1. Propósito

La traducción es el producto de Edubig; la visualización es la evidencia. Esta capa convierte el dato oficial crudo en las **oraciones** que lee la familia, con tres garantías:

1. **Determinista:** la misma entrada produce siempre la misma frase.
2. **Honesta:** nunca afirma más de lo que el dato sostiene (respeta significancia e incertidumbre).
3. **Fuente única:** "Lo esencial" y cada módulo salen de la **misma función** → es estructuralmente imposible que se contradigan (cierra §4.1 de la auditoría).

Vive en el **pipeline** (dato → JSON estático), no en el frontend. El frontend solo renderiza las frases ya calculadas.

---

## 2. Entradas (por colegio, de `colegios_enriquecidos.json`)

- **SIMCE**, por curso (4°, 6°, 8° básico, 2° medio) y materia (Lectura, Matemática): `difgru_*` (diferencia vs. grupo similar) y `siggru_*` (flag de significancia de la Agencia).
- **IDPS**, por nivel (8° básico, 2° medio) y dimensión (clima, autoestima, hábitos, participación): `*_difgru_*` (diferencia vs. grupo), `*_prom_*` (valor del colegio), `*_dif_*` (diferencia vs. nacional — **no se usa** para afirmar; ver §5).
- **Identidad:** `NOM_RBD`, `MAT_TOTAL`, `PAGO_MATRICULA`, `PAGO_MENSUAL`, `COD_DEPE`.
- **Seguridad:** `conteo_denuncias_24`, `conteo_denuncias_25`.

---

## 3. Reglas de banda (una celda → una de tres bandas)

La banda es siempre **respecto al grupo similar** (mismo GSE). Tres valores posibles: `sobre` / `en torno a` / `bajo`.

### 3.1 SIMCE — la banda la da el flag de la Agencia
El dataset trae `siggru ∈ {-1, 0, +1}`, que **ya codifica la significancia**:

| `siggru` | Banda |
|---|---|
| +1 | **sobre** (significativamente sobre el grupo) |
| −1 | **bajo** (significativamente bajo) |
| 0 | **en torno a** (sin diferencia significativa) |
| `None` | sin dato |

No se inventa umbral: SIMCE tiene medición de error y la Agencia ya resolvió la significancia. Por eso la palabra "significativa" **es honesta para SIMCE**.

### 3.2 IDPS — mismo criterio que SIMCE (flag `sigdifgru`)
El IDPS **sí** trae flag de significancia de la Agencia (`sigdifgru`), calculado a nivel nacional. Se usa exactamente igual que SIMCE:

| `sigdifgru` | Banda |
|---|---|
| +1 | **sobre** (significativamente sobre el grupo) |
| −1 | **bajo** |
| 0 | **en torno a** |
| `None` | sin dato |

**Nota (revisión 2026-08-06):** originalmente se usó un umbral ±5 porque el flag `sigdifgru` no estaba en el dataset enriquecido — se había perdido en el merge (paso 02). Se **retiró el umbral**: contrastado contra las 34.266 mediciones IDPS nacionales, el ±5 subdeclaraba el **15,3%** de los casos y borraba el **36%** de las diferencias que la Agencia considera significativas (nunca sobredeclaraba). El flag es más honesto, consistente con SIMCE y escalable (convención nacional, no un umbral local). El script `enriquecer_sigdifgru.py` reincorpora la columna; su lógica debe integrarse al merge.

---

## 4. Agregación y cuantificadores universales

Una conclusión de módulo agrega muchas celdas. La regla evita la sobre-afirmación:

- **Todas las celdas comparten banda** → frase plena: *"{Banda} colegios similares en las cuatro dimensiones / en las dos materias, en todos los cursos evaluados."*
- **Hay mezcla** → banda dominante + **excepciones nombradas**: *"Bajo colegios similares en 3 de 4 mediciones; a la par en Autoestima 8° básico."*

Un solo caso que no cumpla degrada la frase: nunca se dice "en todos" si no es en todos.

---

## 5. Marco de referencia: solo el grupo similar

La comparación que se **afirma** es exclusivamente contra el grupo de mismo GSE. El promedio nacional **no se afirma en texto** y **la barra nacional se retira** (decisión de Matías). Razón: vs. nacional el resultado suele ser mixto y reintroduce la lectura de ranking ("bajo el promedio") que el eje contra-pares busca desarmar. La comparación justa es contra colegios como este, no contra todo el país.

---

## 6. Incertidumbre y volatilidad

- **Denuncias:** siempre se muestra **tasa (por 1.000 estudiantes) + conteo**. Si el total de denuncias (24+25) es **≤ 5**, se agrega aviso de volatilidad: *"En colegios con pocos casos, una o dos denuncias mueven mucho la tasa: conviene leerla con cautela."*
- **SIMCE:** la fiabilidad ya está incorporada vía `siggru` (un colegio chico rara vez alcanza significancia).

---

## 7. Estados vacíos y nulos

- Celda sin dato → se excluye de la agregación.
- Módulo sin ninguna celda → *"Sin datos publicados."*
- Denuncias nulas → *"Sin registros de denuncias publicados."*
- Copago no informado → *"Costo no informado."*
- Niveles se infieren de la presencia de datos (Media si hay 2° medio; Básica si hay 4°/6°/8°).

---

## 8. Trazabilidad (año real del dato)

El pie de fuente refleja el año verdadero, no uno inventado (corrige §9.3 de la auditoría):

- Académico: *"Agencia de Calidad · SIMCE 2025 (preliminar); 6° básico 2024 (final)."*
- Bienestar: *"Agencia de Calidad · IDPS 8° básico y 2° medio 2025 (preliminar)."*

---

## 9. Resultados verificados

Corrido sobre 62 colegios activos; **0 contradicciones** entre "Lo esencial" y los módulos.

**Brasilia (RBD 10130):**
- Bienestar → *"A la par de colegios similares en 6 de 8 mediciones; sobre en Autoestima académica 2° medio y Participación y formación ciudadana 2° medio."* (con el flag `sigdifgru`; el ±5 escondía estas dos fortalezas reales de 2° medio)
- Académico → *"Sobre colegios similares en las dos materias, en todos los cursos evaluados."*
- Seguridad → *"2 denuncias en 2025 y 1 en 2024 … (4.1 por cada 1.000 estudiantes) … leerla con cautela."*
- Costo → *"Gratuito, sin copago."*

**Lo Boza (RBD 10135), bandas mixtas:**
- Bienestar → *"Bajo colegios similares en 3 de 4 mediciones; a la par en Autoestima 8° básico."*
- Académico → *"Bajo colegios similares en 4 de 6 mediciones; sobre en Lectura 4° básico y Matemática 4° básico."*

La traducción bien calculada **es** el mecanismo anti-ranking: Brasilia, con promedios más altos que sus pares en SIMCE, queda "sobre"; pero en bienestar, donde solo está a la par, se dice "a la par" — sin inflar. Honestidad dimensión por dimensión.

---

## 10. Cómo se conecta

```
colegios_enriquecidos.json  ──►  capa_traduccion.traducir()  ──►  colegios_conclusiones.json  ──►  frontend (solo renderiza)
```

El frontend nunca decide una frase: consume las que el pipeline ya calculó y probó.

---

## 11. Cómo cierra la auditoría

| Hallazgo Fase A | Cómo lo resuelve la Fase B |
|---|---|
| §4.1 Contradicción Bienestar | Fuente única: `lo_esencial` reusa la función del módulo. 0 contradicciones en el universo. |
| §4.2 "Significativa" | Solo SIMCE la usa, respaldada por `siggru`; IDPS la prohíbe. |
| §4.3 Cuantificadores universales | Degradan a "N de M" con excepciones nombradas. |
| §4.4 Umbral de banda | Explícito: SIMCE por `siggru`; IDPS por `sigdifgru` (mismo flag de la Agencia). |
| §4.5 / §9.3 Fuente y año | Pie de fuente con año real y cobertura completa. |
| §4.6 Denuncias | Tasa + conteo + aviso de volatilidad. |
| §4.7 Contenido a mano | Se elimina: las frases se generan, no se escriben. |

---

## 12. Parámetros y pendientes

- **`UMBRAL_VOLATILIDAD_DENUNCIAS = 5`**: único parámetro de diseño restante (el `UMBRAL_IDPS` fue retirado en favor del flag `sigdifgru`). Calibrable si el testeo lo sugiere.
- **Distancia** ("a X km de tu casa"): depende de la ubicación del usuario; hoy es placeholder. Requiere geocodificación desde la dirección ingresada (fuera del pipeline estático).
- **Universo:** el test corre sobre 62 colegios con matrícula > 0; el universo oficial de 57 se define en `colegios_universo.json` (filtros adicionales). La capa aplica a cualquier colegio que pase esos filtros.
- **Educación Especial / autodeclarado (PEI):** el módulo Identidad tratará el contenido autodeclarado con un recurso visual distinto del eje de temperatura (pendiente de diseño).
