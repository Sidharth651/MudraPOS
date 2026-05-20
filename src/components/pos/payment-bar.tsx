"use client";

import {
  Banknote,
  Smartphone,
  CreditCard,
  Split,
  BookOpen,
  Printer,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatINR, cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/database";

const paymentMethods: {
  key: PaymentMethod;
  label: string;
  icon: React.ElementType;
  color: string;
  activeColor: string;
}[] = [
  { key: "cash", label: "Cash", icon: Banknote, color: "text-green", activeColor: "bg-green text-white" },
  { key: "upi", label: "UPI", icon: Smartphone, color: "text-purple", activeColor: "bg-purple text-white" },
  { key: "card", label: "Card", icon: CreditCard, color: "text-blue", activeColor: "bg-blue text-white" },
  { key: "split", label: "Split", icon: Split, color: "text-text-muted", activeColor: "bg-text-primary text-white" },
  { key: "credit", label: "Khata", icon: BookOpen, color: "text-amber", activeColor: "bg-amber text-white" },
];

interface PaymentBarProps {
  total: number;
}

export function PaymentBar({ total }: PaymentBarProps) {
  const { payment_method, setPaymentMethod } = useCartStore();

  return (
    <div className="border-t border-border px-4 py-3 space-y-3 bg-white">
      {/* Payment Methods */}
      <div className="flex gap-1.5">
        {paymentMethods.map(({ key, label, icon: Icon, color, activeColor }) => (
          <button
            key={key}
            onClick={() => setPaymentMethod(key)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-medium transition-all duration-200",
              payment_method === key ? activeColor + " shadow-sm" : "bg-surface " + color + " hover:bg-primary-light"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Complete Payment */}
      <button className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors shadow-sm flex items-center justify-center gap-2">
        <CheckCircle2 className="w-4 h-4" />
        Complete Payment — {formatINR(total)}
      </button>

      {/* Print / WhatsApp */}
      <div className="flex gap-2">
        <button className="flex-1 py-2 border border-border rounded-xl text-xs font-medium text-text-muted hover:bg-surface transition-colors flex items-center justify-center gap-1.5">
          <Printer className="w-3.5 h-3.5" />
          Print Bill
        </button>
        <button className="flex-1 py-2 border border-green rounded-xl text-xs font-medium text-green hover:bg-green-light transition-colors flex items-center justify-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp Bill
        </button>
      </div>
    </div>
  );
}
