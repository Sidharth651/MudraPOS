"use client";

import { useState } from "react";
import { Download, Calendar } from "lucide-react";
import { SummaryCards } from "@/components/reports/summary-cards";
import { SalesChart } from "@/components/reports/sales-chart";
import { TopProductsTable } from "@/components/reports/top-products-table";

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState("2025-05-20");
  const [dateTo, setDateTo] = useState("2025-05-20");

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Daily Reports</h1>
          <p className="text-xs text-text-muted mt-0.5">Sales & performance overview</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range */}
          <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-text-muted" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-sm text-text-primary border-none outline-none bg-transparent"
            />
            <span className="text-text-muted text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="text-sm text-text-primary border-none outline-none bg-transparent"
            />
          </div>
          {/* Export */}
          <button className="flex items-center gap-1.5 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-text-muted hover:bg-surface hover:text-text-primary transition-colors">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6">
        <SummaryCards />
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <TopProductsTable />
      </div>
    </div>
  );
}
