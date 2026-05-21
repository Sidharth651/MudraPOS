"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Drawer } from "@/components/ui/drawer";
import { useUIStore } from "@/stores/ui-store";
import { formatINR } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Customer } from "@/types/database";
import toast from "react-hot-toast";

export function PaymentFormDrawer() {
  const { drawerOpen, drawerContent, drawerData, closeDrawer } = useUIStore();
  const queryClient = useQueryClient();
  const isOpen = drawerOpen && drawerContent === "add-payment";
  const customer = drawerData?.customer as unknown as Customer | undefined;

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0 || !customer) return;

    setSaving(true);
    const toastId = toast.loading("Recording payment...");
    try {
      const supabase = createClient();
      const paymentAmount = parseFloat(amount);

      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          customer_id: customer.id,
          amount: paymentAmount,
          payment_method: method,
          notes,
        });

      if (paymentError) throw paymentError;

      const newBalance = customer.outstanding_balance - paymentAmount;
      const { error: updateError } = await supabase
        .from("customers")
        .update({ outstanding_balance: newBalance })
        .eq("id", customer.id);

      if (updateError) throw updateError;

      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      await queryClient.invalidateQueries({ queryKey: ["ledger"] });

      closeDrawer();
      setAmount("");
      setMethod("cash");
      setNotes("");
      toast.success("Payment recorded successfully.", { id: toastId });
    } catch (error) {
      console.error("Failed to record payment:", error);
      toast.error("Failed to record payment. Please try again.", { id: toastId });
    } finally {
      setSaving(false);
    }
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
          disabled={!amount || parseFloat(amount) <= 0 || saving}
          className="w-full mt-4 py-3 bg-green text-white rounded-xl font-semibold text-sm hover:bg-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Record Payment"}
        </button>
      </div>
    </Drawer>
  );
}
