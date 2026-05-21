"use client";

import { useState, useCallback } from "react";
import { Receipt } from "lucide-react";
import { ProductSelector } from "@/components/pos/product-selector";
import { CartPanel } from "@/components/pos/cart-panel";
import { CustomerFormDrawer } from "@/components/customers/customer-form-drawer";
import { BillReceipt } from "@/components/pos/bill-receipt";
import { useNextBillNumber } from "@/lib/hooks";
import { useSettings } from "@/lib/hooks";
import type { Bill } from "@/types/database";

export default function POSPage() {
  const { data: billNumber, isLoading: billLoading } = useNextBillNumber();
  const { data: settings } = useSettings();
  const [lastSavedBill, setLastSavedBill] = useState<Bill | null>(null);

  const handleBillSaved = useCallback((bill: Bill) => {
    setLastSavedBill(bill);
    // Auto-open print dialog after a short delay to let state update
    setTimeout(() => {
      window.print();
    }, 300);
  }, []);

  const displayBillNumber = billLoading ? "..." : billNumber || "INV-0001";

  return (
    <>
      <div className="flex flex-col lg:flex-row h-full no-print">
        {/* Left — Product Selector */}
        <div className="flex-1 lg:w-[60%] p-4 lg:p-6 overflow-y-auto min-h-[45vh] lg:min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                New Bill
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Select products to add</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted">Bill #</p>
              <p className="text-sm font-semibold text-primary">{displayBillNumber}</p>
            </div>
          </div>

          <ProductSelector />
        </div>

        {/* Right — Cart */}
        <div className="lg:w-[40%] lg:min-w-[360px] border-t lg:border-t-0 flex flex-col min-h-0 lg:h-auto max-h-[55vh] lg:max-h-none">
          <CartPanel
            billNumber={displayBillNumber}
            onBillSaved={handleBillSaved}
          />
        </div>
      </div>

      {/* Drawer for adding customer from POS */}
      <CustomerFormDrawer />

      {/* Thermal receipt — hidden on screen, shown on print */}
      {lastSavedBill && (
        <BillReceipt
          bill={lastSavedBill}
          shopName={settings?.shop_name}
        />
      )}
    </>
  );
}
