"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Receipt,
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { useBills } from "@/lib/hooks";
import { formatDate, formatINR, cn } from "@/lib/utils";
import type { PaymentMethod, BillStatus } from "@/types/database";

/* ── Badge helpers ──────────────────────────────────────────── */

const paymentBadge: Record<PaymentMethod, { label: string; cls: string }> = {
  cash: { label: "Cash", cls: "bg-green/10 text-green" },
  upi: { label: "UPI", cls: "bg-purple/10 text-purple" },
  credit: { label: "Khata", cls: "bg-amber/10 text-amber" },
};

const statusBadge: Record<BillStatus, { label: string; cls: string }> = {
  completed: { label: "Completed", cls: "bg-green-light text-green" },
  pending: { label: "Pending", cls: "bg-amber-light text-amber" },
  cancelled: { label: "Cancelled", cls: "bg-red-light text-red" },
};

/* ── Date range helpers ─────────────────────────────────────── */

type DateRange = "all" | "today" | "week" | "month" | "custom";

function getDateRangeLabel(r: DateRange) {
  switch (r) {
    case "all": return "All Time";
    case "today": return "Today";
    case "week": return "This Week";
    case "month": return "This Month";
    case "custom": return "Custom Range";
  }
}

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function getDateBounds(range: DateRange, customFrom: string, customTo: string): { from: Date | null; to: Date | null } {
  const now = new Date();
  switch (range) {
    case "today":
      return { from: startOfDay(now), to: new Date(now.getTime() + 86400000) };
    case "week": {
      const mon = new Date(now);
      mon.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      return { from: startOfDay(mon), to: new Date(now.getTime() + 86400000) };
    }
    case "month": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: first, to: new Date(now.getTime() + 86400000) };
    }
    case "custom": {
      const from = customFrom ? new Date(customFrom) : null;
      const to = customTo ? new Date(new Date(customTo).getTime() + 86400000) : null;
      return { from, to };
    }
    default:
      return { from: null, to: null };
  }
}

/* ── Skeleton loader ────────────────────────────────────────── */

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-surface animate-pulse-soft" />
      ))}
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────────── */

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mb-4">
        <Receipt className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">
        {filtered ? "No matching invoices" : "No invoices yet"}
      </h3>
      <p className="text-sm text-text-muted max-w-xs">
        {filtered
          ? "Try adjusting your filters or search query."
          : "Your saved invoices will appear here once you create a bill from the Billing page."}
      </p>
    </div>
  );
}

/* ── Filter chip ────────────────────────────────────────────── */

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap",
        active
          ? "bg-primary text-white border-primary shadow-sm"
          : "bg-white text-text-muted border-border hover:border-primary/40 hover:text-text-primary"
      )}
    >
      {label}
    </button>
  );
}

/* ── Page ───────────────────────────────────────────────────── */

export default function InvoicesPage() {
  const { data: bills, isLoading } = useBills();

  /* filter state */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BillStatus | "all">("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showDateMenu, setShowDateMenu] = useState(false);

  /* derived */
  const filtered = useMemo(() => {
    if (!bills) return [];

    const q = search.trim().toLowerCase();
    const { from, to } = getDateBounds(dateRange, customFrom, customTo);

    return bills.filter((b) => {
      if (q) {
        const haystack = `${b.bill_number} ${b.customer_name ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (paymentFilter !== "all" && b.payment_method !== paymentFilter) return false;
      if (from || to) {
        const d = new Date(b.created_at);
        if (from && d < from) return false;
        if (to && d > to) return false;
      }
      return true;
    });
  }, [bills, search, statusFilter, paymentFilter, dateRange, customFrom, customTo]);

  const hasFilters =
    search !== "" ||
    statusFilter !== "all" ||
    paymentFilter !== "all" ||
    dateRange !== "all";

  function clearAll() {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setDateRange("all");
    setCustomFrom("");
    setCustomTo("");
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Saved Invoices</h1>
          <p className="text-xs text-text-muted mt-0.5">
            {isLoading
              ? "Loading…"
              : hasFilters
              ? `${filtered.length} of ${bills?.length ?? 0} invoice${(bills?.length ?? 0) !== 1 ? "s" : ""}`
              : `${bills?.length ?? 0} invoice${(bills?.length ?? 0) !== 1 ? "s" : ""} found`}
          </p>
        </div>
      </div>

      {/* ── Filter bar ──────────────────────────────────────────── */}
      <div className="mb-5 space-y-3">
        {/* Row 1: search + date picker */}
        <div className="flex gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search bill # or customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-border rounded-xl
                         text-text-primary placeholder:text-text-muted
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                         transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date range dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDateMenu((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all",
                dateRange !== "all"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-text-muted border-border hover:border-primary/40 hover:text-text-primary"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">{getDateRangeLabel(dateRange)}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showDateMenu && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-border rounded-xl shadow-lg p-2 min-w-[180px]">
                {(["all", "today", "week", "month", "custom"] as DateRange[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setDateRange(r);
                      if (r !== "custom") setShowDateMenu(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                      dateRange === r
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-text-primary hover:bg-surface"
                    )}
                  >
                    {getDateRangeLabel(r)}
                  </button>
                ))}
                {dateRange === "custom" && (
                  <div className="mt-2 pt-2 border-t border-border space-y-1.5 px-1">
                    <div>
                      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">From</label>
                      <input
                        type="date"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        className="mt-0.5 w-full text-xs px-2 py-1.5 border border-border rounded-lg
                                   focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">To</label>
                      <input
                        type="date"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                        className="mt-0.5 w-full text-xs px-2 py-1.5 border border-border rounded-lg
                                   focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <button
                      onClick={() => setShowDateMenu(false)}
                      className="w-full mt-1 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Clear all */}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                         bg-red-light text-red border border-red/20 hover:bg-red/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>

        {/* Row 2: status chips + payment chips */}
        <div className="flex flex-wrap gap-2">
          {/* Status */}
          <div className="flex gap-1.5">
            {(["all", "completed", "pending", "cancelled"] as const).map((s) => (
              <FilterChip
                key={s}
                label={s === "all" ? "All Status" : statusBadge[s].label}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
              />
            ))}
          </div>

          <div className="w-px bg-border self-stretch mx-0.5" />

          {/* Payment */}
          <div className="flex gap-1.5">
            {(["all", "cash", "upi", "credit"] as const).map((p) => (
              <FilterChip
                key={p}
                label={p === "all" ? "All Payment" : paymentBadge[p].label}
                active={paymentFilter === p}
                onClick={() => setPaymentFilter(p)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <TableSkeleton />
      ) : !bills || bills.length === 0 ? (
        <EmptyState filtered={false} />
      ) : filtered.length === 0 ? (
        <EmptyState filtered={true} />
      ) : (
        <>
          {/* ── Desktop table ──────────────────────────────── */}
          <div className="hidden md:block bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left px-5 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">
                    Bill #
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="text-right px-5 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-center px-5 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((bill) => {
                  const pm = paymentBadge[bill.payment_method] ?? paymentBadge.cash;
                  const st = statusBadge[bill.status] ?? statusBadge.completed;

                  return (
                    <tr
                      key={bill.id}
                      className="hover:bg-surface-hover transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-text-primary whitespace-nowrap">
                        {bill.bill_number}
                      </td>
                      <td className="px-5 py-3.5 text-text-muted whitespace-nowrap">
                        {formatDate(bill.created_at)}
                      </td>
                      <td className="px-5 py-3.5 text-text-primary whitespace-nowrap">
                        {bill.customer_name || (
                          <span className="text-text-light">Walk-in</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold",
                            pm.cls
                          )}
                        >
                          {pm.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-text-primary whitespace-nowrap">
                        {formatINR(bill.total)}
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold",
                            st.cls
                          )}
                        >
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ───────────────────────────────── */}
          <div className="md:hidden space-y-3">
            {filtered.map((bill) => {
              const pm = paymentBadge[bill.payment_method] ?? paymentBadge.cash;
              const st = statusBadge[bill.status] ?? statusBadge.completed;

              return (
                <div
                  key={bill.id}
                  className="bg-white border border-border rounded-2xl p-4 shadow-sm"
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary leading-tight">
                          {bill.bill_number}
                        </p>
                        <p className="text-[11px] text-text-muted leading-tight">
                          {formatDate(bill.created_at)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold",
                        st.cls
                      )}
                    >
                      {st.label}
                    </span>
                  </div>

                  {/* Details row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-text-muted">
                        {bill.customer_name || (
                          <span className="text-text-light">Walk-in</span>
                        )}
                      </p>
                      <span className="text-border">•</span>
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold",
                          pm.cls
                        )}
                      >
                        {pm.label}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-text-primary">
                      {formatINR(bill.total)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Dismiss date menu on outside click */}
      {showDateMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowDateMenu(false)}
        />
      )}
    </div>
  );
}
