import { Icon } from "@/components/ui/Icon";

/**
 * D25 — El grupo de comparación no se muestra de entrada: aparece al tocar el
 * ícono de info de cada curso, con una explicación de por qué puede cambiar.
 *
 * TEXTO BORRADOR (pendiente de redacción de Matías): debe evitar que la
 * etiqueta del grupo se lea como juicio sobre el colegio.
 */
export function InfoGrupo({ curso, grupo }: { curso: string; grupo?: string }) {
  return (
    <details className="group">
      <summary
        className="min-h-[44px] min-w-[44px] inline-flex cursor-pointer list-none items-center justify-center rounded-full text-texto-secundario hover:text-texto-primario [&::-webkit-details-marker]:hidden"
        aria-label={`¿Con qué colegios se compara en ${curso}?`}
      >
        <Icon nombre="info" size={20} />
      </summary>
      <div className="mt-xs rounded-m border border-borde-sutil bg-superficie-elevada p-m text-2xs text-texto-secundario">
        {grupo ? (
          <p>
            En {curso}, comparamos con colegios cuyas familias tienen un nivel socioeconómico
            parecido: el grupo <strong className="text-texto-primario">{grupo.toLowerCase()}</strong>,
            según la Agencia de Calidad. El grupo describe a las familias de los estudiantes, no
            la calidad del colegio. Puede cambiar entre cursos porque la Agencia lo calcula para
            cada prueba, con las familias de quienes la rindieron.
          </p>
        ) : (
          <p>
            La Agencia de Calidad no publicó un grupo de comparación para {curso} en este colegio.
          </p>
        )}
      </div>
    </details>
  );
}
