import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto p-l flex flex-col gap-m">
      <h1 className="text-lg font-bold text-texto-primario">
        Colegio no encontrado
      </h1>
      <p className="text-sm text-texto-secundario">
        No tenemos datos para el RBD que buscaste. Puede que no tenga matrícula
        en 2025 o que solo imparta educación de adultos o parvularia, que
        Edubig no cubre.
      </p>
      <Link
        href="/explorar"
        className="text-sm font-medium text-interaccion-enlace hover:text-interaccion-enlace-hover"
      >
        ← Buscar otro colegio
      </Link>
    </div>
  );
}
