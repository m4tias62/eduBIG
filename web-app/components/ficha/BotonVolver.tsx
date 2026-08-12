import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

/** Botón "Volver" — enlace al Home u origen dado en href. */
export function BotonVolver({
  href = "/",
  label = "Volver",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-xs text-sm font-medium text-interaccion-enlace hover:text-interaccion-enlace-hover"
    >
      <Icon nombre="arrow_back" size={20} />
      {label}
    </Link>
  );
}
