"use client";

import { Plus, ArrowLeft, Phone, MapPin } from "lucide-react";
import { useCustomers, useLedgerEntries } from "@/lib/hooks";
import { formatINR, formatDateTime, cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

export function CustomerLedger() {
  const { selectedCustomerId, setSelectedCustomerId, openDrawer } = useUIStore();
  const { data: customers } = useCustomers();
  const { data: ledgerEntries } = useLedgerEntries(selectedCustomerId || "");

  if (!selectedCustomerId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-muted py-16">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
          <span className="text-2xl">📒</span>
        </div>
        <p className="text-sm font-medium">Select a customer</p>
        <p className="text-xs mt-1">to view their khata ledger</p>
      </div>
    );
  }

  const customer = customers?.find((c) => c.id === selectedCustomerId);
  if (!customer) return null;

  const sortedEntries = ledgerEntries || [];

  return (
    <div className="flex flex-col h-full">
      {/* Back button (mobile) */}
      <button
        onClick={() => setSelectedCustomerId(null)}
        className="flex items-center gap-1.5 text-sm text-text-muted mb-3 lg:hidden hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to list
      </button>

      {/* Customer Header */}
      <div className="bg-white border border-border rounded-xl p-4 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary">{customer.name}</h2>
            <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
              <Phone className="w-3 h-3" />
              {customer.phone}
            </div>
            <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
              <MapPin className="w-3 h-3" />
              {customer.address}
            </div>
          </div>
          <button
            onClick={() => openDrawer("add-payment", { customer: customer as unknown as Record<string, unknown> })}
            className="flex items-center gap-1.5 px-3 py-2 bg-green text-white rounded-xl text-xs font-semibold hover:bg-green-dark transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Payment
          </button>
        </div>

        {/* Outstanding Balance */}
        <div className={cn(
          "mt-3 p-3 rounded-xl",
          customer.outstanding_balance > 0 ? "bg-red-light" : "bg-green-light"
        )}>
          <p className="text-xs text-text-muted">Outstanding Balance</p>
          <p className={cn(
            "text-2xl font-bold mt-0.5",
            customer.outstanding_balance > 0 ? "text-red" : "text-green"
          )}>
            {formatINR(customer.outstanding_balance)}
          </p>
        </div>
      </div>

      {/* Ledger Timeline */}
      <h3 className="text-sm font-semibold text-text-primary mb-3">
        Transaction History
      </h3>
      <div className="flex-1 overflow-y-auto">
        {sortedEntries.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">
            No transactions yet
          </p>
        ) : (
          <div className="space-y-0">
            {sortedEntries.map((entry, idx) => {
              const isPurchase = entry.type === "purchase";
              return (
                <div key={entry.id} className="flex gap-3 group">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full border-2 mt-1.5 flex-shrink-0",
                        isPurchase
                          ? "bg-amber border-amber"
                          : "bg-green border-green"
                      )}
                    />
                    {idx < sortedEntries.length - 1 && (
                      <div className="w-px flex-1 bg-border" />
                    )}
                  </div>

                  {/* Entry content */}
                  <div className="pb-4 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded",
                            isPurchase
                              ? "bg-amber-light text-amber-dark"
                              : "bg-green-light text-green-dark"
                          )}
                        >
                          {isPurchase ? "Purchase" : "Payment"}
                        </span>
                        <p className="text-sm text-text-primary mt-1">
                          {entry.description}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {formatDateTime(entry.date)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            isPurchase ? "text-red" : "text-green"
                          )}
                        >
                          {isPurchase ? "+" : "-"}{formatINR(entry.amount)}
                        </p>
                        <p className="text-xs text-text-muted">
                          Bal: {formatINR(entry.balance_after)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
