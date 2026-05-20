"use client";

import {
  IndianRupee,
  Banknote,
  Smartphone,
  BookOpen,
  ShoppingBag,
} from "lucide-react";
import { useDailySummary } from "@/lib/hooks";
import { formatINR } from "@/lib/utils";

export function SummaryCards() {
  const { data: dailySummary } = useDailySummary();
  const summary = dailySummary || {
    total_sales: 0,
    cash_collected: 0,
    upi_collected: 0,
    khata_credit: 0,
    items_sold: 0,
  };

  const cards = [
    {
      label: "Total Sales",
      value: summary.total_sales,
      icon: IndianRupee,
      color: "text-primary",
      bgColor: "bg-primary-50",
      gradientFrom: "from-primary-50/50",
      isCurrency: true,
    },
    {
      label: "Cash Collected",
      value: summary.cash_collected,
      icon: Banknote,
      color: "text-green",
      bgColor: "bg-green-light",
      gradientFrom: "from-green-light/50",
      isCurrency: true,
    },
    {
      label: "UPI Collected",
      value: summary.upi_collected,
      icon: Smartphone,
      color: "text-purple",
      bgColor: "bg-purple/10",
      gradientFrom: "from-purple/5",
      isCurrency: true,
    },
    {
      label: "Khata Credit",
      value: summary.khata_credit,
      icon: BookOpen,
      color: "text-amber",
      bgColor: "bg-amber-light",
      gradientFrom: "from-amber-light/50",
      isCurrency: true,
    },
    {
      label: "Items Sold",
      value: summary.items_sold,
      icon: ShoppingBag,
      color: "text-blue",
      bgColor: "bg-blue/10",
      gradientFrom: "from-blue/5",
      isCurrency: false,
    },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`flex-shrink-0 w-[180px] bg-gradient-to-br ${card.gradientFrom} to-white border border-border rounded-xl p-4 shadow-sm`}
          >
            <div className={`w-9 h-9 rounded-xl ${card.bgColor} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-xs text-text-muted">
              {card.label}
            </p>
            <p className={`text-xl font-bold ${card.color} mt-0.5`}>
              {card.isCurrency ? formatINR(card.value) : card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
