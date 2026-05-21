"use client";

import { useState } from "react";
import {
  Banknote,
  Smartphone,
  BookOpen,
  Printer,
  Share2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/stores/cart-store";
import { formatINR, cn } from "@/lib/utils";
import type { PaymentMethod, Bill } from "@/types/database";

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

  const balanceDue = getBalanceDue();
  const showAmountReceived = payment_method === "cash" || payment_method === "upi";

  const handleCompletePayment = async () => {
    if (!billNumber) return;
    setError(null);

    // If there's a balance due but no customer selected, warn
    if (balanceDue > 0 && !customer_id) {
      setError("Please select a customer to put balance on khata.");
      return;
    }

    try {
      const savedBill = await saveBill(billNumber);
      if (savedBill) {
        // Invalidate caches so dashboard/reports update
        queryClient.invalidateQueries({ queryKey: ["bills"] });
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        queryClient.invalidateQueries({ queryKey: ["ledger"] });
        queryClient.invalidateQueries({ queryKey: ["nextBillNumber"] });
        queryClient.invalidateQueries({ queryKey: ["dailySummary"] });
        queryClient.invalidateQueries({ queryKey: ["topProducts"] });

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

  const handleSharePDF = async () => {
    if (!billNumber) return;
    const element = document.getElementById("receipt-print-area");
    if (!element) {
      setError("Please save the bill first to share as PDF.");
      return;
    }
    setError(null);
    try {
      // @ts-ignore
      const html2pdf = (await import("html2pdf.js")).default;
      element.classList.remove("receipt-print-only");
      element.style.display = "block";

      const opt = {
        margin: 1,
        filename: `bill-${billNumber}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: [58, 200], orientation: "portrait" },
      };

      const pdfBlob = await html2pdf().set(opt).from(element).output("blob");

      if (navigator.share) {
        const file = new File([pdfBlob], opt.filename, {
          type: "application/pdf",
        });
        await navigator.share({
          title: "Bill Receipt",
          text: "Here is your bill receipt",
          files: [file],
        });
      } else {
        html2pdf().set(opt).from(element).save();
      }
    } catch (err) {
      console.error("Error sharing PDF:", err);
      setError("Failed to share PDF.");
    } finally {
      element.style.display = "";
      element.classList.add("receipt-print-only");
    }
  };

  return (
    <div className="border-t border-border px-4 py-3 space-y-3 bg-white">
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
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-amber font-medium flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Balance to Khata
              </span>
              <span className="text-xs font-bold text-amber">
                {formatINR(balanceDue)}
              </span>
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

      {/* Complete Payment */}
      <button
        onClick={handleCompletePayment}
        disabled={saving}
        className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving Bill...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Complete Payment — {formatINR(total)}
          </>
        )}
      </button>

      {/* Print / WhatsApp */}
      <div className="flex gap-2">
        <button
          onClick={handlePrintBill}
          className="flex-1 py-2 border border-border rounded-xl text-xs font-medium text-text-muted hover:bg-surface transition-colors flex items-center justify-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Bill
        </button>
        <button 
          onClick={handleSharePDF}
          className="flex-1 py-2 border border-primary rounded-xl text-xs font-medium text-primary hover:bg-primary-light transition-colors flex items-center justify-center gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share as PDF
        </button>
      </div>
    </div>
  );
}
