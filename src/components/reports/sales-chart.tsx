"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useSalesBreakdown } from "@/lib/hooks";
import { formatINR } from "@/lib/utils";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { label: string; color: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2 shadow-lg">
      <p className="text-xs text-text-muted">{data.payload.label}</p>
      <p className="text-sm font-bold text-text-primary">{formatINR(data.value)}</p>
    </div>
  );
}

export function SalesChart() {
  const { data: salesBreakdown } = useSalesBreakdown();
  const breakdownData = salesBreakdown || [];

  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-text-primary mb-4">
        Sales Breakdown by Payment Method
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={breakdownData} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(13, 110, 110, 0.05)" }} />
          <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
            {breakdownData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
