import type { DetalleColegio } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";

/**
 * "Lo esencial": una frase por dimensión. Sale de la MISMA función de la capa
 * de traducción que cada módulo (Fase B): no pueden contradecirse.
 * Trayectoria aparece solo en colegios con media (D28).
 */
export const FILAS_ESENCIAL: Array<{
  clave: keyof DetalleColegio["traduccion"]["lo_esencial"];
  label: string;
  icono: string;
}> = [
  { clave: "Seguridad", label: "Seguridad", icono: "shield" },
  { clave: "Bienestar", label: "Bienestar", icono: "mood" },
  { clave: "Académico", label: "Académico", icono: "menu_book" },
  { clave: "Trayectoria", label: "Ingreso a la universidad", icono: "trending_up" },
  { clave: "Costo", label: "Costo", icono: "monetization_on" },
];

export function LoEsencial({ detalle }: { detalle: DetalleColegio }) {
  const le = detalle.traduccion.lo_esencial;
  return (
    <section className="flex flex-col gap-m">
      <h2 className="text-md font-bold text-texto-primario">Lo esencial</h2>
      <ul className="flex flex-col gap-m">
        {FILAS_ESENCIAL.filter((f) => le[f.clave]).map(({ clave, label, icono }) => (
          <li key={clave} className="flex gap-s">
            <div className="mt-xxs shrink-0">
              <Icon nombre={icono} size={20} className="text-texto-primario" />
            </div>
            <div className="flex flex-col gap-xxs">
              <p className="text-xs font-bold text-texto-primario">{label}</p>
              <p className="text-xs text-texto-secundario">{le[clave]}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
