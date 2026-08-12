import type { Colegio, ConclusionesColegio } from "@/lib/types";
import { dependenciaGlosa, nivelesGlosa, matriculaGlosa } from "@/lib/data/formatters";
import { Icon } from "@/components/ui/Icon";

/**
 * Cabecera de la ficha — imagen placeholder + nombre + tres metadatos.
 *
 * Espejo del frame Figma "Cabecera" (113:338 / 167:580). La imagen real
 * queda como placeholder gris; cuando existan fotos por colegio, se
 * intercambia por <Image src=... /> de next/image sin cambiar el resto.
 *
 * Nombre: prefiere identidad.nombre del pipeline (sentence case) sobre
 * NOM_RBD del Directorio (ALL CAPS crudo).
 */
export function Cabecera({
  colegio,
  conclusiones,
}: {
  colegio: Colegio;
  conclusiones?: ConclusionesColegio | null;
}) {
  const nombre = conclusiones?.identidad.nombre ?? colegio.NOM_RBD;

  return (
    <section className="flex flex-col gap-m">
      {/* Placeholder de imagen — 16:9 ratio */}
      <div className="w-full aspect-video rounded-m bg-superficie-hundida border border-borde-sutil flex items-center justify-center">
        <Icon nombre="apartment" size={48} className="text-texto-terciario" />
      </div>

      <h1 className="text-lg font-bold text-texto-primario">
        {nombre}
      </h1>

      <ul className="flex flex-col gap-xs text-xs text-texto-secundario">
        <li className="flex items-center gap-xs">
          <Icon nombre="apartment" size={16} />
          {dependenciaGlosa(colegio.COD_DEPE)}
        </li>
        <li className="flex items-center gap-xs">
          <Icon nombre="school" size={16} />
          {nivelesGlosa(colegio.ofrece_basica, colegio.ofrece_media)}
        </li>
        <li className="flex items-center gap-xs">
          <Icon nombre="groups" size={16} />
          {matriculaGlosa(colegio.MAT_TOTAL)}
        </li>
      </ul>
    </section>
  );
}
