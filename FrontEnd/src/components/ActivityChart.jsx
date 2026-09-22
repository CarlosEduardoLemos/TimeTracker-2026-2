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

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });

function buildRegisteredTimeChartData(weeklySummaries) {
  return weeklySummaries.map((summary) => ({
    day: WEEKDAY_FORMATTER
      .format(new Date(`${summary.date}T12:00:00`))
      .replace(".", ""),
    registeredHours:
      summary.unavailable === true
        ? null
        : Math.round((getSummaryTotalSeconds(summary) / 3600) * 10) / 10,
    unavailable: summary.unavailable === true,
  }));
}

function getChartMaximum(chartData) {
  const values = chartData
    .map(({ registeredHours }) => registeredHours)
    .filter(Number.isFinite);

  return Math.max(1, ...values);
}

/**
 * Exibe o tempo total registrado por dia usando apenas dados confirmados pela
 * API. Dias indisponíveis são identificados como tal, em vez de virarem zero.
 */
export function ActivityChart({ weeklySummaries = [] }) {
  const chartData = buildRegisteredTimeChartData(weeklySummaries);
  const chartMaximum = getChartMaximum(chartData);

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
        <>
          <div className="mt-5 h-[190px]" aria-hidden="true">
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
                <YAxis hide domain={[0, Math.ceil(chartMaximum)]} />
                <Tooltip
                  cursor={{ fill: "rgba(100, 116, 139, 0.08)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const chartItem = payload[0].payload;
                    if (chartItem.unavailable) return null;

                    return (
                      <div className="chart-tooltip flex flex-col gap-1 text-[11px]">
                        <span className="font-bold text-white">{chartItem.day}</span>
                        <span className="text-violet-200">
                          Registrado: {chartItem.registeredHours.toFixed(1)}h
                        </span>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="registeredHours" fill="#6350df" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <table className="sr-only">
            <caption>Tempo registrado nos últimos 7 dias</caption>
            <thead>
              <tr>
                <th scope="col">Dia</th>
                <th scope="col">Tempo registrado</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map(({ day, registeredHours, unavailable }) => (
                <tr key={day}>
                  <th scope="row">{day}</th>
                  <td>
                    {unavailable
                      ? "Indisponível"
                      : `${registeredHours.toFixed(1)} horas`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
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
