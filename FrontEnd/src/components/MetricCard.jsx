import { Card } from "./Card";

/**
 * Exibe uma métrica com ícone, valor e detalhe.
 */
export function MetricCard({ icon, tone, label, value, detail }) {
  return (
    <Card className="flex min-h-[131px] items-start gap-3.5 p-5">
      <div
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl font-bold ${tone}`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <h2 className="mt-1 font-display text-[23px] font-extrabold text-ink dark:text-white">
          {value}
        </h2>
        <small className="text-[11px] font-semibold text-muted">{detail}</small>
      </div>
    </Card>
  );
}
