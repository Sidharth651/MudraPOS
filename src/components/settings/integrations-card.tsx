"use client";

import { useState } from "react";
import { Plug, Printer, MessageCircle, Bell } from "lucide-react";
import { useSettings } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

function Toggle({ enabled, onToggle }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors duration-300",
        enabled ? "bg-primary" : "bg-gray-300"
      )}
    >
      <div
        className={cn(
          "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300",
          enabled ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export function IntegrationsCard() {
  const { data: dbSettings } = useSettings();
  const [printerEnabled, setPrinterEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  useEffect(() => {
    if (dbSettings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrinterEnabled(dbSettings.printer_enabled);
      setWhatsappEnabled(dbSettings.whatsapp_enabled);
      setWhatsappNumber(dbSettings.whatsapp_number);
      setLowStockThreshold(dbSettings.low_stock_threshold);
    }
  }, [dbSettings]);

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
          <Plug className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-text-primary">Integrations</h3>
      </div>

      <div className="divide-y divide-border">
        {/* Thermal Printer */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Printer className="w-5 h-5 text-text-muted" />
              <div>
                <p className="text-sm font-medium text-text-primary">Thermal Printer</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {printerEnabled ? (
                    <span className="text-green flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green inline-block" />
                      Connected
                    </span>
                  ) : (
                    <span className="text-text-light">Disconnected</span>
                  )}
                </p>
              </div>
            </div>
            <Toggle enabled={printerEnabled} onToggle={() => setPrinterEnabled(!printerEnabled)} />
          </div>
        </div>

        {/* WhatsApp */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-text-muted" />
              <div>
                <p className="text-sm font-medium text-text-primary">WhatsApp Billing</p>
                <p className="text-xs text-text-muted mt-0.5">Send bills via WhatsApp</p>
              </div>
            </div>
            <Toggle enabled={whatsappEnabled} onToggle={() => setWhatsappEnabled(!whatsappEnabled)} />
          </div>
          {whatsappEnabled && (
            <div className="ml-8 mt-2">
              <label className="text-xs text-text-muted block mb-1">WhatsApp Number</label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-5 h-5 text-text-muted" />
            <div>
              <p className="text-sm font-medium text-text-primary">Low Stock Alerts</p>
              <p className="text-xs text-text-muted mt-0.5">
                Alert when stock falls below threshold
              </p>
            </div>
          </div>
          <div className="ml-8 mt-2">
            <label className="text-xs text-text-muted block mb-1">
              Threshold (units)
            </label>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
              className="w-32 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <p className="text-xs text-text-muted mt-1">
              Currently set to <span className="font-medium text-text-primary">{lowStockThreshold}</span> units
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
