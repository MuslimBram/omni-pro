import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { toast } from "sonner";
import { Package, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors = {
  pending: "bg-amber-500/10 text-amber-400",
  confirmed: "bg-sky-500/10 text-sky-400",
  processing: "bg-purple-500/10 text-purple-400",
  shipped: "bg-indigo-500/10 text-indigo-400",
  delivered: "bg-emerald-500/10 text-emerald-400",
  cancelled: "bg-red-500/10 text-red-400",
  returned: "bg-rose-500/10 text-rose-400",
};

const statusLabels = {
  pending: "Në pritje", confirmed: "Konfirmuar", processing: "Përpunim",
  shipped: "Dërguar", delivered: "Dorëzuar", cancelled: "Anuluar", returned: "Kthyer",
};

export default function OrderList({ orders, onRefresh, onViewOrder }) {
  const updateStatus = async (orderId, status) => {
    await base44.entities.Order.update(orderId, { status });
    onRefresh?.();
    toast.success("Statusi u përditësua!");
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-12 h-12 text-slate-700 mx-auto mb-3" />
        <p className="text-slate-500">Nuk ka porosi ende</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {orders.map(order => (
        <div key={order.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-medium text-sm">#{order.order_number || order.id?.slice(0, 8)}</span>
                <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                <Badge className={order.payment_status === "paid" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}>
                  {order.payment_status === "paid" ? "Paguar" : "Pa paguar"}
                </Badge>
              </div>
              <p className="text-slate-400 text-xs">{order.customer_name} • {order.city || "—"}</p>
              <p className="text-slate-600 text-xs mt-0.5">
                {order.items?.length || 0} produkte • {order.total_amount?.toLocaleString()} ALL
                {order.created_date && ` • ${format(new Date(order.created_date), "dd/MM/yyyy")}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(statusLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-white focus:bg-slate-700 text-xs">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white" onClick={() => onViewOrder?.(order)}>
                <Eye className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}