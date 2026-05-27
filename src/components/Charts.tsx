"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const compact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export function MarginTrendChart({
  data,
}: {
  data: { month: string; margin: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={290}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="marginFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="month"
          tick={<AngledTick />}
          height={56}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          tickFormatter={(v) => compact(v as number)}
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          formatter={(v) => [compact(v as number), "Margin"]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            fontSize: 13,
          }}
        />
        <Area
          type="monotone"
          dataKey="margin"
          stroke="#4f46e5"
          strokeWidth={2}
          fill="url(#marginFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * Angled X-axis tick — keeps every category label readable on narrow
 * (mobile) widths where horizontal labels would overlap and jumble.
 */
function AngledTick({
  x,
  y,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value: string | number };
}) {
  return (
    <g transform={`translate(${x ?? 0},${y ?? 0})`}>
      <text
        x={0}
        y={0}
        dy={10}
        textAnchor="end"
        transform="rotate(-35)"
        fontSize={11}
        fill="#64748b"
      >
        {payload?.value}
      </text>
    </g>
  );
}

const STATUS_COLORS: Record<string, string> = {
  Lead: "#94a3b8",
  Negotiating: "#f59e0b",
  Confirmed: "#3b82f6",
  Shipped: "#6366f1",
  Delivered: "#10b981",
  Closed: "#059669",
  Cancelled: "#f43f5e",
};

export function PipelineChart({
  data,
}: {
  data: { status: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={290}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="status"
          tick={<AngledTick />}
          height={56}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          tickFormatter={(v) => compact(v as number)}
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          formatter={(v) => [compact(v as number), "Deal value"]}
          cursor={{ fill: "#f1f5f9" }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            fontSize: 13,
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.status} fill={STATUS_COLORS[d.status] ?? "#6366f1"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
