import { Hero } from "@/components/home/Hero";
import { EntradaExploracion } from "@/components/home/EntradaExploracion";
import { Footer } from "@/components/platform/Footer";

/**
 * Home (D31): tres promesas al mismo nivel —comparar, recomendar y explorar—,
 * con el Test de Calce como CTA principal. La exploración parte preguntando
 * "¿Dónde buscas colegio?" (D34); no hay ubicación por defecto (D22).
 */
export default function Home() {
  return (
    <>
      <Hero />
      <EntradaExploracion />
      <section className="bg-superficie-elevada px-l py-xl">
        <ul className="max-w-md mx-auto flex flex-col gap-m">
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
              texto: "Pon hasta 3 colegios lado a lado. Cada dato se lee contra colegios similares, nunca como ranking.",
            },
          ].map((p) => (
            <li key={p.titulo} className="flex gap-s">
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
      <Footer />
    </>
  );
}
