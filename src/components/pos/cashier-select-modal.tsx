"use client";

import { User, X, Loader2, CheckCircle2 } from "lucide-react";
import { useStaff } from "@/lib/hooks";
import type { Staff } from "@/types/database";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CashierSelectModalProps {
  open: boolean;
  onSelect: (staff: Staff) => void;
  onClose: () => void;
}

export function CashierSelectModal({
  open,
  onSelect,
  onClose,
}: CashierSelectModalProps) {
  const { data: staffList, isLoading } = useStaff();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!open) return null;

  const activeStaff = (staffList || []).filter((s) => s.is_active);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print sm:p-0">
      {/* Dynamic backdrop with blur and subtle tint */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md overlay-enter transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-surface border border-white/10 rounded-3xl shadow-2xl w-full max-w-md mx-auto modal-enter overflow-hidden ring-1 ring-black/5">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary">
              Who is ringing up?
            </h2>
            <p className="text-xs text-text-muted">
              Select your profile to complete this sale.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-surface-hover/80 text-text-muted hover:text-text-primary transition-all duration-200 active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Staff Grid Area */}
        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted">
              <Loader2 className="w-6 h-6 animate-spin mb-3 text-primary" />
              <span className="text-sm font-medium">Loading profiles…</span>
            </div>
          ) : activeStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-surface-hover/50 border border-dashed border-border">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3">
                <User className="w-6 h-6 text-text-light" />
              </div>
              <p className="text-sm font-medium text-text-primary">No active profiles found</p>
              <p className="text-xs text-text-muted mt-1 max-w-[200px]">
                Add staff members in Settings to assign sales to specific people.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto p-1 -m-1 custom-scrollbar">
              {activeStaff.map((staff) => {
                const isHovered = hoveredId === staff.id;
                
                return (
                  <button
                    key={staff.id}
                    onClick={() => onSelect(staff)}
                    onMouseEnter={() => setHoveredId(staff.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      "relative group flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                      isHovered 
                        ? "border-primary bg-primary-50 shadow-md transform -translate-y-1" 
                        : "border-border bg-surface hover:border-primary-300"
                    )}
                  >
                    {/* Avatar Circle */}
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 shadow-sm transition-colors duration-300",
                      isHovered
                        ? "bg-primary text-white"
                        : "bg-surface-hover text-primary"
                    )}>
                      {staff.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name */}
                    <p className={cn(
                      "text-sm font-semibold truncate w-full px-1 transition-colors duration-300",
                      isHovered ? "text-primary-dark" : "text-text-primary"
                    )}>
                      {staff.name.split(' ')[0]} {/* Show first name mostly if long */}
                    </p>

                    {/* Hidden Selection Indicator */}
                    <div className={cn(
                      "absolute top-2 right-2 transition-opacity duration-200",
                      isHovered ? "opacity-100" : "opacity-0"
                    )}>
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
