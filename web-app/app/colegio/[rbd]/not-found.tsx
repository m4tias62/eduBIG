import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto p-l flex flex-col gap-m">
      <h1 className="text-lg font-bold text-texto-primario">
        Colegio no encontrado
      </h1>
      <p className="text-sm text-texto-secundario">
        No tenemos datos para el RBD que buscaste. Puede que ya no esté activo
        en el Directorio Mineduc, o que no pertenezca al universo de Pudahuel
        que Edubig cubre hoy.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-interaccion-enlace hover:text-interaccion-enlace-hover"
      >
        ← Volver al inicio
      </Link>
    </div>
  );
}
