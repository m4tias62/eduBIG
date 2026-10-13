import { Hero } from "@/components/home/Hero";
import { EntradaExploracion } from "@/components/home/EntradaExploracion";

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
        {/* Retícula: tres promesas de 4 columnas cada una */}
        <ul className="max-w-md flex flex-col gap-m lg:mx-auto lg:max-w-6xl lg:px-xl lg:grid lg:grid-cols-12 lg:gap-x-xl">
          {[
            {
              icono: "quiz",
              titulo: "Recomendar",
              texto: "El Test de Calce arma una lista de 3 colegios según lo que tu familia necesita y prioriza.",
            },
            {
              icono: "travel_explore",
              titulo: "Explorar",
              texto: "Más de 8.000 colegios de todo Chile, con sus datos oficiales traducidos.",
            },
            {
              icono: "compare_arrows",
              titulo: "Comparar",
              texto: "Pon colegios lado a lado (3 en el celular, 4 en el computador). Cada dato se lee contra colegios similares, nunca como ranking.",
            },
          ].map((p) => (
            <li key={p.titulo} className="flex gap-s lg:col-span-4">
              <span className="material-symbols-outlined text-texto-primario" aria-hidden style={{ fontSize: 24 }}>
                {p.icono}
              </span>
              <div className="flex flex-col gap-xxs">
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
