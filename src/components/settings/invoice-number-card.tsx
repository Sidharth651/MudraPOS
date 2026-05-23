"use client";

import { Hash, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { useSettings, useUpdateInvoiceStartNumber } from "@/lib/hooks";
import toast from "react-hot-toast";

export function InvoiceNumberCard() {
  const { data: settings, isLoading } = useSettings();
  const updateStart = useUpdateInvoiceStartNumber();

  const [isClient, setIsClient] = useState(false);
  const [startNumber, setStartNumber] = useState<number>(1);
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState<number>(1);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (settings?.invoice_start_number !== undefined) {
      setStartNumber(settings.invoice_start_number);
      if (!editing) setLocalValue(settings.invoice_start_number);
    }
  }, [settings?.invoice_start_number, editing]);

  const year = new Date().getFullYear();
  const previewNumber = `INV-${year}-${String(localValue).padStart(3, "0")}`;

  const handleSave = async () => {
    if (localValue < 1) {
      toast.error("Starting number must be at least 1");
      return;
    }
    await toast.promise(
      updateStart.mutateAsync(localValue),
      {
        loading: "Saving…",
        success: "Invoice counter updated",
        error: "Failed to update",
      }
    );
    setStartNumber(localValue);
    setEditing(false);
  };

  const handleCancel = () => {
    setLocalValue(startNumber);
    setEditing(false);
  };

  if (!isClient || isLoading) return null;

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <Hash className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Invoice Number</h3>
            <p className="text-xs text-text-muted mt-0.5">Set the starting invoice number</p>
          </div>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-50 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-hover rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateStart.isPending}
              className="px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-60"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div>
          <label className="text-xs text-text-muted block mb-1">
            Starting Invoice Number
          </label>
          {editing ? (
            <input
              id="invoice-start-number"
              type="number"
              min={1}
              value={localValue}
              onChange={(e) => setLocalValue(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="e.g. 1"
            />
          ) : (
            <p className="text-sm font-medium text-text-primary">{startNumber}</p>
          )}
        </div>

        {/* Preview */}
        <div className="rounded-lg bg-surface-hover border border-border px-4 py-3">
          <p className="text-xs text-text-muted mb-1">Next invoice will be</p>
          <p className="text-sm font-semibold text-text-primary font-mono">{previewNumber}</p>
        </div>

        {editing && (
          <p className="text-xs text-text-muted">
            ⚠️ The next invoice number will be the higher of this value and the last issued number + 1.
          </p>
        )}
      </div>
    </div>
  );
}
