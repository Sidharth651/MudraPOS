"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { useUIStore } from "@/stores/ui-store";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function CustomerFormDrawer() {
  const { drawerOpen, drawerContent, closeDrawer } = useUIStore();
  const isOpen = drawerOpen && drawerContent === "add-customer";
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: dbError } = await supabase.from("customers").insert({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      outstanding_balance: 0,
    });

    setSaving(false);

    if (dbError) {
      setError("Failed to save customer. Please try again.");
      return;
    }

    // Refresh the customers list everywhere
    queryClient.invalidateQueries({ queryKey: ["customers"] });

    closeDrawer();
    setName("");
    setPhone("");
    setAddress("");
    setError(null);
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

        {error && (
          <div className="text-xs text-red bg-red-light px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!name.trim() || !phone.trim() || saving}
          className="w-full mt-4 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            "Save Customer"
          )}
        </button>
      </div>
    </Drawer>
  );
}
