import { Card } from "./Card";
import { SectionHeading } from "./SectionHeading";

/**
 * Lista aplicações registradas sem ranking ou interpretação de produtividade.
 *
 * Estrutura esperada: { name, time, inScope }.
 * O componente não é renderizado no Dashboard enquanto o contrato atual da API
 * não fornece a classificação dentro/fora do escopo da task.
 */
export function AppsCard({ applications = [] }) {
  return (
    <Card className="min-h-[257px]">
      <SectionHeading
        title="Aplicações registradas"
        description="Classificação em relação ao escopo da task"
      />
      {applications.length ? (
        <ul className="mt-5 grid gap-3" aria-label="Aplicações registradas">
          {applications.map((application) => (
            <li
              key={application.name}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-xs dark:border-slate-700"
            >
              <strong className="text-ink dark:text-white">{application.name}</strong>
              <span className="text-muted">{application.time || "—"}</span>
              <span className="font-semibold text-muted">
                {application.inScope === true
                  ? "Dentro do escopo"
                  : application.inScope === false
                    ? "Fora do escopo"
                    : "Escopo não informado"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-center text-xs leading-relaxed text-muted">
          A API atual ainda não disponibiliza aplicações associadas à task com classificação dentro/fora do escopo.
        </p>
      )}
    </Card>
  );
}
