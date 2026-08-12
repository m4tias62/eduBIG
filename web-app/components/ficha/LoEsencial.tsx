import type { Colegio, ConclusionesColegio } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { conclusionCosto } from "@/lib/data/formatters";

/**
 * Bloque "Lo esencial" — 4 filas con la conclusión de cada dimensión.
 * Espejo del frame Figma "Lo esencial" (113:353 / 167:595).
 *
 * Iconos Material Symbols: shield · mood · school · monetization_on
 * (mismos identificadores que usa el gob.cl UI Kit en Figma).
 *
 * Las conclusiones de Seguridad/Bienestar/Académico salen del pipeline
 * (colegios_conclusiones.json). La de Costo se deriva en runtime desde el
 * universo — porque hoy modulos.Costo no existe en el pipeline (registrado
 * en bitácora 2026-08-12).
 */
export function LoEsencial({
  colegio,
  conclusiones,
}: {
  colegio: Colegio;
  conclusiones: ConclusionesColegio | null;
}) {
  const filas: Array<{ label: string; texto: string; icono: string }> = [
    { label: "Seguridad", texto: conclusiones?.lo_esencial.Seguridad ?? "Sin información publicada.", icono: "shield" },
    { label: "Bienestar", texto: conclusiones?.lo_esencial.Bienestar ?? "Sin información publicada.", icono: "mood" },
    { label: "Académico", texto: conclusiones?.lo_esencial.Académico ?? "Sin información publicada.", icono: "school" },
    { label: "Costo", texto: conclusionCosto(colegio), icono: "monetization_on" },
  ];

  return (
    <section className="flex flex-col gap-m">
      <h2 className="text-md font-bold text-texto-primario">Lo esencial</h2>
      <ul className="flex flex-col gap-m">
        {filas.map(({ label, texto, icono }) => (
          <li key={label} className="flex gap-s">
            <div className="mt-xxs shrink-0">
              <Icon nombre={icono} size={20} className="text-texto-primario" />
            </div>
            <div className="flex flex-col gap-xxs">
              <p className="text-xs font-bold text-texto-primario">{label}</p>
              <p className="text-xs text-texto-secundario">{texto}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
