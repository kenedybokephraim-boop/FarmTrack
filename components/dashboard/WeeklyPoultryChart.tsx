"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Egg } from "lucide-react";
import type { DailyRecord, WeeklyDataPoint } from "@/types";

export function prepareWeeklyData(records: DailyRecord[]): WeeklyDataPoint[] {
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime()
  );

  const last7 = sortedRecords.slice(-7);

  const today = new Date();
  const weekDays: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    weekDays.push(d);
  }

  const dataMap = new Map<string, DailyRecord>();
  last7.forEach((record) => {
    const dateKey = new Date(record.record_date).toISOString().split("T")[0];
    dataMap.set(dateKey, record);
  });

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return weekDays.map((date) => {
    const dateKey = date.toISOString().split("T")[0];
    const record = dataMap.get(dateKey);
    return {
      date: dateKey,
      dayName: dayNames[date.getDay()],
      eggs: record?.production_amt ?? 0,
      feed: record?.feed_bags_used ?? 0,
    };
  });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const eggValue = payload.find((p) => p.dataKey === "eggs")?.value ?? 0;
  const feedValue = payload.find((p) => p.dataKey === "feed")?.value ?? 0;

  return (
    <div className="bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
        {label}
      </p>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
          <Egg className="w-3.5 h-3.5" />
          Eggs: {eggValue}
        </p>
        <p className="text-sm font-semibold text-orange-400">
          Feed: {feedValue}kg
        </p>
      </div>
    </div>
  );
}

interface WeeklyPoultryChartProps {
  records: DailyRecord[];
}

export function WeeklyPoultryChart({ records }: WeeklyPoultryChartProps) {
  const data = prepareWeeklyData(records);

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Egg className="w-4 h-4 text-emerald-500" />
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">
          Weekly Overview
        </h3>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorEggs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ffffff10"
              vertical={false}
            />
            <XAxis
              dataKey="dayName"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#6b7280",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#6b7280",
                fontSize: 10,
                fontWeight: 500,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="eggs"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorEggs)"
              isAnimationActive={true}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}