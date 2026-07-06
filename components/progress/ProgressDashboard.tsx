"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import {
  chartColors,
  tooltipContentStyle,
} from "@/components/charts/chartTheme";

export type ExerciseSeries = {
  exerciseId: string;
  name: string;
  points: { date: string; top: number; volume: number }[];
};

export type PersonalRecord = {
  exerciseId: string;
  name: string;
  weight: number;
  reps: number;
  date: string;
};

export type WeeklyVolume = { week: string; volume: number };

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "numeric",
  });
}

export function ProgressDashboard({
  exerciseSeries,
  personalRecords,
  weeklyVolume,
  totalWorkouts,
}: {
  exerciseSeries: ExerciseSeries[];
  personalRecords: PersonalRecord[];
  weeklyVolume: WeeklyVolume[];
  totalWorkouts: number;
}) {
  const [selectedId, setSelectedId] = useState(
    exerciseSeries[0]?.exerciseId ?? ""
  );
  const selected = exerciseSeries.find((s) => s.exerciseId === selectedId);
  const selectedData =
    selected?.points.map((p) => ({
      label: shortDate(p.date),
      top: p.top,
      volume: p.volume,
    })) ?? [];

  if (totalWorkouts === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">התקדמות 📈</h1>
        <Card className="text-center text-zinc-500">
          עדיין אין נתונים — סיים אימון ראשון וההתקדמות תופיע כאן.
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">התקדמות 📈</h1>

      {/* per-exercise progression */}
      <Card className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold">משקל שיא לאימון — לפי תרגיל</h2>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
          >
            {exerciseSeries.map((s) => (
              <option key={s.exerciseId} value={s.exerciseId}>
                {s.name} ({s.points.length} אימונים)
              </option>
            ))}
          </select>
        </div>

        {selectedData.length >= 2 ? (
          <div dir="ltr" className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={selectedData}
                margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
              >
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke={chartColors.axis}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  stroke={chartColors.axis}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  domain={[0, "dataMax + 5"]}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(value, key) => [
                    key === "top" ? `${value} ק"ג` : `${value} ק"ג`,
                    key === "top" ? "משקל שיא" : "נפח",
                  ]}
                  labelFormatter={(label) => `אימון: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="top"
                  stroke={chartColors.series}
                  strokeWidth={2}
                  dot={{ r: 4, fill: chartColors.series, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-zinc-500">
            צריך לפחות שני אימונים עם התרגיל הזה כדי להציג גרף.
          </p>
        )}
      </Card>

      {/* weekly volume */}
      <Card className="flex flex-col gap-3">
        <h2 className="font-semibold">נפח שבועי כולל (ק&quot;ג)</h2>
        {weeklyVolume.length >= 2 ? (
          <div dir="ltr" className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyVolume.map((w) => ({
                  label: shortDate(w.week),
                  volume: w.volume,
                }))}
                margin={{ top: 8, right: 8, bottom: 0, left: -8 }}
              >
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke={chartColors.axis}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  stroke={chartColors.axis}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                  }
                />
                <Tooltip
                  cursor={{ fill: "#27272a", opacity: 0.4 }}
                  contentStyle={tooltipContentStyle}
                  formatter={(value) => [
                    `${Number(value).toLocaleString("he-IL")} ק"ג`,
                    "נפח",
                  ]}
                  labelFormatter={(label) => `שבוע של ${label}`}
                />
                <Bar
                  dataKey="volume"
                  fill={chartColors.series}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-zinc-500">
            הנפח השבועי יוצג אחרי שבועיים של אימונים.
          </p>
        )}
      </Card>

      {/* personal records */}
      <Card className="flex flex-col gap-2">
        <h2 className="font-semibold">שיאים אישיים 🏆</h2>
        {personalRecords.length === 0 ? (
          <p className="text-sm text-zinc-500">
            עדיין אין שיאים — תעד סטים עם משקל וזה יופיע כאן.
          </p>
        ) : (
          <ul className="flex flex-col">
            {personalRecords.map((pr) => (
              <li
                key={pr.exerciseId}
                className="flex items-center justify-between border-t border-zinc-800 py-2 text-sm first:border-t-0"
              >
                <span className="min-w-0 truncate">{pr.name}</span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="font-semibold text-emerald-400" dir="ltr">
                    {pr.weight} ק&quot;ג × {pr.reps}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(pr.date).toLocaleDateString("he-IL")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
