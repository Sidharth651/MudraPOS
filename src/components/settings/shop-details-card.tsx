"use client";

import { useState, useEffect } from "react";
import { Store, Pencil } from "lucide-react";
import { useSettings } from "@/lib/hooks";

export function ShopDetailsCard() {
  const { data: dbSettings } = useSettings();
  const [editing, setEditing] = useState(false);
  const [settings, setSettings] = useState({ shop_name: "" });

  useEffect(() => {
    if (dbSettings) setSettings({ shop_name: dbSettings.shop_name });
  }, [dbSettings]);

  const inputClass =
    "w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  return (
    <div className="bg-white border border-border rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <Store className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">Shop Details</h3>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-text-muted block mb-1">Shop Name</label>
          {editing ? (
            <input
              type="text"
              value={settings.shop_name}
              onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })}
              className={inputClass}
            />
          ) : (
            <p className="text-sm font-medium text-text-primary">{settings.shop_name}</p>
          )}
        </div>
      </div>
    </div>
  );
}
