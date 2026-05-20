"use client";

import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatINR, cn } from "@/lib/utils";
import { PaymentBar } from "./payment-bar";
import { CustomerSelector } from "./customer-selector";

export function CartPanel() {
  const {
    items,
    discount_type,
    discount_value,
    removeItem,
    updateQuantity,
    setDiscount,
    clearCart,
    getSubtotal,
    getDiscountAmount,
    getGSTRate,
    getCGST,
    getSGST,
    getGSTAmount,
    getTotal,
  } = useCartStore();

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const taxableAmount = subtotal - discountAmount;
  const gstRate = getGSTRate();
  const cgst = getCGST();
  const sgst = getSGST();
  const gstAmount = getGSTAmount();
  const total = getTotal();

  return (
    <div className="flex flex-col h-full bg-white lg:border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-text-primary">Current Bill</h2>
          {items.length > 0 && (
            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">
              {items.length}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-red hover:text-red-dark font-medium flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Customer Selector */}
      <div className="px-4 pt-3">
        <CustomerSelector />
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted py-12">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
              <ShoppingCart className="w-7 h-7 opacity-40" />
            </div>
            <p className="text-sm font-medium">No items yet</p>
            <p className="text-xs mt-1">Add items to start billing</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-surface rounded-xl p-3 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-text-primary truncate">
                      {item.product_name}
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      {formatINR(item.unit_price)}/{item.unit === "metre" ? "m" : "pc"}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 rounded-lg text-text-light hover:text-red hover:bg-red-light transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          Math.max(item.unit === "metre" ? 0.5 : 1, item.quantity - (item.unit === "metre" ? 0.5 : 1))
                        )
                      }
                      className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-semibold w-12 text-center">
                      {item.quantity}{item.unit === "metre" ? "m" : ""}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + (item.unit === "metre" ? 0.5 : 1))
                      }
                      className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-text-primary">
                    {formatINR(item.subtotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary - only show when items exist */}
      {items.length > 0 && (
        <div className="border-t border-border px-4 py-3 space-y-2">
          {/* Discount */}
          <div className="flex items-center gap-2 pb-2">
            <span className="text-xs font-medium text-text-muted whitespace-nowrap">Discount:</span>
            <div className="flex items-center bg-surface rounded-lg p-0.5">
              <button
                onClick={() => setDiscount("percentage", discount_value)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                  discount_type === "percentage"
                    ? "bg-white text-primary shadow-sm"
                    : "text-text-muted"
                )}
              >
                %
              </button>
              <button
                onClick={() => setDiscount("flat", discount_value)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                  discount_type === "flat"
                    ? "bg-white text-primary shadow-sm"
                    : "text-text-muted"
                )}
              >
                ₹
              </button>
            </div>
            <input
              type="number"
              value={discount_value || ""}
              onChange={(e) =>
                setDiscount(discount_type, parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              className="w-20 border border-border rounded-lg px-2.5 py-1.5 text-xs text-right focus:outline-none focus:border-primary"
            />
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-text-muted">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green">
                <span>
                  Discount ({discount_type === "percentage" ? `${discount_value}%` : `₹${discount_value}`})
                </span>
                <span>-{formatINR(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-text-muted">
              <span>Taxable Amount</span>
              <span>{formatINR(taxableAmount)}</span>
            </div>
            <div className="flex justify-between text-text-muted text-xs">
              <span>CGST ({gstRate / 2}%)</span>
              <span>{formatINR(cgst)}</span>
            </div>
            <div className="flex justify-between text-text-muted text-xs">
              <span>SGST ({gstRate / 2}%)</span>
              <span>{formatINR(sgst)}</span>
            </div>
            <div className="flex justify-between text-xs text-text-muted">
              <span>GST @ {gstRate}%</span>
              <span>{formatINR(gstAmount)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-base font-bold text-text-primary">Total</span>
              <span className="text-lg font-bold text-primary">{formatINR(total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Bar */}
      {items.length > 0 && <PaymentBar total={total} />}
    </div>
  );
}
