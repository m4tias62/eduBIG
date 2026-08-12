# Edubig — Auditoría de la Capa de Traducción (Fase A)

**Fecha:** 6 de agosto de 2026
**Alcance de este pase:** Ficha "Liceo Polivalente Ciudad de Brasilia" (con media), nodo Figma `118:338`, incluyendo módulos Bienestar (`130:835`) y Académico (`118:440`).
**Pendiente:** Home—Lista y Ficha Graham Bell (Colegio A) — para el pase de consistencia cruzada.

---

## 1. Por qué esta auditoría

El concepto rector de Edubig es la **traducción**: convertir dato oficial crudo en una conclusión legible. Bajo ese marco, el producto no es la visualización — es la **interpretación**. La visualización es la evidencia (la cita al pie); la frase interpretada es lo que la persona consume y en lo que confía.

Consecuencia dura: **una conclusión en lenguaje claro que está mal es más peligrosa que un número crudo que está mal.** El número la persona lo puede auditar; la frase la recibe con autoridad. Por eso la capa de traducción debe ser objetiva, honesta y lógica — sin errores de cálculo que desencadenen interpretaciones erróneas.

Esta auditoría cataloga cada afirmación interpretativa de la ficha, la tipifica, y verifica su integridad. Distingue lo que se puede probar **hoy, solo con el prototipo** (contradicciones, sobre-afirmaciones, claims no verificables) de lo que requiere los **datos crudos** para cerrar el cálculo.

---

## 2. Taxonomía de claims

Cada afirmación de la ficha cae en uno de cuatro tipos, y cada tipo tiene una carga de prueba distinta:

| Tipo | Qué afirma | Qué debe respaldarlo |
|---|---|---|
| **Factual** | Un hecho directo ("Gratuito", "487 estudiantes") | El dato de origen, sin transformación. Verificable 1:1. |
| **Comparativa (banda)** | Posición relativa ("sobre / en torno a / bajo colegios similares") | Valor del colegio, valor de referencia del grupo de pares, y un **umbral explícito** que separe las bandas. |
| **De significancia** | Que una diferencia es real, no ruido ("estadísticamente significativa") | Un **test estadístico** con n y error estándar. La palabra tiene un significado técnico. |
| **Cuantificador universal** | "en todos los cursos", "en las cuatro dimensiones" | Verificación **celda por celda**. Un solo caso que no cumpla falsifica la frase completa. |

---

## 3. Catálogo de claims — Ficha Brasilia

### 3.1 Cabecera / Identidad

| Claim (texto) | Tipo | Observación |
|---|---|---|
| "Liceo Polivalente Ciudad de Brasilia" | Factual | OK (nombre). |
| "Educación pública (SLEP)" | Factual/categórico | OK si el dato lo confirma. |
| "Gratuito" | Factual/categórico | Debe derivar de copago = 0. |
| "Básica y Media" | Factual | OK. |
| "487 estudiantes" | Factual | ⚠️ La capa Figma se llama "445 estudiantes" y el texto dice "487". Contenido editado a mano. |
| "A 1,2 km de tu casa" | Factual/computado | ⚠️ La capa se llama "A 850 m de tu casa"; el texto dice "1,2 km". ¿Distancia real o placeholder? |

### 3.2 Lo esencial (conclusiones de resumen)

| Claim | Tipo | Observación |
|---|---|---|
| Seguridad: "2 denuncias en 2025 y 1 en 2024, ante la Superintendencia." | Factual (conteo) | ⚠️ Solo conteo, sin tasa ni advertencia de volatilidad (colegio de 487 → chico). Contradice tu principio registrado: mostrar **siempre tasa + conteo** y nota de volatilidad. |
| Bienestar: "En torno o sobre colegios similares en clima, autoestima, hábitos y participación." | Comparativa + universal | Banda compuesta ("en torno **o** sobre") que colapsa dos categorías. **Contradice al módulo** (ver §4.1). |
| Académico: "Sobre colegios similares en ambas materias, en todos los cursos evaluados." | Comparativa + universal | Requiere verificación celda por celda. Consistente con el encabezado del módulo Académico (bien). |
| Costo: "Gratuito, sin copago." | Factual | OK si copago = 0. |

### 3.3 Módulo Bienestar

| Claim | Tipo | Observación |
|---|---|---|
| Encabezado: "Bajo el promedio de su grupo similar en las cuatro dimensiones" | Comparativa + universal | **Contradice "Lo esencial"** (§4.1). "Las cuatro dimensiones" exige verificar las 4 × 2 cursos. |
| Barras: Este colegio / Colegios similares / Promedio nacional (0–100) | — | Valores en placeholder ("valor", "label"). Filas de comparación **sin rotular** (hallazgo de testeo). |
| Nota: "Escala 0–100. 'Colegios similares' = mismo grupo socioeconómico." | Metodológico | Define escala y grupo, pero **no define el umbral** de "bajo/en torno/sobre". |
| Fuente: "Agencia de Calidad · IDPS 8° básico 2024" | Trazabilidad | ⚠️ El módulo muestra 8° **y 2° medio**, pero la fuente solo cita 8° básico. 2°M queda sin fuente. |

### 3.4 Módulo Académico (con media)

| Claim | Tipo | Observación |
|---|---|---|
| Encabezado: "Sobre colegios similares en las dos materias, en todos los cursos evaluados" | Comparativa + universal | Verificar por celda (4°, 6°, 8°, 2°M × Lectura, Matemática). |
| Detalle: "La diferencia … es **estadísticamente significativa** en las dos materias y en todos los cursos: el colegio está consistentemente sobre ellos." | **De significancia** + universal | ⚠️ Claim técnico fuerte. ¿Hay test real con errores estándar de la Agencia? SIMCE tiene error de medición. |
| Leyenda: "Cada barra es la diferencia con colegios similares … sube = sobre, baja = bajo. Escala común (±56 pts)." | Metodológico | Buena práctica: hace explícita la gramática del gráfico (diferencia contra pares). |
| Gráfico Lectura: +20 (4°), +10 (6°), +42 (8°), +29 (2°M) | Dato | ⚠️ +10 en 6° es el más chico. ¿Supera el umbral de "sobre", o está dentro del ruido ("en torno a")? De esto depende que "en todos los cursos" sea verdadero o falso. |
| Fuente: "Agencia de Calidad · SIMCE 2024" | Trazabilidad | OK (verificar año/cobertura). |

---

## 4. Hallazgos de integridad

Ordenados por severidad. Los tres primeros se prueban **sin datos externos**, solo con el prototipo.

### 4.1 — CRÍTICO · Contradicción directa en Bienestar
La misma pantalla, el mismo colegio, dos conclusiones mutuamente excluyentes:
- "Lo esencial": *"En torno o sobre colegios similares … en las cuatro."*
- Módulo Bienestar: *"Bajo el promedio de su grupo similar en las cuatro dimensiones."*

No pueden ser ambas verdaderas. Aunque sea un placeholder sin sobreescribir, lo que revela es **sistémico: no hay una única fuente que genere las frases** — se escriben a mano por mockup, y por eso se contradicen. Este es el hallazgo raíz que justifica toda la Fase B.

### 4.2 — ALTO · "Estadísticamente significativa" sin test visible
El módulo Académico afirma significancia estadística. Esa palabra tiene un significado preciso: requiere n, error estándar y un test. Si "significativa" se está usando como sinónimo de "grande", es una traducción **deshonesta** aunque el número esté bien copiado. Dos salidas legítimas: (a) implementar el test real con los SE que publica la Agencia, o (b) eliminar la palabra y usar una comparación descriptiva.

### 4.3 — ALTO · Cuantificadores universales frágiles
"En todos los cursos", "en las dos materias", "en las cuatro dimensiones" son las frases más caras de sostener: **un solo caso que no cumpla las falsifica**. Ejemplo concreto: en Académico/Lectura, 6° = +10. Si el umbral de "sobre" (respetando el error estándar) es mayor que 10, entonces la frase correcta no es "sobre en todos los cursos" sino "sobre en 3 de 4, en torno a en 6°". Cada cuantificador universal debe verificarse celda por celda antes de publicarse.

### 4.4 — MEDIO · Umbral de banda no definido
Las frases "bajo / en torno a / sobre" implican cortes numéricos que **hoy no están escritos en ninguna parte**. La nota de Bienestar define la escala (0–100) y el grupo de pares, pero no dice a partir de qué diferencia una posición pasa de "en torno a" a "sobre". Sin ese umbral explícito, la banda es una decisión implícita e inauditable.

### 4.5 — MEDIO · Fuente no cubre todo el dato mostrado
Bienestar muestra 8° básico y 2° medio; la línea de fuente solo cita "IDPS 8° básico 2024". La trazabilidad es incompleta: parte del dato mostrado no tiene origen declarado.

### 4.6 — MEDIO · Seguridad viola el principio tasa + conteo
"2 denuncias en 2025 y 1 en 2024" es conteo puro. Tu principio registrado exige **tasa + conteo + advertencia de volatilidad** para colegios chicos. Brasilia (487 estudiantes) califica como chico.

### 4.7 — BAJO (sintomático) · Contenido editado a mano
"445" vs "487" estudiantes; "850 m" vs "1,2 km". Los desajustes entre nombre de capa y texto muestran edición ad hoc sin fuente única — el mismo síntoma de raíz de §4.1.

---

## 5. Qué se puede cerrar hoy vs. qué necesita datos

**Cerrable ahora (solo con el prototipo):** §4.1, §4.2 (detección), §4.3 (detección), §4.4, §4.5, §4.6, §4.7.

**Requiere los datos crudos para verificar el cálculo:**
- ¿+42, +29, +20, +10 son realmente "sobre" respetando el error estándar? → §4.3
- ¿La significancia declarada es real? → §4.2
- ¿Los valores 0–100 de Bienestar ubican a Brasilia "bajo" o "en torno/sobre"? → resuelve §4.1
- ¿Distancia, matrícula y copago coinciden con la fuente? → §4.1 identidad, §4.7

---

## 6. Datos y lógica requeridos para la verificación

Para cerrar el pase de verificación necesito, idealmente, el dataset `colegios_enriquecidos.json`; como mínimo, para Brasilia (y su grupo de pares):

1. **Valores crudos** de Brasilia: SIMCE Lectura y Matemática por curso (4°, 6°, 8°, 2°M); IDPS por dimensión y curso (8°, 2°M).
2. **Valor de referencia del grupo de pares** (mismo GSE) para cada uno de esos indicadores.
3. **Promedio nacional** correspondiente (el que muestran las barras de Bienestar).
4. **Error estándar / n** de cada medición (SIMCE los publica) — indispensable para §4.2 y §4.3.
5. **Datos de identidad**: matrícula, copago, distancia (y desde qué dirección se calcula).
6. **La lógica actual** que genera las frases: ¿hay código, o todas las conclusiones están escritas a mano en Figma? (Esto confirma o descarta la hipótesis de raíz de §4.1.)

---

## 7. Puente a Fase B — el ruleset de traducción

El audit apunta a una sola causa raíz: **no existe una capa de traducción formalizada.** Fase B la define con la misma disciplina determinista del pipeline de scoring — reglas explícitas, auditables y testeables unitariamente, tales que la misma entrada produzca siempre la misma frase, correcta y nunca contradictoria. Componentes a especificar:

- **Grupo de referencia** canónico (definición de "colegios similares" = GSE) y su valor por indicador.
- **Umbrales de banda** (bajo / en torno a / sobre) anclados al error estándar, no a cortes arbitrarios.
- **Criterio de significancia** (o decisión de retirar la palabra).
- **Manejo de incertidumbre**: colegios chicos, pocos casos, volatilidad — mismo criterio que ya aplicás a denuncias.
- **Reglas de cuantificador universal**: cómo se degrada "en todos" a "en N de M" cuando corresponde.
- **Fuente única**: "Lo esencial" y cada módulo derivan de la misma función; imposible que se contradigan.

**Payoff:** una traducción bien calculada desarma sola el modelo mental de ranking observado en el testeo. La verdad honesta puede invertir la lectura ingenua ("menor promedio pero *sobre* sus pares" vs "mejor promedio pero *en torno* a los suyos"). La interpretación correcta **es** el mecanismo anti-ranking.

---

## 8. Pendiente de este pase

- Auditar Home—Lista (los "atributos destacados" también son traducciones) y Ficha Graham Bell.
- **Consistencia cruzada entre fichas**: verificar que la misma regla produce frases coherentes en dos colegios distintos — es donde las capas de traducción se rompen con más frecuencia.

---

## 9. Verificación con datos crudos (cierre Fase A)

Contrastado contra `web-app/public/data/colegios_enriquecidos.json`. Brasilia = **RBD 10130, "LICEO CIUDAD DE BRASILIA"**, 487 estudiantes, GRATUITO, dependencia SLEP (COD_DEPE 6).

**Hallazgo previo confirmado:** el `web-app` solo contiene `public/` — no hay código de frontend. **Ninguna función genera las frases; todas están escritas a mano en Figma.** La causa raíz de §4.1 queda probada, no inferida.

### 9.1 Académico — los claims son CORRECTOS (corrijo mi sospecha previa)

El dataset trae, por curso y materia, la diferencia contra el grupo (`difgru`) y **el flag de significancia de la propia Agencia (`siggru`)**:

| Curso | Lectura difgru | sig | Matemática difgru | sig |
|---|---|---|---|---|
| 4° | +20 | ✅ | +34 | ✅ |
| 6° | +10 | ✅ | +18 | ✅ |
| 8° | +42 | ✅ | +27 | ✅ |
| 2°M | +29 | ✅ | +29 | ✅ |

- Los valores del gráfico Lectura en Figma (+20, +10, +42, +29) **coinciden exacto** con `difgru_lect`.
- **§4.2 se revierte parcialmente:** "estadísticamente significativa" **está respaldada** — `siggru = 1` en las 8 celdas. La palabra es honesta *para SIMCE*. Pendiente menor: la ficha debería explicitar que la significancia proviene del flag de la Agencia.
- **§4.3 se verifica como VERDADERO:** todas las diferencias son positivas y significativas → "sobre colegios similares en las dos materias, en todos los cursos" es correcto. Mi sospecha sobre 6°=+10 **no se sostuvo** (sig = 1). La verificación era necesaria justamente para esto.

### 9.2 Bienestar — el encabezado es FALSO (el hallazgo crítico, peor de lo pensado)

Diferencia contra el grupo similar (`difgru`), por dimensión:

| Dimensión | 8° básico | 2° medio |
|---|---|---|
| Clima escolar | +3 | 0 |
| Autoestima | 0 | +5 |
| Hábitos | +1 | +4 |
| Participación | +4 | +5 |

Brasilia está **en torno o sobre su grupo en las cuatro dimensiones** (ningún `difgru` negativo). Por lo tanto:
- "Lo esencial" ("en torno o sobre colegios similares") es **correcto**.
- El encabezado del módulo ("**Bajo el promedio** de su grupo similar en las cuatro dimensiones") **no es solo contradictorio: es la afirmación opuesta a la verdad.** Una familia que leyera ese módulo concluiría que Brasilia es débil en bienestar cuando está *a la par o mejor* que sus pares en todo. Ejemplo perfecto de la tesis: una frase confiada, en lenguaje claro, que invierte el dato. **Severidad: crítica, confirmada.**

**Nuevo matiz para Fase B:** a diferencia de SIMCE, el IDPS **no tiene flag de significancia** en el dataset (solo `prom`, `difgru`, `dif`). Entonces valores chicos como +1 (hábitos 8°) o +3 (clima 8°) **no pueden llamarse "sobre" con la misma autoridad** que SIMCE. Regla distinta por indicador: SIMCE usa `siggru`; IDPS necesita un umbral descriptivo explícito y **nunca** la palabra "significativo".

### 9.3 Trazabilidad — error de año en las fuentes (nuevo hallazgo)

Los datos crudos son **2025** (`idps8B2025`, `simce8b2025`, `simce4b2025`, `simce2m2025`); solo SIMCE 6° es 2024 (`simce6b2024`). Pero Figma cita:
- Bienestar: "IDPS 8° básico **2024**" → **año equivocado** (es 2025) y además omite 2° medio (§4.5).
- Académico: "SIMCE **2024**" → mislabela 3 de 4 cursos (4°, 8°, 2°M son 2025).

Citar el año equivocado en el pie de fuente contradice directamente el principio de transparencia. **Severidad: media-alta.**

### 9.4 Identidad y seguridad

| Claim | Dato | Veredicto |
|---|---|---|
| "487 estudiantes" | MAT_TOTAL = 487 | ✅ (el nombre de capa "445" estaba viejo; el texto está bien) |
| "Educación pública (SLEP)" | COD_DEPE = 6 | ✅ |
| "Gratuito, sin copago" | PAGO_MATRICULA/MENSUAL = GRATUITO | ✅ |
| "Liceo **Polivalente** Ciudad de Brasilia" | NOM_RBD = "LICEO CIUDAD DE BRASILIA" | ⚠️ "Polivalente" agregado a mano; no está en el dato |
| "A 1,2 km de tu casa" | LAT/LONG presentes; sin dirección de referencia | ⏳ No verificable (placeholder de testeo) |
| Seguridad: "2 denuncias en 2025 y 1 en 2024" | conteo_25 = 2, conteo_24 = 1 | ✅ conteos correctos; falta tasa + volatilidad (§4.6 en pie) |

### 9.5 Reconstrucción de las tres barras de Bienestar (para Fase B)

Las barras "Este colegio / Colegios similares / Promedio nacional" son derivables: `grupo = prom − difgru`, `nacional = prom − dif`. Ej. Clima 8°: colegio 78, grupo 75, nacional 72. **Ojo de diseño:** vs. nacional el resultado es mixto (ej. autoestima 8° = 74 vs 78 nacional → *bajo* el nacional), lo que reintroduce una lectura "bajo el promedio" que compite con el marco anti-ranking (comparar contra pares). La barra nacional puede estar saboteando el mensaje central.

### 9.6 Veredicto de Fase A

| Hallazgo | Estado tras verificación |
|---|---|
| §4.1 Contradicción Bienestar | **Confirmado y agravado** — el encabezado es factualmente falso |
| §4.2 "Significativa" | **Revisado** — respaldado para SIMCE (`siggru`); no aplicable a IDPS |
| §4.3 Cuantificadores universales | **Verificado verdadero** en Académico |
| §4.4 Umbral de banda | **Vigente** — y ahora se sabe que difiere por indicador (SIMCE vs IDPS) |
| §4.5 Fuente incompleta | **Confirmado** + error de año (§9.3) |
| §4.6 Tasa + volatilidad denuncias | **Vigente** |
| §4.7 Contenido a mano | **Confirmado como causa raíz** (no hay generador de frases) |

**Conclusión:** de siete hallazgos, la mitad son errores reales de traducción (uno de ellos invierte el dato), un par eran sospechas que la verificación descartó, y el resto son reglas ausentes. Todos apuntan a lo mismo: **hace falta una capa de traducción única, calculada y testeada.** Eso es la Fase B.
