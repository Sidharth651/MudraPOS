"use client";

import { useState } from "react";
import { Plus, Search, Users, IndianRupee, UserCheck } from "lucide-react";
import { useCustomers } from "@/lib/hooks";
import { formatINR } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { CustomerList } from "@/components/customers/customer-list";
import { CustomerLedger } from "@/components/customers/customer-ledger";
import { CustomerFormDrawer } from "@/components/customers/customer-form-drawer";
import { PaymentFormDrawer } from "@/components/customers/payment-form-drawer";

export default function CustomersPage() {
  const { openDrawer, selectedCustomerId } = useUIStore();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: customers } = useCustomers();
  const customerData = customers || [];

  const totalCustomers = customerData.length;
  const totalOutstanding = customerData.reduce(
    (sum, c) => sum + Number(c.outstanding_balance),
    0
  );
  const settledCount = customerData.filter(
    (c) => Number(c.outstanding_balance) === 0
  ).length;

  return (
    <div className="p-4 lg:p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Customer Khata</h1>
          <p className="text-xs text-text-muted mt-0.5">Manage customer accounts</p>
        </div>
        <button
          onClick={() => openDrawer("add-customer")}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white border border-border rounded-xl p-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted">Customers</p>
            <p className="text-base font-bold text-text-primary">{totalCustomers}</p>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-red-light flex items-center justify-center">
            <IndianRupee className="w-4 h-4 text-red" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted">Outstanding</p>
            <p className="text-base font-bold text-red">{formatINR(totalOutstanding)}</p>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-green-light flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-green" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted">Settled</p>
            <p className="text-base font-bold text-green">{settledCount}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
      </div>

      {/* Master-Detail */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Customer List */}
        <div
          className={`lg:w-[40%] overflow-y-auto ${
            selectedCustomerId ? "hidden lg:block" : ""
          }`}
        >
          <CustomerList searchQuery={searchQuery} />
        </div>

        {/* Ledger */}
        <div
          className={`lg:w-[60%] overflow-y-auto ${
            !selectedCustomerId ? "hidden lg:flex" : ""
          }`}
        >
          <CustomerLedger />
        </div>
      </div>

      {/* Drawers */}
      <CustomerFormDrawer />
      <PaymentFormDrawer />
    </div>
  );
}
