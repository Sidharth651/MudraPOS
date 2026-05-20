"use client";

import { useState } from "react";
import { FileText, Pencil } from "lucide-react";
import { useSettings } from "@/lib/hooks";
import { formatINR } from "@/lib/utils";
import { useEffect } from "react";

export function GSTConfigCard() {
  const { data: dbSettings } = useSettings();
  const [editing, setEditing] = useState(false);
  const [config, setConfig] = useState({ low_threshold: 0, low_rate: 0, high_rate: 0 });

  useEffect(() => {
    if (dbSettings?.gst_config) {
      setConfig(dbSettings.gst_config);
    }
  }, [dbSettings]);

  return (
    <div className="bg-white border border-border rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">GST Configuration</h3>
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
      <div className="p-5">
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-text-muted block mb-1">Threshold Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₹</span>
                <input
                  type="number"
                  value={config.low_threshold}
                  onChange={(e) => setConfig({ ...config, low_threshold: parseInt(e.target.value) || 0 })}
                  className="w-full border border-border rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-muted block mb-1">Below Threshold (%)</label>
                <input
                  type="number"
                  value={config.low_rate}
                  onChange={(e) => setConfig({ ...config, low_rate: parseInt(e.target.value) || 0 })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Above Threshold (%)</label>
                <input
                  type="number"
                  value={config.high_rate}
                  onChange={(e) => setConfig({ ...config, high_rate: parseInt(e.target.value) || 0 })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Visual Diagram */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 p-3 bg-green-light rounded-xl text-center">
                <p className="text-xs text-text-muted">Below {formatINR(config.low_threshold)}</p>
                <p className="text-2xl font-bold text-green mt-1">{config.low_rate}%</p>
                <p className="text-[10px] text-text-muted">CGST {config.low_rate / 2}% + SGST {config.low_rate / 2}%</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-8 h-px bg-border sm:w-px sm:h-8" />
              </div>
              <div className="flex-1 p-3 bg-amber-light rounded-xl text-center">
                <p className="text-xs text-text-muted">Above {formatINR(config.low_threshold)}</p>
                <p className="text-2xl font-bold text-amber mt-1">{config.high_rate}%</p>
                <p className="text-[10px] text-text-muted">CGST {config.high_rate / 2}% + SGST {config.high_rate / 2}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
