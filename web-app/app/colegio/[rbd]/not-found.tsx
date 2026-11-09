import { Enlace } from "@/components/ui/Enlace";

export default function NotFound() {
  return (
    // Mismo contenedor y márgenes que Comparar colegios: alineado a la izquierda
    <div className="contenedor flex flex-col gap-m pt-l pb-xl lg:pt-xl lg:pb-xxl">
      <div className="flex flex-col gap-m ancho-6-col">
        <h1 className="text-lg font-bold text-texto-primario">
          Colegio no encontrado
        </h1>
        <p className="text-sm text-texto-secundario">
          No tenemos datos para el RBD que buscaste. Puede que no tenga matrícula
          en 2025 o que solo imparta educación de adultos o parvularia, que
          Edubig no cubre.
        </p>
        <Enlace href="/#explorar" icono="arrow_back" className="-ml-xxs self-start">
          Buscar otro colegio
        </Enlace>
      </div>
    </div>
  );
}
