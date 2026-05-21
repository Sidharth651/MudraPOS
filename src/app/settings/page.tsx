"use client";

import { ShopDetailsCard } from "@/components/settings/shop-details-card";
import { ReceiptSettingsCard } from "@/components/settings/receipt-settings-card";

export default function SettingsPage() {
  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Settings</h1>
        <p className="text-xs text-text-muted mt-0.5">Configure your shop</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ShopDetailsCard />
        <ReceiptSettingsCard />
      </div>
    </div>
  );
}
