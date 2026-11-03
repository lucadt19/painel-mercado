import Link from "next/link";
import { Card, SectionTitle } from "@/components/ui/card";

/** Manchetes: reservado até a etapa 6 (feeds RSS). */
export function Headlines() {
  return (
    <section aria-labelledby="manchetes-title">
      <SectionTitle
        aside={
          <Link href="/noticias" className="hover:text-accent">
            Ver todas
          </Link>
        }
      >
        <span id="manchetes-title">Manchetes</span>
      </SectionTitle>
      <Card className="p-4 text-sm text-muted">
        As manchetes chegam na etapa 6, com os feeds de veículos de economia e negócios.
      </Card>
    </section>
  );
}
