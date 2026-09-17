import { Card } from "./Card";
import { SectionHeading } from "./SectionHeading";

/**
 * Componente legado preservado apenas para compatibilidade de importação.
 * A categorização por palavras-chave não faz parte do Dashboard analítico
 * definido em RF-27 e, portanto, não é mais renderizada como indicador.
 */
export function CategoryChart() {
  return (
    <Card className="min-h-[180px]">
      <SectionHeading
        title="Classificação de atividade"
        description="Visualização descontinuada no Dashboard atual"
      />
      <p className="mt-8 text-center text-xs leading-relaxed text-muted">
        O Dashboard deve priorizar Ativo/Inativo, tempo por task e classificação dentro/fora do escopo, conforme RF-27.
      </p>
    </Card>
  );
}
