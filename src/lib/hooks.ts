import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "./supabase/client";
import type {
  Product,
  Customer,
  Bill,
  Staff,
  ShopSettings,
  LedgerEntry,
  Category,
} from "@/types/database";

// Utility hook to get the Supabase client
export function useSupabase() {
  return createClient();
}

export function useCategories() {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useProducts() {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useCustomers() {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Customer[];
    },
  });
}

export function useStaff() {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Staff[];
    },
  });
}

export function useSettings() {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error; // PGRST116 is no rows
      // Map flat DB settings to ShopSettings format
      if (data) {
        return {
          id: data.id,
          shop_name: data.shop_name,
          gst_config: {
            low_threshold: data.gst_low_threshold,
            low_rate: data.gst_low_rate,
            high_rate: data.gst_high_rate,
          },
          printer_enabled: data.printer_enabled,
          whatsapp_enabled: data.whatsapp_enabled,
          whatsapp_number: data.whatsapp_number,
          low_stock_threshold: data.low_stock_threshold,
        } as ShopSettings;
      }
      return null;
    },
  });
}

export function useBills() {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["bills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Bill[];
    },
  });
}

export function useLedgerEntries(customerId: string) {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["ledger", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      // Fetch bills
      const { data: billsData, error: bErr } = await supabase
        .from("bills")
        .select("*")
        .eq("customer_id", customerId);
        
      if (bErr) throw bErr;
      
      // Fetch payments
      const { data: paymentsData, error: pErr } = await supabase
        .from("payments")
        .select("*")
        .eq("customer_id", customerId);
        
      if (pErr) throw pErr;
      
      const entries: LedgerEntry[] = [];
      
      billsData?.forEach(b => {
        entries.push({
          id: b.id,
          type: "purchase",
          date: b.created_at,
          description: `Bill ${b.bill_number}`,
          amount: b.total,
          balance_after: 0, // Computed below
        });
      });
      
      paymentsData?.forEach(p => {
        entries.push({
          id: p.id,
          type: "payment",
          date: p.created_at,
          description: p.notes || `Payment (${p.payment_method})`,
          amount: p.amount,
          balance_after: 0,
        });
      });
      
      // Sort by date ascending
      entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Compute running balance
      let balance = 0;
      entries.forEach(e => {
        if (e.type === "purchase") balance += Number(e.amount);
        else balance -= Number(e.amount);
        e.balance_after = balance;
      });
      
      // Return sorted descending (newest first)
      return entries.reverse();
    },
    enabled: !!customerId,
  });
}

export function useNextBillNumber() {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["nextBillNumber"],
    queryFn: async () => {
      const year = new Date().getFullYear();
      const prefix = `INV-${year}-`;

      const { data, error } = await supabase
        .from("bills")
        .select("bill_number")
        .like("bill_number", `${prefix}%`)
        .order("bill_number", { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNum = 1;
      if (data && data.length > 0) {
        const lastNum = parseInt(data[0].bill_number.replace(prefix, ""), 10);
        if (!isNaN(lastNum)) nextNum = lastNum + 1;
      }

      return `${prefix}${String(nextNum).padStart(3, "0")}`;
    },
  });
}

export function useBillDetails(billId: string | null) {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["bill", billId],
    queryFn: async () => {
      if (!billId) return null;
      const { data: bill, error } = await supabase
        .from("bills")
        .select("*")
        .eq("id", billId)
        .single();
      
      if (error) throw error;
      
      const { data: items, error: itemsError } = await supabase
        .from("bill_items")
        .select("*")
        .eq("bill_id", billId);
        
      if (itemsError) throw itemsError;

      // Fetch upfront payment if any
      const { data: payments } = await supabase
        .from("payments")
        .select("amount")
        .eq("notes", `Upfront payment for Bill ${bill.bill_number}`);
        
      const amount_received = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      
      return { ...bill, items, amount_received } as Bill & { amount_received: number };
    },
    enabled: !!billId,
  });
}

export function useDeleteBill() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bill: Bill) => {
      // 1. Delete associated upfront payment
      const { data: payments } = await supabase
        .from("payments")
        .select("id, amount")
        .eq("notes", `Upfront payment for Bill ${bill.bill_number}`);

      const paidAmount = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      
      if (payments && payments.length > 0) {
        await supabase
          .from("payments")
          .delete()
          .in("id", payments.map(p => p.id));
      }

      // 2. Fix customer outstanding balance (deduct balanceDue)
      const balanceDue = Number(bill.total) - paidAmount;
      if (bill.customer_id && balanceDue > 0) {
        const { data: custData } = await supabase
          .from("customers")
          .select("outstanding_balance")
          .eq("id", bill.customer_id)
          .single();
        if (custData) {
          const newBalance = Number(custData.outstanding_balance) - balanceDue;
          await supabase
            .from("customers")
            .update({ outstanding_balance: newBalance })
            .eq("id", bill.customer_id);
        }
      }

      // 3. Delete bill items explicitly (if cascade is not enabled)
      await supabase.from("bill_items").delete().eq("bill_id", bill.id);

      // 4. Delete the bill
      const { error } = await supabase.from("bills").delete().eq("id", bill.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["ledger"] });
    },
  });
}

export function useUpdateBill() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      originalBill,
      updatedBill,
    }: {
      originalBill: Bill;
      updatedBill: Partial<Bill> & { items: any[]; amount_received?: number | null };
    }) => {
      // 1. Calculate final status based on amount_received
      const newTotal = Number(updatedBill.total);
      let newPaidAmount = 0;
      
      if (updatedBill.payment_method === "credit") {
        newPaidAmount = 0;
      } else {
        if (updatedBill.amount_received === undefined || updatedBill.amount_received === null) {
          newPaidAmount = newTotal;
        } else {
          newPaidAmount = updatedBill.amount_received;
        }
      }
      
      newPaidAmount = Math.max(0, Math.min(newTotal, newPaidAmount));
      const newBalanceDue = newTotal - newPaidAmount;
      const computedStatus = newBalanceDue > 0 ? "pending" : "completed";

      // 2. Update bill details
      const { items, id, created_at, amount_received, ...billUpdateData } = updatedBill;
      
      const finalBillUpdate = {
        ...billUpdateData,
        status: computedStatus,
      };
      
      const { error: billError } = await supabase
        .from("bills")
        .update(finalBillUpdate)
        .eq("id", originalBill.id);
        
      if (billError) throw billError;

      // 3. Replace items: Delete old, insert new
      await supabase.from("bill_items").delete().eq("bill_id", originalBill.id);
      
      const newItems = items.map((item) => ({
        bill_id: originalBill.id,
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
        .insert(newItems);
        
      if (itemsError) throw itemsError;

      // 4. Reconcile Payments & Balances
      
      // -- Revert Old --
      const { data: oldPayments } = await supabase
        .from("payments")
        .select("id, amount")
        .eq("notes", `Upfront payment for Bill ${originalBill.bill_number}`);
        
      const oldPaidAmount = oldPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const oldBalanceDue = Number(originalBill.total) - oldPaidAmount;

      if (oldPayments && oldPayments.length > 0) {
        await supabase
          .from("payments")
          .delete()
          .in("id", oldPayments.map(p => p.id));
      }

      if (originalBill.customer_id && oldBalanceDue > 0) {
        const { data: custData } = await supabase
          .from("customers")
          .select("outstanding_balance")
          .eq("id", originalBill.customer_id)
          .single();
        if (custData) {
          const revertBalance = Number(custData.outstanding_balance) - oldBalanceDue;
          await supabase
            .from("customers")
            .update({ outstanding_balance: revertBalance })
            .eq("id", originalBill.customer_id);
        }
      }

      // -- Apply New --
      if (updatedBill.customer_id) {
        if (newBalanceDue > 0) {
          const { data: custData } = await supabase
            .from("customers")
            .select("outstanding_balance")
            .eq("id", updatedBill.customer_id)
            .single();
          if (custData) {
            const applyBalance = Number(custData.outstanding_balance) + newBalanceDue;
            await supabase
              .from("customers")
              .update({ outstanding_balance: applyBalance })
              .eq("id", updatedBill.customer_id);
          }
        }

        if (newPaidAmount > 0) {
          await supabase.from("payments").insert({
            customer_id: updatedBill.customer_id,
            amount: newPaidAmount,
            payment_method: updatedBill.payment_method,
            notes: `Upfront payment for Bill ${originalBill.bill_number}`,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["bill"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["ledger"] });
    },
  });
}

export function useUpdateSettings() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedSettings: Partial<ShopSettings> & { id?: string }) => {
      // Map back from ShopSettings to flat DB format where necessary
      const payload: any = {};
      
      if (updatedSettings.shop_name !== undefined) payload.shop_name = updatedSettings.shop_name;
      if (updatedSettings.printer_enabled !== undefined) payload.printer_enabled = updatedSettings.printer_enabled;
      if (updatedSettings.whatsapp_enabled !== undefined) payload.whatsapp_enabled = updatedSettings.whatsapp_enabled;
      if (updatedSettings.whatsapp_number !== undefined) payload.whatsapp_number = updatedSettings.whatsapp_number;
      if (updatedSettings.low_stock_threshold !== undefined) payload.low_stock_threshold = updatedSettings.low_stock_threshold;
      
      if (updatedSettings.gst_config !== undefined) {
        payload.gst_low_threshold = updatedSettings.gst_config.low_threshold;
        payload.gst_low_rate = updatedSettings.gst_config.low_rate;
        payload.gst_high_rate = updatedSettings.gst_config.high_rate;
      }

      let targetId = updatedSettings.id;
      
      if (!targetId) {
        const { data } = await supabase.from("settings").select("id").limit(1).maybeSingle();
        if (data?.id) {
          targetId = data.id;
        }
      }

      if (targetId) {
        const { error } = await supabase
          .from("settings")
          .update(payload)
          .eq("id", targetId);

        if (error) throw error;
      } else {
        // Initialize defaults if they are missing
        if (payload.shop_name === undefined) payload.shop_name = "";
        if (payload.printer_enabled === undefined) payload.printer_enabled = false;
        if (payload.whatsapp_enabled === undefined) payload.whatsapp_enabled = false;
        if (payload.whatsapp_number === undefined) payload.whatsapp_number = "";
        if (payload.low_stock_threshold === undefined) payload.low_stock_threshold = 10;
        if (payload.gst_low_threshold === undefined) payload.gst_low_threshold = 1000;
        if (payload.gst_low_rate === undefined) payload.gst_low_rate = 5;
        if (payload.gst_high_rate === undefined) payload.gst_high_rate = 12;

        const { error } = await supabase
          .from("settings")
          .insert(payload);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
