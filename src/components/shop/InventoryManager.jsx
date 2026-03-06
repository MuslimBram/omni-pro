import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, Minus, Package } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function InventoryManager({ products, onRefresh }) {
  const [adjusting, setAdjusting] = useState(null);
  const [delta, setDelta] = useState("");

  const lowStock = products.filter(p => p.stock_quantity <= (p.min_stock_alert || 10));
  const outOfStock = products.filter(p => p.stock_quantity === 0);

  const adjust = async (product, amount) => {
    const newQty = Math.max(0, (product.stock_quantity || 0) + amount);
    await base44.entities.Product.update(product.id, { stock_quantity: newQty });
    onRefresh?.();
    toast.success(`Stoku u përditësua: ${newQty}`);
    setAdjusting(null);
    setDelta("");
  };

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {outOfStock.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-300 text-sm font-medium">{outOfStock.length} produkte janë mbaruar</p>
            <p className="text-red-400/60 text-xs">{outOfStock.map(p => p.name).join(", ")}</p>
          </div>
        </div>
      )}
      {lowStock.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-amber-300 text-sm font-medium">{lowStock.length} produkte kanë stok të ulët</p>
            <p className="text-amber-400/60 text-xs">{lowStock.map(p => `${p.name} (${p.stock_quantity})`).join(", ")}</p>
          </div>
        </div>
      )}

      {/* Full product inventory table */}
      <div className="bg-slate-800/20 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-5 gap-2 px-4 py-2 text-xs text-slate-500 border-b border-slate-700/50">
          <span className="col-span-2">Produkti</span>
          <span className="text-center">Stoku</span>
          <span className="text-center">Alert</span>
          <span className="text-center">Veprime</span>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-10 text-slate-600 text-sm">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Nuk ka produkte
          </div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {products.map(product => {
              const isLow = product.stock_quantity <= (product.min_stock_alert || 10);
              const isOut = product.stock_quantity === 0;
              return (
                <div key={product.id} className="grid grid-cols-5 gap-2 px-4 py-3 items-center">
                  <div className="col-span-2">
                    <p className="text-white text-sm font-medium truncate">{product.name}</p>
                    <p className="text-slate-600 text-xs">{product.sku || "—"}</p>
                  </div>
                  <div className="text-center">
                    <span className={cn(
                      "text-sm font-bold",
                      isOut ? "text-red-400" : isLow ? "text-amber-400" : "text-white"
                    )}>
                      {product.stock_quantity || 0}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-500 text-xs">{product.min_stock_alert || 10}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    {adjusting === product.id ? (
                      <>
                        <Input
                          type="number"
                          value={delta}
                          onChange={e => setDelta(e.target.value)}
                          className="h-7 w-16 text-xs bg-slate-800 border-slate-700 text-white p-1"
                          placeholder="±qty"
                          autoFocus
                        />
                        <Button size="icon" className="h-7 w-7 bg-emerald-600 hover:bg-emerald-700" onClick={() => adjust(product, parseInt(delta) || 0)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500" onClick={() => setAdjusting(null)}>
                          ✕
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-red-400" onClick={() => adjust(product, -1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:text-emerald-400" onClick={() => adjust(product, 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500 hover:text-white px-2" onClick={() => { setAdjusting(product.id); setDelta(""); }}>
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}