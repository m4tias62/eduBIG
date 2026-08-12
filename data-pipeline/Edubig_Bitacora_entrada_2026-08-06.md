# Bitácora — Entrada 2026-08-06 · Testeo 1–2 y Capa de Traducción (Fases A y B)

## Contexto
Primeros dos testeos de usabilidad (Jocelyn y Tamara, perfil "algo" en datos, muestra de conveniencia) sobre 3 pantallas: Home—Lista, Ficha (Graham Bell) y Ficha con media (Brasilia). Enfoque adoptado: **testeo iterativo** — refinar mientras se testea, en vez de esperar 5–6 sesiones. Cada mejora enriquece el prototipo para la siguiente ronda.

## Hallazgos del testeo
- **Usabilidad OK, comprensión no.** Tamara navegó sin problemas pero interpretó desde la lógica de ranking ("menor promedio = más malo"). Es el gap de comprensión del research (SIMCE): usabilidad perfecta ≠ interpretación correcta.
- **Observación de moderador (Matías):** ambas se vieron incómodas con el análisis pese a autodeclararse "rango medio"; el propio diseñador percibe carga cognitiva alta. Se toma como dato (conducta observada > autorreporte).
- **UI (Jocelyn):** barras sin leyenda; "Autoestima de qué" (título ambiguo); pidió tooltips.

## Reencuadre (decisión conceptual)
El producto de Edubig es la **traducción** (la interpretación del dato), no la visualización. La interpretación debe ser objetiva, honesta y lógica: sin errores de cálculo que deriven en interpretación errónea. **Una conclusión en lenguaje claro que está mal es más peligrosa que un número mal**, porque se recibe con autoridad y no se puede auditar.

## Auditoría Fase A — causa raíz
**No existe capa de traducción formalizada:** las frases están escritas a mano en Figma (confirmado: `web-app` no tiene código, solo `public/`). Por eso se contradicen. Hallazgos verificados contra `colegios_enriquecidos.json`:
- **Contradicción crítica en Bienestar (Brasilia):** el módulo decía "bajo el promedio en las cuatro dimensiones" — **factualmente falso**; el colegio está a la par o sobre sus pares en todas (difgru ≥ 0). "Lo esencial" ("en torno o sobre") era la correcta.
- **"Estadísticamente significativa" (Académico):** respaldada — SIMCE trae flag `siggru` de la Agencia (para Brasilia, +1 en las 8 celdas). Honesta para SIMCE.
- **Error de año en fuentes:** datos 2025; Figma citaba "2024".
- Cuantificadores universales frágiles; barra "Promedio nacional" reintroduce lectura de ranking.

## Decisiones (Fase B — Ruleset de Traducción)
1. **SIMCE:** banda por flag `siggru` (+1 sobre / 0 en torno a / −1 bajo). No se inventa umbral.
2. **IDPS:** sin flag de significancia → **umbral ±5** sobre difgru (>+5 sobre, <−5 bajo, resto a la par). En IDPS **se prohíbe** la palabra "significativo".
3. **Marco de referencia:** solo grupo similar (mismo GSE). **Se retira la barra nacional** (competía con el mensaje anti-ranking).
4. **Cuantificadores universales:** si hay mezcla, degradar a "N de M" nombrando excepciones. Nunca "en todos" si no es en todos.
5. **Denuncias:** siempre tasa + conteo; aviso de volatilidad si total ≤ 5.
6. **Trazabilidad:** año real (SIMCE 2025 preliminar + 6° básico 2024 final; IDPS 2025 preliminar).
7. **Fuente única:** "Lo esencial" reusa las funciones del módulo → contradicción imposible.
8. **Modo de trabajo:** delegado (Claude prototipa la función; Matías decidió las reglas).

## Verificación
Función determinista sobre 62 colegios activos: **0 contradicciones** Lo esencial vs. módulo. Brasilia → Bienestar "a la par en las cuatro dimensiones", Académico "sobre en las dos materias, en todos los cursos". Caso mixto (Lo Boza) degrada correctamente.

## Artefactos
- `data-pipeline/scripts/capa_traduccion.py` (+ `test_capa_traduccion.py`)
- `web-app/public/data/colegios_conclusiones.json` (salida del pipeline)
- `data-pipeline/Edubig_Auditoria_Capa_Traduccion_FaseA.md`
- `data-pipeline/Edubig_FaseB_Ruleset_Traduccion.md`

## Pendientes
- **UI quick-wins del testeo:** rotular las 3 barras; renombrar "Autoestima" → "Autoestima académica y motivación escolar" + subtítulo humano; tooltips por dimensión.
- **Rediseño módulo Bienestar:** retirar barra nacional; conectar las frases a `colegios_conclusiones.json`.
- **Auditar** Home—Lista y Ficha Graham Bell; **consistencia cruzada** entre fichas.
- **Próxima ronda de testeo:** reclutar los extremos que faltan — una "nada" (tipo Carolina, celular, sin planillas) y una "alta" (Herrera/Martín).
- **Parámetros calibrables:** `UMBRAL_IDPS=5`, `UMBRAL_VOLATILIDAD_DENUNCIAS=5`.

---

## Consideración para la próxima sesión — Escalabilidad (axiomas del sistema)

**Principio rector:** las reglas de producción / axiomas de Edubig deben diseñarse para escalar — idealmente a nivel nacional, o al menos a la Región Metropolitana (Santiago) como paso intermedio. Un axioma solo es válido si sigue siendo correcto cuando el universo pasa de 57 colegios a miles.

**Criterio para evaluar cada axioma:** preferir reglas que sean (a) **ancladas a convenciones nacionales** ya definidas por la autoridad, (b) **parametrizadas y re-validables**, no hardcodeadas a Pudahuel, y (c) **deterministas y testeables**, para que la correctitud escale sola.

Implicancias concretas sobre lo que ya construimos:

- **Grupo de referencia (GSE):** escala bien — "colegios similares = mismo grupo socioeconómico" es una clasificación nacional de la Agencia, no local. Al expandir, los valores de referencia deben venir del mismo agrupamiento nacional, no recalcularse localmente.
- **Significancia SIMCE (`siggru`):** totalmente escalable — la calcula la Agencia a nivel nacional. Cero lógica local.
- **Umbral IDPS (±5):** ⚠️ se derivó de la distribución de Pudahuel (DE 4,5). Decisión pendiente para escalar: ¿es una **constante nacional** (un "+6" significa lo mismo en todo Chile — más honesto, pero hay que validarlo con datos nacionales) o se **deriva por alcance**? Recomendación inicial: constante nacional, re-validada al ampliar el universo.
- **Volatilidad de denuncias (≤5):** basada en conteos absolutos, independiente del tamaño del universo. Escala; re-validar.
- **Arquitectura como decisión de escalabilidad:** formalizar la capa de traducción (frases generadas, no escritas a mano) **es** lo que permite escalar. Escribir conclusiones a mano no sobrevive a miles de colegios. Este es el activo escalable más importante.
- **Pipeline de datos:** las fuentes (Mineduc, Agencia, Supereduc) ya son nacionales; hoy se filtran a Pudahuel. Escalar es sobre todo cambiar el filtro, no re-arquitecturar. Buena señal.
- **Casos borde se multiplican con la escala:** más colegios = más empty states, más data sucia, más configuraciones raras (Ed. Especial, adultos). Las reglas deben degradar con gracia; los empty states ya especificados son base, pero se estresarán al ampliar.

**Regla de oro para próximos axiomas:** ninguno debe asumir implícitamente "universo local y chico". Si un axioma solo funciona con 57 colegios, no es un axioma — es un parche.

---

## Revisión de axioma — IDPS usa `sigdifgru` (se retira el ±5)

Al validar el umbral IDPS con datos nacionales (primer punto de la continuación, según lo acordado) apareció que **el flag de significancia de la Agencia `sigdifgru` (−1/0/+1) sí existe a nivel nacional** — se había perdido en el merge (paso 02). Por eso creíamos que el IDPS no tenía flag y armamos el ±5.

**Decisión:** IDPS usa `sigdifgru`, el mismo criterio que SIMCE. Se retira el ±5.

**Evidencia (34.266 mediciones IDPS nacionales):** el ±5 coincide con el flag el 84,7%; cuando discrepa, **siempre subdeclara** (15,3% de casos; 0% sobredeclara); y el **36% de las diferencias que la Agencia considera significativas** tenían |difgru|≤5 — el ±5 las borraba.

**Impacto Brasilia:** Bienestar pasa de *"a la par en las cuatro dimensiones"* a *"a la par en 6 de 8 mediciones; sobre en Autoestima académica 2° medio y Participación y formación ciudadana 2° medio"* — dos fortalezas reales que el ±5 escondía.

**Por qué es el axioma correcto (escalabilidad):** anclado a una convención nacional de la Agencia, no a un umbral local. Es justo la regla de oro de arriba.

**Artefactos:** `capa_traduccion.py` (banda por flag, unificada SIMCE+IDPS), `enriquecer_sigdifgru.py` (reincorpora la columna; su lógica va al merge), dataset y `colegios_conclusiones.json` regenerados (con backup), spec Fase B actualizado.

**Pendiente:** (1) integrar `sigdifgru` al merge notebook (02) — tuyo; (2) actualizar la conclusión de Bienestar en Figma (quedó "a la par en las cuatro", ahora desactualizada); (3) decidir cómo presentar en el encabezado las conclusiones **mixtas/largas** (ej. resumen corto + detalle) — el texto degradado es honesto pero verboso.

---

## Cierre — patrón de conclusión mixta (resumen corto + detalle)

**Decisión (2 y 3 resueltos):** cuando el resultado no es uniforme, el **encabezado** muestra un resumen cualitativo corto y la **especificidad vive en el detalle**. Función `resumen()` en la capa: frase plena si es uniforme; si es mixto, base según banda dominante + fortalezas/brechas con ámbito (nunca sobre-afirma, nunca "en todos" si no es en todos).

- Brasilia Bienestar → *"A la par de colegios similares, con fortalezas en 2° medio."*
- Académico mixto (antes "Resultados mixtos", vago) → ahora p. ej. Lo Boza: *"Bajo colegios similares en la mayoría de los cursos, con fortalezas en 4° básico."*

**Figma re-sincronizado:** encabezado del módulo + "Lo esencial" al resumen corto; y en el **detalle** se agregó una etiqueta de banda por bloque de nivel (*A la par de sus pares* / *Sobre sus pares* / *Bajo sus pares*) que hace verificable el resumen al desplegar. Verificado con screenshot (Autoestima: 8° "A la par", 2° medio "Sobre sus pares").

**Único pendiente vivo:** integrar `sigdifgru` al merge (02) — tuyo.

---

## Cierre — `sigdifgru` integrado al merge (hecho)

El merge (`02_merge_dataset_v2.ipynb`) ahora conserva `sigdifgru` de forma nativa: selección (celda 14), `values` del pivot (celdas 15 y 17) y renombrado con los 4 nombres al final (celdas 16 y 18), en los tres niveles (2m/4b/8b). `colegios_enriquecidos.json` regenerado desde el pipeline; test verde (62 colegios, 0 contradicciones; Brasilia = "A la par…, con fortalezas en 2° medio").

**Aprendizaje:** un descuido en las celdas 17/18 (4b/8b) omitió `sigdifgru` sin dar error — largos de columnas que calzaban. Lo cazó el test aguas abajo, no Python. Refuerza dos cosas: (1) el renombrado posicional es frágil (candidato futuro: aplanar el MultiIndex por programa); (2) la capa determinista + testeada es la red de seguridad.

**Obsoletos por este cambio:** `scripts/enriquecer_sigdifgru.py` (su lógica ya vive en el merge) y `web-app/public/data/colegios_enriquecidos.bak.json` (backup del parche). Se pueden borrar. → Borrados.

---

## Tooltips — términos técnicos clave (hecho, con remate manual)

**Decisión de scope:** como la ficha ya explica mucho (subtítulos, etiquetas de banda, nota al pie, fuente), el tooltip apunta a lo que faltaba: **la base del método** — qué es un "colegio similar" (mismo GSE) y qué significa "sobre / a la par / bajo sus pares". Un solo tooltip a nivel de módulo, no uno por dimensión (evita redundancia).

**Construido en Figma:**
- Componente `Tooltip / Método comparación` (card con el texto metodológico).
- Ícono ⓘ junto al título "Bienestar" en el componente (lo hereda toda ficha).
- Reacción ON_CLICK en el ⓘ de Brasilia → abre el tooltip como overlay.

**Remate manual pendiente (limitación de la API):** `overlayPositionType` y `overlayBackgroundInteraction` son de solo lectura vía plugin, así que en la pestaña Prototype hay que: (1) cambiar la posición del overlay de "Centrada" a **Manual** anclada al ícono, y (2) marcar **"cerrar al hacer clic afuera"**. Sin (2) el tooltip no se puede cerrar en el test.

**Replicable:** el mismo patrón (ⓘ + tooltip) aplica a Académico cuando se quiera.

---

## Re-sincronización de Graham Bell + consistencia cruzada (hecho)

La segunda ficha testeada (Escuela Alexander Graham Bell, RBD 10090, "Ficha colegio — Mobile") tenía conclusiones **viejas y falsas** (Bienestar decía "Bajo el promedio… en las cuatro" cuando la realidad es 2 bajo / 2 a la par). Re-sincronizada a la capa de traducción:

- **Lo esencial** y **módulo Bienestar**: *"A la par de colegios similares, con brechas en 8° básico."*
- **Académico** (Lo esencial + módulo): *"Por sobre colegios similares en la mayoría de los cursos, con brechas en 8° básico."*
- **Bandas 8b**: Clima y Hábitos → "Bajo sus pares"; Autoestima y Participación → "A la par". Valores de barras ya eran los correctos.
- **Fuente del módulo**: corregida a "IDPS 8° básico" (Graham Bell es básica-solo; el "y 2° medio" heredado sobre-afirmaba).

**Bug de la capa que Graham Bell destapó (corregido):** `detalle_bienestar` fijaba el alcance "(8° básico y 2° medio)" aunque el colegio no tenga media; ahora refleja los niveles con dato. Brasilia (media, datos completos) nunca lo expuso.

**Decisiones de dato (resueltas):**
1. **Denuncias 2024 = null → "sin datos publicados"** (decisión de Matías; nulos llevan nota transparente, no se asume 0). Se corrigió `conclusion_seguridad` para distinguir null de 0; el Figma de Graham Bell ya lo decía bien, así que quedó consistente. Ej.: *"2 denuncias en 2025 (4,5 por cada 1.000 estudiantes) y 2024 sin datos publicados, ante la Superintendencia."*
2. **Texto de "significancia estadística" del Académico:** verificado contra el dato — es **correcto** (matemática significativa en los 3 cursos, lectura solo en 8°, y donde no es significativo queda dentro del rango). No se tocó.

**Otros arreglos:** pie de fuente del **Académico** corregido en ambas fichas ("SIMCE 2024" → "SIMCE 2025 (preliminar); 6° básico 2024 (final)"); tooltip ⓘ **cableado también en Graham Bell** (antes era un botón muerto).

**Estado prototipo:** ambas fichas testeadas dicen la verdad y son consistentes entre sí.

---

## Ícono gob.cl + secciones colapsables (hecho)

**Ícono:** el ⓘ dibujado se reemplazó por el componente **`info` real del UI Kit gob.cl** (importado por key `6e6de948…`), envuelto en un frame local para poder cablearle la reacción. Los demás íconos (`groups`, `shield`…) ya eran del kit. Tooltip re-cableado en ambas fichas.

**Aprendizaje técnico (reacciones vía API):** el formato válido en este archivo lleva `action` (singular) **y** `actions`, con `resetVideoPosition`; y para overlays en posición **Manual** la acción exige `overlayRelativePosition`. Sin ese campo, "Invalid format for prototypeInteractions". Para variantes se usa `navigation: 'CHANGE_TO'` con `SMART_ANIMATE`.

**Colapsables:** el componente **`Módulo ficha`** (variantes Abierto/Cerrado) se volvió **interactivo** — el chevron alterna Abierto↔Cerrado con smart-animate. Como se cableó en el componente, **Bienestar colapsa en ambas fichas**. Colapsado = header con conclusión visible + chevron (patrón acordeón).

**Límite importante:** solo **Bienestar** es instancia de `Módulo ficha`. **Académico y Seguridad son frames sueltos** (no el componente), así que **no colapsan** sin convertirlos primero a `Módulo ficha` — tarea mayor que toca su contenido propio (barras de diferencia, detalle de denuncias). Pendiente de decisión.

**A verificar en Present:** que al colapsar, Bienestar muestre la conclusión real de cada ficha (el override) y no el default del componente.
