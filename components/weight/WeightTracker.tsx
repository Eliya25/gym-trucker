"use client";

import { useActionState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BodyWeightLog } from "@/lib/types/domain";
import { addWeightLog, deleteWeightLog, type WeightFormState } from "@/lib/actions/weight";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { chartColors, tooltipContentStyle } from "@/components/charts/chartTheme";

const initialState: WeightFormState = { error: null };

function todayISO() {
  return new Date().toLocaleDateString("sv-SE"); // yyyy-mm-dd in local time
}

export function WeightTracker({ logs }: { logs: BodyWeightLog[] }) {
  const [state, formAction, pending] = useActionState(
    addWeightLog,
    initialState
  );

  // oldest → newest for the chart
  const chartData = [...logs]
    .sort((a, b) => a.logged_on.localeCompare(b.logged_on))
    .map((log) => ({
      date: log.logged_on,
      label: new Date(log.logged_on).toLocaleDateString("he-IL", {
        day: "numeric",
        month: "numeric",
      }),
      weight: Number(log.weight_kg),
    }));

  const latest = chartData[chartData.length - 1];
  const first = chartData[0];
  const change =
    latest && first ? +(latest.weight - first.weight).toFixed(1) : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">משקל גוף ⚖️</h1>

      <Card className="flex flex-col gap-3">
        <h2 className="font-semibold">רישום משקל</h2>
        <form
          action={formAction}
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
        >
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="weightKg" className="text-xs text-zinc-500">
              משקל (ק&quot;ג)
            </label>
            <Input
              id="weightKg"
              name="weightKg"
              type="number"
              inputMode="decimal"
              min={20}
              max={400}
              step={0.1}
              dir="ltr"
              required
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="loggedOn" className="text-xs text-zinc-500">
              תאריך
            </label>
            <Input
              id="loggedOn"
              name="loggedOn"
              type="date"
              dir="ltr"
              defaultValue={todayISO()}
              required
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "שומר..." : "+ שמור"}
          </Button>
        </form>
        {state.error && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}
        <p className="text-xs text-zinc-500">
          רישום נוסף באותו תאריך מעדכן את הערך הקיים.
        </p>
      </Card>

      {chartData.length >= 2 && latest && change !== null && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center">
            <div className="text-2xl font-bold" dir="ltr">
              {latest.weight}
            </div>
            <div className="text-xs text-zinc-500">משקל נוכחי (ק&quot;ג)</div>
          </Card>
          <Card className="text-center">
            <div
              className="text-2xl font-bold"
              dir="ltr"
            >
              {change > 0 ? `+${change}` : change}
            </div>
            <div className="text-xs text-zinc-500">
              שינוי מאז {new Date(first.date).toLocaleDateString("he-IL")}
            </div>
          </Card>
        </div>
      )}

      {chartData.length >= 2 ? (
        <Card>
          <h2 className="mb-3 font-semibold">מגמת משקל גוף (ק&quot;ג)</h2>
          <div dir="ltr" className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
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
                  domain={["dataMin - 1", "dataMax + 1"]}
                  tickFormatter={(v: number) => v.toFixed(0)}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(value) => [`${value} ק"ג`, "משקל"]}
                  labelFormatter={(label) => `תאריך: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke={chartColors.series}
                  strokeWidth={2}
                  dot={{ r: 4, fill: chartColors.series, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <Card className="text-center text-zinc-500">
          רשום משקל לפחות פעמיים כדי לראות גרף מגמה.
        </Card>
      )}

      {logs.length > 0 && (
        <Card className="flex flex-col gap-1">
          <h2 className="mb-2 font-semibold">היסטוריית רישומים</h2>
          <ul className="flex flex-col">
            {logs.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between border-t border-zinc-800 py-2 text-sm first:border-t-0"
              >
                <span>
                  {new Date(log.logged_on).toLocaleDateString("he-IL", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-medium tabular-nums" dir="ltr">
                    {Number(log.weight_kg)} ק&quot;ג
                  </span>
                  <ConfirmButton
                    confirmText="למחוק את רישום המשקל הזה?"
                    action={deleteWeightLog.bind(null, log.id)}
                    className="!px-2 !py-1 text-xs"
                  >
                    ✕
                  </ConfirmButton>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
