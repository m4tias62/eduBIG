import { redirect } from "next/navigation";

/** /test → /test/q1. Punto de entrada del quiz. */
export default function TestIndex() {
  redirect("/test/q1");
}
