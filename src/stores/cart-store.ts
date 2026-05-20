// ============================================================
// Zustand Cart Store — manages POS cart state
// ============================================================

import { create } from "zustand";
import type { CartItem, PaymentMethod, Unit } from "@/types/database";

interface CartState {
  items: CartItem[];
  discount_type: "percentage" | "flat";
  discount_value: number;
  payment_method: PaymentMethod;
  customer_id: string | null;
  customer_name: string | null;

  // Actions
  addItem: (product: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit: Unit;
    unit_price: number;
  }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setDiscount: (type: "percentage" | "flat", value: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setCustomer: (id: string | null, name: string | null) => void;
  clearCart: () => void;

  // Computed (as functions)
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getGSTRate: () => number;
  getGSTAmount: () => number;
  getCGST: () => number;
  getSGST: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount_type: "percentage",
  discount_value: 0,
  payment_method: "cash",
  customer_id: null,
  customer_name: null,

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

  setDiscount: (type, value) => {
    set({ discount_type: type, discount_value: value });
  },

  setPaymentMethod: (method) => {
    set({ payment_method: method });
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
      customer_id: null,
      customer_name: null,
    });
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
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    const taxableAmount = subtotal - discount;
    return taxableAmount < 1000 ? 5 : 12;
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
}));
