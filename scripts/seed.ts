import { createClient } from "@supabase/supabase-js";
import {
  mockProducts,
  mockCustomers,
  mockBills,
  mockLedgerEntries,
  mockStaff,
  mockSettings,
} from "../src/lib/mock-data.ts";
import { randomUUID } from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Starting DB seed...");

  // Maps to store old string IDs to new UUIDs
  const productMap = new Map<string, string>();
  const customerMap = new Map<string, string>();

  // 1. Seed Products
  console.log("Seeding Products...");
  const productsToInsert = mockProducts.map((p) => {
    const newId = randomUUID();
    productMap.set(p.id, newId);
    return {
      id: newId,
      name: p.name,
      category: p.category,
      price_per_unit: p.price_per_unit,
      unit: p.unit,
      hsn_code: p.hsn_code,
      // let db handle created_at
    };
  });
  const { error: pErr } = await supabase.from("products").insert(productsToInsert);
  if (pErr) throw pErr;

  // 2. Seed Customers
  console.log("Seeding Customers...");
  const customersToInsert = mockCustomers.map((c) => {
    const newId = randomUUID();
    customerMap.set(c.id, newId);
    return {
      id: newId,
      name: c.name,
      phone: c.phone,
      address: c.address,
      outstanding_balance: c.outstanding_balance,
    };
  });
  const { error: cErr } = await supabase.from("customers").insert(customersToInsert);
  if (cErr) throw cErr;

  // 3. Seed Staff
  console.log("Seeding Staff...");
  const staffToInsert = mockStaff.map((s) => ({
    name: s.name,
    role: s.role,
    email: s.email,
    is_active: s.is_active,
  }));
  const { error: sErr } = await supabase.from("staff").insert(staffToInsert);
  if (sErr) throw sErr;

  // 4. Seed Settings
  console.log("Seeding Settings...");
  const settingsToInsert = {
    shop_name: mockSettings.shop_name,
    address: mockSettings.address,
    gstin: mockSettings.gstin,
    phone: mockSettings.phone,
    gst_low_threshold: mockSettings.gst_config.low_threshold,
    gst_low_rate: mockSettings.gst_config.low_rate,
    gst_high_rate: mockSettings.gst_config.high_rate,
    printer_enabled: mockSettings.printer_enabled,
    whatsapp_enabled: mockSettings.whatsapp_enabled,
    whatsapp_number: mockSettings.whatsapp_number,
    low_stock_threshold: mockSettings.low_stock_threshold,
  };
  const { error: setErr } = await supabase.from("settings").insert(settingsToInsert);
  if (setErr) throw setErr;

  // 5. Seed Bills
  console.log("Seeding Bills...");
  const billsToInsert = mockBills.map((b) => {
    return {
      id: randomUUID(), // Generate new UUID
      bill_number: b.bill_number,
      customer_id: b.customer_id ? customerMap.get(b.customer_id) : null,
      customer_name: b.customer_name,
      subtotal: b.subtotal,
      discount_type: b.discount_type,
      discount_value: b.discount_value,
      discount_amount: b.discount_amount,
      gst_rate: b.gst_rate,
      cgst_amount: b.cgst_amount,
      sgst_amount: b.sgst_amount,
      gst_amount: b.gst_amount,
      total: b.total,
      payment_method: b.payment_method,
      status: b.status,
    };
  });
  const { error: bErr } = await supabase.from("bills").insert(billsToInsert);
  if (bErr) throw bErr;

  // Note: Mock data doesn't have bill items inside mockBills array directly in `mock-data.ts`,
  // the `items: []` is empty. So we skip bill_items for now.

  // 6. Seed Payments (Ledger)
  console.log("Seeding Payments/Ledger...");
  const paymentsToInsert = [];
  for (const [custId, entries] of Object.entries(mockLedgerEntries)) {
    const newCustId = customerMap.get(custId);
    if (!newCustId) continue;

    for (const entry of entries) {
      // Ledger entries are both purchases and payments, but the `payments` table
      // in schema is meant for payments specifically (khata).
      // Let's only insert 'payment' types into the payments table
      if (entry.type === "payment") {
        paymentsToInsert.push({
          customer_id: newCustId,
          amount: entry.amount,
          payment_method: "cash", // default to cash as mock doesn't strictly match the enum always
          notes: entry.description,
        });
      }
    }
  }
  
  if (paymentsToInsert.length > 0) {
    const { error: payErr } = await supabase.from("payments").insert(paymentsToInsert);
    if (payErr) throw payErr;
  }

  console.log("✅ Seeding completed successfully!");
}

seed().catch(console.error);
