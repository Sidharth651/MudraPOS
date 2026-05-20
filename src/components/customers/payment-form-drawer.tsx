"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { useUIStore } from "@/stores/ui-store";
import { formatINR } from "@/lib/utils";
import type { Customer } from "@/types/database";

export function PaymentFormDrawer() {
  const { drawerOpen, drawerContent, drawerData, closeDrawer } = useUIStore();
  const isOpen = drawerOpen && drawerContent === "add-payment";
  const customer = drawerData?.customer as unknown as Customer | undefined;

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    closeDrawer();
    setAmount("");
    setMethod("cash");
    setNotes("");
  };

  const inputClass =
    "w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";
  const labelClass = "text-sm font-medium text-text-primary block mb-1.5";

  return (
    <Drawer open={isOpen} onClose={closeDrawer} title="Record Payment">
      <div className="space-y-4">
        {customer && (
          <div className="p-3 bg-surface rounded-xl">
            <p className="text-sm font-medium text-text-primary">{customer.name}</p>
            <p className="text-xs text-text-muted mt-0.5">
              Balance due: <span className="text-red font-semibold">{formatINR(customer.outstanding_balance)}</span>
            </p>
          </div>
        )}

        <div>
          <label className={labelClass}>
            Amount <span className="text-red">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className={inputClass + " pl-7"}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Payment Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className={inputClass}
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment notes..."
            rows={2}
            className={inputClass + " resize-none"}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full mt-4 py-3 bg-green text-white rounded-xl font-semibold text-sm hover:bg-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Record Payment
        </button>
      </div>
    </Drawer>
  );
}
