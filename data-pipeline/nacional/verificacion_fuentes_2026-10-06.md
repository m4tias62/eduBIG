# Verificación de fuentes — 2026-10-06

Pregunta: ¿los archivos de `data-pipeline/raw/` son los oficiales, sin modificar?

Método: Matías descargó de nuevo las fuentes desde los sitios oficiales el 2026-10-06 (carpeta `raw/_verificacion_2026-10-06/`, archivos `.rar` sin abrir). Se descomprimieron con unrar (con control de integridad CRC) y se compararon byte a byte (MD5) contra los archivos de `raw/`.

Fuentes:
- SIMCE e IDPS 2025 por establecimiento: Agencia de Calidad, informacionestadistica.agenciaeducacion.cl
- Directorio Oficial 2025: Mineduc, datosabiertos.mineduc.cl

| Archivo en `raw/` | MD5 | Resultado |
|---|---|---|
| 20250926_Directorio_Oficial_EE_2025_20250430_WEB.csv | 80be2b37bf1879dd47875422641bd297 | Idéntico a la descarga oficial |
| simce4b2025_rbd_final.csv | d4f31cfcacdf38d7f031158e3dbdaa78 | Idéntico a la descarga oficial |
| simce8b2025_rbd_final.csv | df32b0ee43b1b439447dc0fb7c0234fd | Idéntico a la descarga oficial |
| simce2m2025_rbd_final.csv | 62db085b486398c377cc2268f5684dc4 | Idéntico a la descarga oficial |
| idps4B2025_rbd_final.csv | 8b6ad0e5cc88706ea9233f391ba1488c | Idéntico a la descarga oficial |
| idps8B2025_rbd_final.csv | 17ebaa5446a50ead0a4ecfb3d23b7b87 | Idéntico a la descarga oficial |
| idps2M2025_rbd_final.csv | 08d8d8793f5faa16c52fa53347288388 | Idéntico a la descarga oficial |

Conclusión: los 7 archivos son los oficiales, sin modificar.

Nota sobre 8° básico: los archivos "final" y "preliminar" de 8° básico (SIMCE e IDPS) son idénticos entre sí. La descarga oficial confirma que la versión final publicada por la Agencia es igual a la preliminar; no es una copia renombrada.

Se agregó a `raw/` el esquema de registro del Directorio (`ER_Directorio_Oficial_EE_WEB.pdf`), que venía dentro del `.rar` oficial.
