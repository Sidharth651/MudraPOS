import { useQuery } from "@tanstack/react-query";
import { createClient } from "./supabase/client";
import type {
  Product,
  Customer,
  Bill,
  Staff,
  ShopSettings,
  DailySummary,
  SalesBreakdown,
  TopProduct,
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
      const { data, error } = await supabase.from("settings").select("*").limit(1).single();
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

export function useDailySummary() {
  const { data: bills } = useBills();
  
  return useQuery({
    queryKey: ["dailySummary", bills?.length], // Refetch when bills change
    queryFn: () => {
      const todayBills = bills || []; // In a real app, filter by today
      let total_sales = 0;
      let cash_collected = 0;
      let upi_collected = 0;
      let khata_credit = 0;
      
      todayBills.forEach(b => {
        total_sales += Number(b.total);
        if (b.payment_method === 'cash') cash_collected += Number(b.total);
        else if (b.payment_method === 'upi') upi_collected += Number(b.total);
        else if (b.payment_method === 'credit') khata_credit += Number(b.total);
      });
      
      return {
        total_sales,
        cash_collected,
        upi_collected,
        khata_credit,
        items_sold: todayBills.length, // approximation
        bills_count: todayBills.length,
      } as DailySummary;
    },
    enabled: !!bills,
  });
}

export function useSalesBreakdown() {
  const { data: summary } = useDailySummary();
  return useQuery({
    queryKey: ["salesBreakdown", summary],
    queryFn: () => {
      if (!summary) return [];
      return [
        { label: "Cash", amount: summary.cash_collected, color: "#16A34A" },
        { label: "UPI", amount: summary.upi_collected, color: "#7C3AED" },
        { label: "Credit (Khata)", amount: summary.khata_credit, color: "#F59E0B" },
      ] as SalesBreakdown[];
    },
    enabled: !!summary,
  });
}

export function useTopProducts() {

  return useQuery({
    queryKey: ["topProducts"],
    queryFn: async () => {
      // For now, return empty as bill_items are not seeded properly yet
      // A real implementation would aggregate over bill_items
      return [] as TopProduct[];
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
