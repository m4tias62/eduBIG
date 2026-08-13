import Isologo from "./Isologo";

/**
 * Footer / Móvil — espejo del componente Figma "Footer / Móvil" (id 418:1368).
 *
 * Estructura:
 *   Identidad (isologo + tagline)
 *   Columnas (Fuentes de datos + Equipo)
 *   Divider
 *   Meta (© + fecha de actualización)
 *
 * Fondo: superficie-inversa (semántico, NO usar temperatura frío/cálido).
 * Se instancia en Home Lista y en cada ficha de colegio. Se excluye
 * intencionalmente del flujo del quiz y de las vistas de mapa.
 */
export function Footer() {
  return (
    <footer className="w-full bg-superficie-inversa px-l pt-xl pb-l flex flex-col gap-l text-texto-sobre-oscuro">
      {/* Identidad */}
      <div className="flex flex-col gap-m">
        <Isologo />
        <p className="text-xs text-texto-sobre-oscuro-secundario">
          Traducimos datos oficiales en decisiones familiares informadas.
        </p>
      </div>

      {/* Columnas */}
      <div className="flex gap-l">
        <div className="flex flex-col gap-xs flex-1">
          <p className="text-2xs font-bold text-texto-sobre-oscuro-secundario">
            Fuentes de datos
          </p>
          <p className="text-xs">Mineduc</p>
          <p className="text-xs">Agencia de Calidad</p>
          <p className="text-xs">Supereduc</p>
        </div>

        <div className="flex flex-col gap-xs flex-1">
          <p className="text-2xs font-bold text-texto-sobre-oscuro-secundario">
            Equipo
          </p>
          <div className="flex items-center gap-xs flex-wrap">
            <span className="text-xs">Israel Rubilar</span>
            <a
              href="https://www.linkedin.com/in/joseisraelrubilar/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xs text-texto-sobre-oscuro-secundario underline"
            >
              LinkedIn
            </a>
          </div>
          <div className="flex items-center gap-xs flex-wrap">
            <span className="text-xs">Matías Cáceres</span>
            <a
              href="https://www.linkedin.com/in/matias-caceres-maureira-9b6051259/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xs text-texto-sobre-oscuro-secundario underline"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      {/* Divider — blanco 15% (borde/* del design system está calibrado para
          superficies claras y no aplica sobre oscuro) */}
      <div className="h-px w-full bg-white/[.15]" />

      {/* Meta */}
      <div className="flex flex-col gap-xxs text-2xs text-texto-sobre-oscuro-terciario">
        <p>© 2026 Edubig · Un sistema que se traduce en cuidado.</p>
        <p>Datos actualizados a agosto 2026 · Aviso de privacidad</p>
      </div>
    </footer>
  );
}
