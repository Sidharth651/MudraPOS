"use client";

import { useProducts } from "@/lib/hooks";
import { formatINR } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { Pencil, Trash2 } from "lucide-react";

interface ProductTableProps {
  searchQuery: string;
}

export function ProductTable({ searchQuery }: ProductTableProps) {
  const { openDrawer } = useUIStore();
  const { data: queryProducts } = useProducts();

  let products = queryProducts ? [...queryProducts] : [];

  // Filter by search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q)
    );
  }

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface text-text-muted">
              <th className="text-left px-4 py-3 font-medium">#</th>
              <th className="text-left px-4 py-3 font-medium">Fabric Name</th>
              <th className="text-right px-4 py-3 font-medium">Price</th>
              <th className="text-left px-4 py-3 font-medium">HSN Code</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-center px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, idx) => (
              <tr
                key={product.id}
                className={`border-t border-border hover:bg-primary-50/50 transition-colors ${
                  idx % 2 === 1 ? "bg-surface/50" : ""
                }`}
              >
                <td className="px-4 py-3 text-text-muted">{idx + 1}</td>
                <td className="px-4 py-3 font-medium text-text-primary">{product.name}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatINR(product.price_per_unit)}
                  <span className="text-text-muted text-xs">/{product.unit === "metre" ? "m" : "pc"}</span>
                </td>
                <td className="px-4 py-3 text-text-muted">{product.hsn_code}</td>
                <td className="px-4 py-3 text-text-muted capitalize">{product.category}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() =>
                        openDrawer("edit-product", { product: product as unknown as Record<string, unknown> })
                      }
                      className="p-1.5 rounded-lg hover:bg-primary-light text-text-muted hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${product.name}"?`)) {
                          // Mock delete
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-light text-text-muted hover:text-red transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="py-12 text-center text-text-muted text-sm">
            No products found
          </div>
        )}
      </div>
    </div>
  );
}
