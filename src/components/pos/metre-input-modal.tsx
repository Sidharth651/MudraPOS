"use client";

import { useState, useEffect } from "react";
import { X, Plus, Minus } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types/database";

interface MetreInputModalProps {
  product: Product;
  onClose: () => void;
}

export function MetreInputModal({ product, onClose }: MetreInputModalProps) {
  const [quantity, setQuantity] = useState(product.unit === "metre" ? 1.6 : 1);
  const [pieces, setPieces] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const step = product.unit === "metre" ? 0.1 : 1;
  const totalQuantity = product.unit === "metre" ? Number((quantity * pieces).toFixed(2)) : quantity;
  const subtotal = totalQuantity * product.price_per_unit;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleAdd = () => {
    if (totalQuantity <= 0) return;
    addItem({
      product_id: product.id,
      product_name: product.name,
      quantity: totalQuantity,
      unit: product.unit,
      unit_price: product.price_per_unit,
      hsn_code: product.hsn_code,
      pieces: product.unit === "metre" && pieces > 1 ? pieces : undefined,
      metres_per_piece: product.unit === "metre" && pieces > 1 ? quantity : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 overlay-enter" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-6 modal-enter">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-surface-hover transition-colors text-text-muted"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Info */}
        <h3 className="text-lg font-semibold text-text-primary pr-8">{product.name}</h3>
        <p className="text-sm text-text-muted mt-1">
          {formatINR(product.price_per_unit)} per {product.unit === "metre" ? "metre" : "piece"}
        </p>

        {/* Quantity Input */}
        <div className="mt-6">
          <label className="text-sm font-medium text-text-primary block mb-2">
            {product.unit === "metre" ? "Metres per piece" : "Quantity"}
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Number(Math.max(step, quantity - step).toFixed(2)))}
              className="w-12 h-12 shrink-0 rounded-xl border border-border flex items-center justify-center hover:bg-surface-hover transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, parseFloat(e.target.value) || 0))}
              step={step}
              min={step}
              className="flex-1 min-w-0 h-12 text-center text-xl font-bold border border-border rounded-xl px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={() => setQuantity(Number((quantity + step).toFixed(2)))}
              className="w-12 h-12 shrink-0 rounded-xl border border-border flex items-center justify-center hover:bg-surface-hover transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pieces Input (Only for Metres) */}
        {product.unit === "metre" && (
          <div className="mt-4">
            <label className="text-sm font-medium text-text-primary block mb-2">
              Number of Pieces
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPieces(Math.max(1, pieces - 1))}
                className="w-12 h-12 shrink-0 rounded-xl border border-border flex items-center justify-center hover:bg-surface-hover transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <input
                type="number"
                value={pieces}
                onChange={(e) => setPieces(Math.max(1, parseInt(e.target.value) || 1))}
                step={1}
                min={1}
                className="flex-1 min-w-0 h-12 text-center text-xl font-bold border border-border rounded-xl px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={() => setPieces(pieces + 1)}
                className="w-12 h-12 shrink-0 rounded-xl border border-border flex items-center justify-center hover:bg-surface-hover transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Subtotal */}
        <div className="mt-4 p-3 bg-primary-50 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Subtotal</span>
            <span className="text-lg font-bold text-primary">{formatINR(subtotal)}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            {product.unit === "metre" 
              ? `${quantity} m ${pieces > 1 ? `× ${pieces} pcs ` : ''}× ${formatINR(product.price_per_unit)}`
              : `${quantity} pc × ${formatINR(product.price_per_unit)}`}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-text-muted hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={totalQuantity <= 0}
            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
