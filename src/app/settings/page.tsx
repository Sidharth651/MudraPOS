"use client";

import { useState } from "react";
import { ShopDetailsCard } from "@/components/settings/shop-details-card";
import { StaffCard } from "@/components/settings/staff-card";
import { GSTConfigCard } from "@/components/settings/gst-config-card";
import { IntegrationsCard } from "@/components/settings/integrations-card";
import { Drawer } from "@/components/ui/drawer";
import { useUIStore } from "@/stores/ui-store";

function StaffFormDrawer() {
  const { drawerOpen, drawerContent, closeDrawer } = useUIStore();
  const isOpen = drawerOpen && drawerContent === "add-staff";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("billing");

  const handleSave = () => {
    if (!name || !email) return;
    closeDrawer();
    setName("");
    setEmail("");
    setRole("billing");
  };

  const inputClass =
    "w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";
  const labelClass = "text-sm font-medium text-text-primary block mb-1.5";

  return (
    <Drawer open={isOpen} onClose={closeDrawer} title="Add Staff Member">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>
            Name <span className="text-red">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Staff name"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Email <span className="text-red">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={inputClass}
          >
            <option value="owner">Owner</option>
            <option value="manager">Manager</option>
            <option value="billing">Billing Staff</option>
          </select>
        </div>
        <button
          onClick={handleSave}
          disabled={!name || !email}
          className="w-full mt-4 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Staff
        </button>
      </div>
    </Drawer>
  );
}

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
        <GSTConfigCard />
        <StaffCard />
        <IntegrationsCard />
      </div>

      {/* Staff Form Drawer */}
      <StaffFormDrawer />
    </div>
  );
}
