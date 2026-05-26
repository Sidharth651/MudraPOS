"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Banknote,
  Smartphone,
  BookOpen,
  Printer,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/stores/cart-store";
import { formatINR, cn } from "@/lib/utils";
import { CashierSelectModal } from "./cashier-select-modal";
import type { PaymentMethod, Bill, Staff } from "@/types/database";

const paymentMethods: {
  key: PaymentMethod;
  label: string;
  icon: React.ElementType;
  color: string;
  activeColor: string;
}[] = [
  { key: "cash", label: "Cash", icon: Banknote, color: "text-green", activeColor: "bg-green text-white" },
  { key: "upi", label: "UPI", icon: Smartphone, color: "text-purple", activeColor: "bg-purple text-white" },
  { key: "credit", label: "Khata", icon: BookOpen, color: "text-amber", activeColor: "bg-amber text-white" },
];

interface PaymentBarProps {
  total: number;
  billNumber: string;
  onBillSaved: (bill: Bill) => void;
}

export function PaymentBar({ total, billNumber, onBillSaved }: PaymentBarProps) {
  const {
    payment_method,
    amount_received,
    customer_id,
    setPaymentMethod,
    setAmountReceived,
    saveBill,
    saving,
    getBalanceDue,
  } = useCartStore();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [waiveBalance, setWaiveBalance] = useState(false);
  const [showCashierModal, setShowCashierModal] = useState(false);

  const balanceDue = getBalanceDue();
  const showAmountReceived = payment_method === "cash" || payment_method === "upi";

  const handleCompleteClick = () => {
    if (!billNumber) return;
    setError(null);

    // If there's a balance due but no customer selected, warn (unless waiving)
    if (balanceDue > 0 && !customer_id && !waiveBalance) {
      setError("Please select a customer to put balance on khata.");
      return;
    }

    // Show cashier selection modal
    setShowCashierModal(true);
  };

  const handleCashierSelected = async (staff: Staff) => {
    setShowCashierModal(false);

    try {
      const savedBill = await saveBill(billNumber, waiveBalance, staff.id, staff.name);
      if (savedBill) {
        // Invalidate caches so dashboard/reports update
        queryClient.invalidateQueries({ queryKey: ["bills"] });
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        queryClient.invalidateQueries({ queryKey: ["ledger"] });
        queryClient.invalidateQueries({ queryKey: ["pending-bills"] });
        queryClient.invalidateQueries({ queryKey: ["nextBillNumber"] });

        toast.success(`Invoice ${savedBill.bill_number} created`, {
          duration: 4000,
          icon: "🧾",
        });

        onBillSaved(savedBill);
      }
    } catch (err) {
      console.error("Payment failed:", err);
      setError("Failed to save bill. Please try again.");
    }
  };

  const handlePrintBill = () => {
    window.print();
  };

  return (
    <div className="border-t border-border px-4 py-3 space-y-3 bg-surface">
      {/* Error Message */}
      {error && (
        <div className="text-xs text-red bg-red-light px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Payment Methods */}
      <div className="flex gap-1.5">
        {paymentMethods.map(({ key, label, icon: Icon, color, activeColor }) => (
          <button
            key={key}
            onClick={() => setPaymentMethod(key)}
            disabled={saving}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-medium transition-all duration-200",
              payment_method === key ? activeColor + " shadow-sm" : "bg-surface " + color + " hover:bg-primary-light",
              saving && "opacity-50 cursor-not-allowed"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Amount Received — shown for cash/upi */}
      {showAmountReceived && (
        <div className="bg-surface rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-text-muted">Amount Received</label>
            <span className="text-[10px] text-text-light">
              Bill total: {formatINR(total)}
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-medium">₹</span>
            <input
              type="number"
              value={amount_received ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setAmountReceived(val === "" ? null : parseFloat(val) || 0);
              }}
              placeholder={total.toFixed(0)}
              className="w-full border border-border rounded-lg px-3 py-2 pl-7 text-sm font-semibold text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          {balanceDue > 0 && (
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber font-medium flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Balance to Khata
                </span>
                <span className="text-xs font-bold text-amber">
                  {formatINR(balanceDue)}
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-surface-hover p-2 rounded-lg border border-border">
                <input
                  type="checkbox"
                  checked={waiveBalance}
                  onChange={(e) => setWaiveBalance(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-xs font-medium text-text-primary">
                  Waive {formatINR(balanceDue)} (Settle Bill)
                </span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Khata info */}
      {payment_method === "credit" && (
        <div className="bg-amber-light rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs font-medium text-amber-dark flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            Full amount on Khata
          </span>
          <span className="text-sm font-bold text-amber-dark">{formatINR(total)}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handlePrintBill}
          className="flex-1 py-3 border border-border rounded-xl text-xs font-medium text-text-muted hover:bg-surface-hover transition-colors flex items-center justify-center gap-1.5"
        >
          <Printer className="w-4 h-4" />
          Print Bill
        </button>

        <button
          onClick={handleCompleteClick}
          disabled={saving}
          className="flex-[2] py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Complete — {formatINR(total)}
            </>
          )}
        </button>
      </div>

      {/* Cashier Selection Modal */}
      <CashierSelectModal
        open={showCashierModal}
        onSelect={handleCashierSelected}
        onClose={() => setShowCashierModal(false)}
      />
    </div>
  );
}
