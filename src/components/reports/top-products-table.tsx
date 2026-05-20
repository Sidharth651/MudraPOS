"use client";

import { useTopProducts } from "@/lib/hooks";
import { formatINR } from "@/lib/utils";

const medals = ["🥇", "🥈", "🥉"];

export function TopProductsTable() {
  const { data: topProducts } = useTopProducts();
  const sorted = [...(topProducts || [])].sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-text-primary mb-4">
        Top Selling Products
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-muted">
              <th className="text-left px-3 py-2.5 font-medium">Rank</th>
              <th className="text-left px-3 py-2.5 font-medium">Product</th>
              <th className="text-right px-3 py-2.5 font-medium">Qty Sold</th>
              <th className="text-right px-3 py-2.5 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((product, idx) => (
              <tr
                key={product.product_id}
                className="border-t border-border even:bg-surface/50 hover:bg-primary-50/30 transition-colors"
              >
                <td className="px-3 py-2.5">
                  {idx < 3 ? (
                    <span className="text-base">{medals[idx]}</span>
                  ) : (
                    <span className="text-text-muted text-xs font-medium">#{idx + 1}</span>
                  )}
                </td>
                <td className="px-3 py-2.5 font-medium text-text-primary">
                  {product.product_name}
                </td>
                <td className="px-3 py-2.5 text-right text-text-muted">
                  {product.quantity_sold}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-primary">
                  {formatINR(product.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
