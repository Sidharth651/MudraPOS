"use client";

import { FileText, Receipt } from "lucide-react";
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

/* ── Skeleton loader ────────────────────────────────────────── */

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-14 rounded-xl bg-surface animate-pulse-soft"
        />
      ))}
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mb-4">
        <Receipt className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">
        No invoices yet
      </h3>
      <p className="text-sm text-text-muted max-w-xs">
        Your saved invoices will appear here once you create a bill from the
        Billing page.
      </p>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */

export default function InvoicesPage() {
  const { data: bills, isLoading } = useBills();

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            Saved Invoices
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            {bills
              ? `${bills.length} invoice${bills.length !== 1 ? "s" : ""} found`
              : "Loading…"}
          </p>
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <TableSkeleton />
      ) : !bills || bills.length === 0 ? (
        <EmptyState />
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
                {bills.map((bill) => {
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
            {bills.map((bill) => {
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
    </div>
  );
}
