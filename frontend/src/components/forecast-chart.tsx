"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ForecastPoint = {
  month: string;
  production: number;
  forecast: number;
};

export function ForecastChart({ data }: { data: ForecastPoint[] }) {
  const mounted = typeof window !== "undefined";

  return (
    <div className="h-[320px] min-h-[320px] w-full rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-lg font-semibold">Production vs Forecast</h3>
      {mounted ? (
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#6662" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="production" stroke="#2563eb" strokeWidth={2} />
            <Line type="monotone" dataKey="forecast" stroke="#16a34a" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
