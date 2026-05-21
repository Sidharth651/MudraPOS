"use client";

import { ShopDetailsCard } from "@/components/settings/shop-details-card";
import { ReceiptSettingsCard } from "@/components/settings/receipt-settings-card";
import { AppearanceCard } from "@/components/settings/appearance-card";

export default function SettingsPage() {
  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Settings</h1>
        <p className="text-xs text-text-muted mt-0.5">Configure your shop</p>
      </div>

      {/* Cards */}
      <div className="mt-8 space-y-6">
        <AppearanceCard />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <ShopDetailsCard />
          <ReceiptSettingsCard />
        </div>
      </div>
    </div>
  );
}
