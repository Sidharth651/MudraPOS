"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { useUIStore } from "@/stores/ui-store";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { StaffRole } from "@/types/database";

export function StaffFormDrawer() {
  const { drawerOpen, drawerContent, drawerData, closeDrawer } = useUIStore();
  const isEdit = drawerContent === "edit-staff";
  const isOpen = drawerOpen && (drawerContent === "add-staff" || isEdit);
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && isEdit && drawerData) {
      setName((drawerData.name as string) || "");
      setIsActive(drawerData.is_active !== false);
    } else if (!isOpen) {
      setName("");
      setIsActive(true);
      setError(null);
    }
  }, [isOpen, isEdit, drawerData]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    const toastId = toast.loading(isEdit ? "Updating staff..." : "Saving staff...");

    const supabase = createClient();
    let dbError;

    const payload = {
      name: name.trim(),
      role: "billing", // Default role since UI doesn't ask for it
      is_active: isActive,
    };

    if (isEdit && drawerData?.id) {
      const { error } = await supabase
        .from("staff")
        .update(payload)
        .eq("id", drawerData.id);
      dbError = error;
    } else {
      const { error } = await supabase
        .from("staff")
        .insert([payload]);
      dbError = error;
    }

    setSaving(false);

    if (dbError) {
      toast.error("Failed to save staff. Please try again.", { id: toastId });
      setError("Failed to save staff. Please try again.");
      return;
    }

    toast.success(isEdit ? "Staff updated successfully." : "Staff added successfully.", { id: toastId });

    // Refresh the staff list
    queryClient.invalidateQueries({ queryKey: ["staff"] });

    closeDrawer();
  };

  const inputClass =
    "w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-surface";
  const labelClass = "text-sm font-medium text-text-primary block mb-1.5";

  return (
    <Drawer open={isOpen} onClose={closeDrawer} title={isEdit ? "Edit Staff" : "Add Staff"}>
      <div className="space-y-4">
        <div>
          <label className={labelClass}>
            Name <span className="text-red">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ramesh Kumar"
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary w-4 h-4"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-text-primary cursor-pointer">
            Active (can log in and ring up sales)
          </label>
        </div>

        {error && (
          <div className="text-xs text-red bg-red-light px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="w-full mt-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            isEdit ? "Update Staff" : "Add Staff"
          )}
        </button>
      </div>
    </Drawer>
  );
}
