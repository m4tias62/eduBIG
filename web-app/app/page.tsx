import { Hero } from "@/components/home/Hero";
import { EntradaExploracion } from "@/components/home/EntradaExploracion";
import { Ilustracion, type NombreIlustracion } from "@/components/ui/Ilustracion";

/**
 * Home (D31): tres promesas al mismo nivel —comparar, recomendar y explorar—,
 * con el Test de Calce como CTA principal. La exploración parte preguntando
 * "¿Dónde buscas colegio?" (D34); no hay ubicación por defecto (D22).
 */
export default function Home() {
  return (
    <>
      <Hero aside={<EntradaExploracion tarjeta />} />
      {/* En móvil la exploración va bajo el hero; en escritorio, dentro de él. */}
      <div className="lg:hidden">
        <EntradaExploracion />
      </div>
      <section className="bg-superficie-elevada px-l py-xl lg:px-0 lg:py-xxl">
        {/* Escritorio: tres columnas iguales que van de borde a borde de la
            retícula (Recomendar parte en el borde izquierdo y Comparar termina
            en el derecho), separadas por 48 px. La ilustración va sobre el
            texto, centrada respecto de él; el texto sigue alineado a la
            izquierda. Móvil: ilustración a la izquierda del texto. */}
        <ul className="max-w-md flex flex-col gap-l lg:mx-auto lg:max-w-6xl lg:px-xl lg:grid lg:grid-cols-3 lg:gap-x-xxl">
          {(
            [
              {
                ilustracion: "recomendar",
                titulo: "Recomendar",
                texto: "El Test de Calce arma una lista de 3 colegios según lo que tu familia necesita y prioriza.",
              },
              {
                ilustracion: "explorar",
                titulo: "Explorar",
                texto: "Más de 8.000 colegios de todo Chile, con sus datos oficiales traducidos.",
              },
              {
                ilustracion: "comparar",
                titulo: "Comparar",
                texto: "Pon colegios lado a lado (3 en el celular, 4 en el computador). Cada dato se lee contra colegios similares, nunca como ranking.",
              },
            ] satisfies Array<{ ilustracion: NombreIlustracion; titulo: string; texto: string }>
          ).map((p) => (
            <li key={p.titulo} className="flex items-center gap-m lg:flex-col lg:items-start lg:gap-l">
              <Ilustracion
                nombre={p.ilustracion}
                sizes="(min-width: 1024px) 144px, 96px"
                className="w-24 lg:w-36 lg:self-center"
              />
              <div className="flex flex-col gap-xxs lg:self-stretch">
                <p className="text-sm font-bold text-texto-primario">{p.titulo}</p>
                <p className="text-xs text-texto-secundario">{p.texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
