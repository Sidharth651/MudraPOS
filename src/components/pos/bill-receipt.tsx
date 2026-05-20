"use client";

import { forwardRef } from "react";
import { formatINR, formatDateTime } from "@/lib/utils";

// ============================================================
// Types
// ============================================================

interface BillReceiptProps {
  bill: {
    bill_number: string;
    created_at: string;
    customer_name: string | null;
    items: Array<{
      product_name: string;
      quantity: number;
      unit: string;
      unit_price: number;
      subtotal: number;
    }>;
    subtotal: number;
    discount_type: "percentage" | "flat";
    discount_value: number;
    discount_amount: number;
    gst_rate: number;
    cgst_amount: number;
    sgst_amount: number;
    total: number;
    payment_method: string;
  };
  shopName?: string;
}

// ============================================================
// Constants
// ============================================================

const LINE_DOUBLE = "================================";
const LINE_SINGLE = "--------------------------------";

const receiptStyle: React.CSSProperties = {
  width: "220px",
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: "12px",
  lineHeight: "1.4",
  color: "#000",
  background: "#fff",
  padding: "4px",
};

const centerStyle: React.CSSProperties = {
  textAlign: "center",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
};

const boldStyle: React.CSSProperties = {
  fontWeight: 700,
};

// ============================================================
// Helpers
// ============================================================

/** Format quantity + unit, e.g. "2.5m" or "3pcs" */
function fmtQty(quantity: number, unit: string): string {
  const q = Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(1);
  return `${q}${unit}`;
}

/** Compact INR without the ₹ symbol prefix (we add it ourselves) */
function shortINR(amount: number): string {
  return formatINR(amount);
}

// ============================================================
// Component
// ============================================================

export const BillReceipt = forwardRef<HTMLDivElement, BillReceiptProps>(
  function BillReceipt({ bill, shopName }, ref) {
    const halfGst = bill.gst_rate / 2;
    const taxableAmount = bill.subtotal - bill.discount_amount;

    const discountLabel =
      bill.discount_type === "percentage"
        ? `Discount (${bill.discount_value}%)`
        : "Discount";

    return (
      <div ref={ref} className="receipt-print-only" style={receiptStyle}>
        {/* ── Header ─────────────────────────────── */}
        <div style={centerStyle}>
          <div>{LINE_DOUBLE}</div>
          {shopName && <div style={boldStyle}>{shopName}</div>}
          <div>{LINE_DOUBLE}</div>
        </div>

        {/* ── Bill Info ──────────────────────────── */}
        <div>
          <div style={rowStyle}>
            <span>Bill #:</span>
            <span>{bill.bill_number}</span>
          </div>
          <div style={rowStyle}>
            <span>Date:</span>
            <span>{formatDateTime(bill.created_at)}</span>
          </div>

        </div>

        <div>{LINE_SINGLE}</div>

        {/* ── Items header ───────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: 700,
          }}
        >
          <span style={{ flex: 1 }}>Item</span>
          <span style={{ width: "48px", textAlign: "right" }}>Qty</span>
          <span style={{ width: "48px", textAlign: "right" }}>Rate</span>
          <span style={{ width: "56px", textAlign: "right" }}>Amt</span>
        </div>

        {/* ── Item rows ──────────────────────────── */}
        {bill.items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.product_name}
            </span>
            <span style={{ width: "48px", textAlign: "right" }}>
              {fmtQty(item.quantity, item.unit)}
            </span>
            <span style={{ width: "48px", textAlign: "right" }}>
              {shortINR(item.unit_price)}
            </span>
            <span style={{ width: "56px", textAlign: "right" }}>
              {shortINR(item.subtotal)}
            </span>
          </div>
        ))}

        <div>{LINE_SINGLE}</div>

        {/* ── Totals ─────────────────────────────── */}
        <div>
          <div style={rowStyle}>
            <span>Subtotal</span>
            <span>{shortINR(bill.subtotal)}</span>
          </div>

          {bill.discount_amount > 0 && (
            <div style={rowStyle}>
              <span>{discountLabel}</span>
              <span>-{shortINR(bill.discount_amount)}</span>
            </div>
          )}

          {bill.gst_rate > 0 && (
            <>
              <div style={rowStyle}>
                <span>Taxable</span>
                <span>{shortINR(taxableAmount)}</span>
              </div>
              <div style={rowStyle}>
                <span>CGST ({halfGst}%)</span>
                <span>{shortINR(bill.cgst_amount)}</span>
              </div>
              <div style={rowStyle}>
                <span>SGST ({halfGst}%)</span>
                <span>{shortINR(bill.sgst_amount)}</span>
              </div>
            </>
          )}
        </div>

        <div style={centerStyle}>
          <div>{LINE_DOUBLE}</div>
          <div style={{ ...rowStyle, ...boldStyle, fontSize: "14px" }}>
            <span>TOTAL</span>
            <span>{shortINR(bill.total)}</span>
          </div>
          <div>{LINE_DOUBLE}</div>
        </div>

        {/* ── Payment & Footer ───────────────────── */}
        <div>
          <div style={rowStyle}>
            <span>Payment:</span>
            <span style={{ textTransform: "capitalize" }}>
              {bill.payment_method}
            </span>
          </div>
        </div>

        <div style={{ ...centerStyle, marginTop: "8px" }}>
          <div>Thank you for shopping!</div>
          <div>{LINE_DOUBLE}</div>
        </div>
      </div>
    );
  },
);
