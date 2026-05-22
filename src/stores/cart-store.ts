// ============================================================
// Zustand Cart Store — manages POS cart state
// ============================================================

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { CartItem, PaymentMethod, Unit, Bill } from "@/types/database";
import { formatINR } from "@/lib/utils";

interface CartState {
  items: CartItem[];
  discount_type: "percentage" | "flat";
  discount_value: number;
  payment_method: PaymentMethod;
  amount_received: number | null; // null means full payment
  customer_id: string | null;
  customer_name: string | null;
  saving: boolean;

  // Actions
  addItem: (product: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit: Unit;
    unit_price: number;
    hsn_code?: string;
    pieces?: number;
    metres_per_piece?: number;
  }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItemDetails: (id: string, updates: Partial<CartItem>) => void;
  setDiscount: (type: "percentage" | "flat", value: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setAmountReceived: (amount: number | null) => void;
  setCustomer: (id: string | null, name: string | null) => void;
  clearCart: () => void;
  saveBill: (billNumber: string, waiveBalance?: boolean) => Promise<Bill | null>;

  // Computed (as functions)
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getGSTRate: () => number;
  getGSTAmount: () => number;
  getCGST: () => number;
  getSGST: () => number;
  getTotal: () => number;
  getBalanceDue: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount_type: "percentage",
  discount_value: 0,
  payment_method: "cash",
  amount_received: null,
  customer_id: null,
  customer_name: "Walk In",
  saving: false,

  addItem: (product) => {
    const id = `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      items: [
        ...state.items,
        {
          id,
          product_id: product.product_id,
          product_name: product.product_name,
          quantity: product.quantity,
          unit: product.unit,
          unit_price: product.unit_price,
          subtotal: product.quantity * product.unit_price,
          hsn_code: product.hsn_code || "5802",
          pieces: product.pieces,
          metres_per_piece: product.metres_per_piece,
        },
      ],
    }));
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  updateQuantity: (id, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, quantity, subtotal: quantity * item.unit_price }
          : item
      ),
    }));
  },

  updateItemDetails: (id, updates) => {
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          // Recalculate subtotal in case quantity or unit_price changed
          updated.subtotal = updated.quantity * updated.unit_price;
          return updated;
        }
        return item;
      }),
    }));
  },

  setDiscount: (type, value) => {
    set({ discount_type: type, discount_value: value });
  },

  setPaymentMethod: (method) => {
    // Reset amount_received when switching to khata
    if (method === "credit") {
      set({ payment_method: method, amount_received: null });
    } else {
      set({ payment_method: method });
    }
  },

  setAmountReceived: (amount) => {
    set({ amount_received: amount });
  },

  setCustomer: (id, name) => {
    set({ customer_id: id, customer_name: name });
  },

  clearCart: () => {
    set({
      items: [],
      discount_type: "percentage",
      discount_value: 0,
      payment_method: "cash",
      amount_received: null,
      customer_id: null,
      customer_name: "Walk In",
    });
  },

  saveBill: async (billNumber: string, waiveBalance?: boolean) => {
    const state = get();
    if (state.items.length === 0) return null;

    set({ saving: true });

    const supabase = createClient();
    const subtotal = state.getSubtotal();
    const discountAmount = state.getDiscountAmount();
    const gstRate = state.getGSTRate();
    const cgst = state.getCGST();
    const sgst = state.getSGST();
    const gstAmount = state.getGSTAmount();
    const total = state.getTotal();
    const balanceDue = waiveBalance ? 0 : state.getBalanceDue();

    // Determine effective payment method for the bill record
    // If partial payment via cash/upi, the bill is still recorded as cash/upi
    const billPaymentMethod = state.payment_method;

    try {
      // 1. Insert bill
      const { data: billData, error: billError } = await supabase
        .from("bills")
        .insert({
          bill_number: billNumber,
          customer_id: state.customer_id,
          customer_name: state.customer_name,
          subtotal,
          discount_type: state.discount_type,
          discount_value: state.discount_value,
          discount_amount: discountAmount,
          gst_rate: gstRate,
          cgst_amount: cgst,
          sgst_amount: sgst,
          gst_amount: gstAmount,
          total,
          payment_method: billPaymentMethod,
          status: balanceDue > 0 ? "pending" : "completed",
        })
        .select()
        .single();

      if (billError) throw billError;

      // 2. Insert bill items
      const billItems = state.items.map((item) => ({
        bill_id: billData.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        hsn_code: item.hsn_code,
      }));

      const { error: itemsError } = await supabase
        .from("bill_items")
        .insert(billItems);

      if (itemsError) throw itemsError;

      // 3. Update customer outstanding balance and record upfront payment
      if (state.customer_id) {
        if (balanceDue > 0) {
          const { data: custData } = await supabase
            .from("customers")
            .select("outstanding_balance")
            .eq("id", state.customer_id)
            .single();

          if (custData) {
            const newBalance = Number(custData.outstanding_balance) + balanceDue;
            await supabase
              .from("customers")
              .update({ outstanding_balance: newBalance })
              .eq("id", state.customer_id);
          }
        }

        // 4. Insert payment record for the upfront amount paid (if any)
        const actualPaidAmount = waiveBalance && state.amount_received !== null ? state.amount_received : (total - balanceDue);
        if (actualPaidAmount > 0) {
          await supabase.from("payments").insert({
            customer_id: state.customer_id,
            amount: actualPaidAmount,
            payment_method: billPaymentMethod,
            notes: waiveBalance ? `Upfront payment for Bill ${billNumber} (${formatINR(state.getBalanceDue())} Waived)` : `Upfront payment for Bill ${billNumber}`,
          });
        }
      }

      // Build the saved bill object for receipt printing
      const savedBill: Bill = {
        id: billData.id,
        bill_number: billNumber,
        customer_id: state.customer_id,
        customer_name: state.customer_name,
        items: state.items.map((item) => ({
          id: item.id,
          bill_id: billData.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          hsn_code: item.hsn_code,
          pieces: item.pieces,
          metres_per_piece: item.metres_per_piece,
        })),
        subtotal,
        discount_type: state.discount_type,
        discount_value: state.discount_value,
        discount_amount: discountAmount,
        gst_rate: gstRate,
        cgst_amount: cgst,
        sgst_amount: sgst,
        gst_amount: gstAmount,
        total,
        payment_method: billPaymentMethod,
        status: balanceDue > 0 ? "pending" : "completed",
        created_at: billData.created_at,
      };

      // Clear cart after successful save
      set({
        items: [],
        discount_type: "percentage",
        discount_value: 0,
        payment_method: "cash",
        amount_received: null,
        customer_id: null,
        customer_name: "Walk In",
        saving: false,
      });

      return savedBill;
    } catch (error) {
      const e = error as { message?: string; code?: string; details?: string; hint?: string };
      console.error("Failed to save bill:", e?.message ?? error, {
        code: e?.code,
        details: e?.details,
        hint: e?.hint,
      });
      set({ saving: false });
      throw error;
    }
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0);
  },

  getDiscountAmount: () => {
    const { discount_type, discount_value } = get();
    const subtotal = get().getSubtotal();
    if (discount_type === "percentage") {
      return (subtotal * discount_value) / 100;
    }
    return Math.min(discount_value, subtotal);
  },

  getGSTRate: () => {
    return 5;
  },

  getGSTAmount: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    const taxableAmount = subtotal - discount;
    const rate = get().getGSTRate();
    return (taxableAmount * rate) / 100;
  },

  getCGST: () => {
    return get().getGSTAmount() / 2;
  },

  getSGST: () => {
    return get().getGSTAmount() / 2;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    const gst = get().getGSTAmount();
    return subtotal - discount + gst;
  },

  getBalanceDue: () => {
    const state = get();
    const total = state.getTotal();

    // Full khata — entire amount is due
    if (state.payment_method === "credit") return total;

    // Cash/UPI with amount_received specified
    if (state.amount_received !== null && state.amount_received < total) {
      return Math.max(0, total - state.amount_received);
    }

    // Fully paid
    return 0;
  },
}));
