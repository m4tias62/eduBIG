# Decisiones y supuestos — dataset nacional 2025

Script: `data-pipeline/scripts/05_dataset_nacional.py`. Todas las decisiones son de Matías Cáceres, salvo las marcadas como supuesto.

## Fuentes

- **Base y fuente de verdad:** `raw/Datos_globales_colegios.xlsx`, hoja `base` (Israel Rubilar, 2026-09-28). Si otra fuente contradice al xlsx, gana el xlsx.
- **Complemento:** solo fuentes de 2025, el mismo año del dato más reciente del xlsx.
  - Directorio Oficial 2025 (Mineduc): coordenadas, niveles, PIE y pago mensual. Es la edición más reciente publicada; no hay 2026.
  - SIMCE 2025 de 4° básico, 8° básico y 2° medio (Agencia de Calidad): GSE.
- **No se usan:** años anteriores, el SIMCE de 6° básico 2024 ni el master nacional anterior (eliminado el 2026-10-05).

## Decisiones (2026-10-05)

1. **Universo.** Colegios con básica, media o educación especial: 8.250 de 8.405. Se excluyen 155 (ver `excluidos.csv`):
   - 145 sin matrícula 2025 en el Directorio (sin alumnos ni tipo de enseñanza registrado). Confirmado por Matías: quedan fuera, porque ninguna familia puede matricular ahí.
   - 9 solo de adultos.
   - 1 solo de párvulos.
2. **GSE por prueba.** Se guarda un grupo por prueba (`gse_4b`, `gse_8b`, `gse_2m`). Cada resultado se compara con el grupo de su propia prueba. En 723 colegios el grupo cambia según la prueba.
3. **Colegios sin GSE** (426 en el universo). Se incluyen, sin comparación. La ficha debe decir que no hay SIMCE publicado. Son casi todos escuelas rurales muy pequeñas.
4. **Denuncias.** Un 0 se lee como 0 denuncias. Los vacíos de 2022 a 2024 quedan vacíos.
5. **SIMCE fuera de 150–350.** Se mantienen sin marcar, porque coinciden uno a uno con los archivos oficiales de la Agencia. Por ejemplo, Matemática 2° medio llega a 425.

6. **Comparación con colegios similares (2026-10-06, opción B).** Se agregan desde los archivos oficiales SIMCE e IDPS 2025 la diferencia con similares y su significancia para 4° básico, 8° básico y 2° medio. 8° básico (puntajes SIMCE e IDPS) entra completo aunque no esté en el xlsx: es del mismo año y complementa sin contradecir. Hay que avisarle a Israel.
7. **IDPS: indicador oficial (2026-10-06, opción A).** Excepción a la regla "gana el xlsx": los valores IDPS del xlsx son el promedio simple de las subdimensiones, no el indicador oficial (diferencia menor a 1 punto). Se usa el indicador oficial de la Agencia para que valor, comparación y significancia vengan de la misma fuente. Efecto: los 1.722 ceros IDPS del xlsx resultaron ser datos vacíos en la fuente oficial; ya no quedan ceros ambiguos.
8. **Puntaje sin comparación.** 913 colegios tienen puntaje SIMCE pero la Agencia no publica su comparación con similares. Se tratan como D19: se muestran sin comparación.

## Verificación de fuentes

Los archivos SIMCE, IDPS y Directorio de `raw/` son idénticos a una descarga oficial nueva del 2026-10-06 (ver `verificacion_fuentes_2026-10-06.md`). Los SIMCE e IDPS son la versión final de la Agencia (base del 30-06-2026, v2).

## Supuestos (por confirmar)

- **Gratuidad.** Sale de `PAGO_MENSUAL` del Directorio:
  - "GRATUITO" = sí.
  - "SIN INFORMACION" = sin dato.
  - Cualquier tramo de pago = no.
  - Es lo que declara el colegio, no la adhesión formal a la ley de gratuidad.
- **PIE.** Sale de `CONVENIO_PIE` del Directorio (1 = sí, 0 = no).
- **Coordenadas fuera del continente** (5). Son Isla de Pascua y Juan Fernández. Se marcan, pero son correctas.

## Validación

Los 44 colegios de Pudahuel del xlsx coinciden en un 100 % con `colegios_universo.json` en:
- coordenadas;
- PIE;
- pago mensual;
- niveles;
- GSE de 4° básico y de 2° medio.

Los 13 colegios del MVP que no están en el xlsx no tienen SIMCE ni IDPS.
