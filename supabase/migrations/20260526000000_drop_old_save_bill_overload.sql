-- ============================================================
-- Migration: Drop old save_bill_with_payment overload
-- The cashier migration (20260525000000) used CREATE OR REPLACE
-- with extra params (p_cashier_id, p_cashier_name), which created
-- a NEW overload in PostgreSQL rather than replacing the old one.
-- PostgREST (PGRST203) cannot resolve the ambiguity, so we drop
-- the old 17-parameter version here.
-- ============================================================

DROP FUNCTION IF EXISTS public.save_bill_with_payment(
  TEXT,   -- p_bill_number
  UUID,   -- p_customer_id
  TEXT,   -- p_customer_name
  NUMERIC, -- p_subtotal
  TEXT,   -- p_discount_type
  NUMERIC, -- p_discount_value
  NUMERIC, -- p_discount_amount
  NUMERIC, -- p_gst_rate
  NUMERIC, -- p_cgst_amount
  NUMERIC, -- p_sgst_amount
  NUMERIC, -- p_gst_amount
  NUMERIC, -- p_total
  NUMERIC, -- p_amount_paid
  TEXT,   -- p_payment_method
  TEXT,   -- p_status
  JSONB,  -- p_items
  TEXT    -- p_payment_notes
);
