import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getSummaryTotalSeconds } from "../utils/dashboard";
import { Card } from "./Card";
import { SectionHeading } from "./SectionHeading";

/**
 * Exibe o tempo total registrado por dia usando apenas dados atualmente
 * disponíveis na API. Não calcula ou apresenta métricas de produtividade.
 */
export function ActivityChart({ weeklySummaries = [] }) {
  const chartData = weeklySummaries.map((summary) => {
    const registered = Math.round((getSummaryTotalSeconds(summary) / 3600) * 10);
    return {
      day: new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
        .format(new Date(`${summary.date}T12:00:00`))
        .replace(".", ""),
      registered,
    };
  });

  const chartMaximum = Math.max(
    10,
    ...chartData.map(({ registered }) => registered),
  );

  return (
    <Card id="atividade" className="min-h-[286px] lg:col-span-1">
      <SectionHeading
        title="Tempo registrado"
        description="Total diário disponível na API atual"
        action={
          <span className="control inline-flex items-center" aria-label="Período exibido">
            Últimos 7 dias
          </span>
        }
      />

      {chartData.length ? (
        <div className="mt-5 h-[190px]" aria-label="Gráfico de tempo registrado por dia">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 4, left: -24, bottom: 0 }}
            >
              <CartesianGrid stroke="#94a3b8" strokeOpacity={0.18} vertical={false} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8d91a1", fontSize: 11 }}
              />
              <YAxis hide domain={[0, Math.ceil(chartMaximum / 10) * 10]} />
              <Tooltip
                cursor={{ fill: "rgba(100, 116, 139, 0.08)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="chart-tooltip flex flex-col gap-1 text-[11px]">
                      <span className="font-bold text-white">{item.day}</span>
                      <span className="text-violet-200">
                        Registrado: {(item.registered / 10).toFixed(1)}h
                      </span>
                    </div>
                  );
                }}
              />
              <Bar dataKey="registered" fill="#6350df" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-5 grid h-[190px] place-items-center rounded-lg bg-slate-50 px-4 text-center text-xs text-muted dark:bg-slate-800/60">
          Nenhum tempo registrado foi retornado para o período disponível.
        </div>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        O gráfico obrigatório de tempo por task será habilitado quando a API disponibilizar os registros associados às tasks.
      </p>
    </Card>
  );
}
