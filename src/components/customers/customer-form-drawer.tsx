"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { useUIStore } from "@/stores/ui-store";

export function CustomerFormDrawer() {
  const { drawerOpen, drawerContent, closeDrawer } = useUIStore();
  const isOpen = drawerOpen && drawerContent === "add-customer";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleSave = () => {
    if (!name || !phone) return;
    closeDrawer();
    setName("");
    setPhone("");
    setAddress("");
  };

  const inputClass =
    "w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";
  const labelClass = "text-sm font-medium text-text-primary block mb-1.5";

  return (
    <Drawer open={isOpen} onClose={closeDrawer} title="New Customer">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>
            Name <span className="text-red">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Customer name"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            Phone <span className="text-red">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 XXXXX XXXXX"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Full address"
            rows={3}
            className={inputClass + " resize-none"}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!name || !phone}
          className="w-full mt-4 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Customer
        </button>
      </div>
    </Drawer>
  );
}
