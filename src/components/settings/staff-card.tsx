"use client";

import { useState } from "react";
import { Users, Plus, Edit, Trash2 } from "lucide-react";
import { useStaff } from "@/lib/hooks";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { confirmToast } from "@/lib/toast-utils";
import toast from "react-hot-toast";

export function StaffCard() {
  const { openDrawer } = useUIStore();
  const { data: staffData } = useStaff();
  const queryClient = useQueryClient();
  const staff = staffData || [];
  
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = (id: string, name: string) => {
    confirmToast(`Are you sure you want to delete ${name}?`, async () => {
      setIsDeleting(id);
      const toastId = toast.loading(`Deleting ${name}...`);

      try {
        const supabase = createClient();
        const { error } = await supabase.from("staff").delete().eq("id", id);
        
        if (error) {
          // Check if it's a foreign key constraint violation (e.g. bills linked)
          if (error.code === '23503') {
            throw new Error(`Cannot delete ${name} because they have already rung up sales. Please edit their account and set them to Inactive instead.`);
          }
          throw error;
        }

        await queryClient.invalidateQueries({ queryKey: ["staff"] });
        toast.success(`${name} deleted successfully.`, { id: toastId });
      } catch (error: any) {
        console.error("Failed to delete staff:", error);
        toast.error(error.message || "Failed to delete staff. Please try again.", { id: toastId, duration: 5000 });
      } finally {
        setIsDeleting(null);
      }
    });
  };

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">Staff Accounts</h3>
        </div>
        <button
          onClick={() => openDrawer("add-staff")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Staff
        </button>
      </div>

      {/* Staff List */}
      <div className="divide-y divide-border">
        {staff.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-text-muted">No staff added yet.</p>
          </div>
        ) : (
          staff.map((staffMember) => (
            <div key={staffMember.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-surface-hover/50 transition-colors group">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                  {staffMember.name.charAt(0)}
                </div>

                {/* Info */}
                <div>
                  <p className="text-sm font-medium text-text-primary truncate">
                    {staffMember.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        staffMember.is_active ? "bg-green" : "bg-text-light"
                      )}
                    />
                    <span className="text-[10px] text-text-muted">
                      {staffMember.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 transition-opacity">
                <button
                  onClick={() => openDrawer("edit-staff", staffMember as unknown as Record<string, unknown>)}
                  className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-primary-light transition-colors"
                  title="Edit Staff"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(staffMember.id, staffMember.name)}
                  disabled={isDeleting === staffMember.id}
                  className="p-1.5 rounded-md text-text-muted hover:text-red hover:bg-red-light transition-colors disabled:opacity-50"
                  title="Delete Staff"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
