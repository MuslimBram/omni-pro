import React from "react";
import { TrendingUp } from "lucide-react";

export default function TopProducts({ orders = [], products = [] }) {
  // Count sold quantities per product
  const sold = {};
  orders.forEach(order => {
    (order.items || []).forEach(item => {
      sold[item.product_name] = (sold[item.product_name] || 0) + (item.quantity || 0);
    });
  });

  const top = Object.entries(sold)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const max = top[0]?.[1] || 1;

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-amber-400" /> Produktet Më të Shitura
      </h3>
      <p className="text-slate-500 text-sm mb-5">Bazuar në porositë ekzistuese</p>
      {top.length === 0 ? (
        <p className="text-slate-600 text-sm text-center py-8">Nuk ka të dhëna akoma</p>
      ) : (
        <div className="space-y-4">
          {top.map(([name, qty], i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-300 truncate">{name}</span>
                <span className="text-slate-500 ml-2 flex-shrink-0">{qty} cop.</span>
              </div>
              <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                  style={{ width: `${(qty / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}