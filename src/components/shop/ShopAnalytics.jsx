import React, { useMemo } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subMonths, startOfMonth } from "date-fns";
import { TrendingUp, ShoppingBag, CreditCard, RotateCcw } from "lucide-react";

const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#f43f5e", "#06b6d4", "#84cc16"];

function CustomTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {typeof p.value === "number" && p.name !== "Porosi" ? p.value.toLocaleString() + " ALL" : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function ShopAnalytics({ orders, products }) {
  const last6Months = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const label = format(d, "MMM");
      const start = startOfMonth(d).getTime();
      const end = startOfMonth(subMonths(d, -1)).getTime();
      const monthOrders = orders.filter(o => {
        const t = new Date(o.created_date).getTime();
        return t >= start && t < end;
      });
      months.push({
        month: label,
        revenue: monthOrders.filter(o => o.payment_status === "paid").reduce((s, o) => s + (o.total_amount || 0), 0),
        orders: monthOrders.length,
      });
    }
    return months;
  }, [orders]);

  const byStatus = useMemo(() => {
    const map = {};
    orders.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const byCategory = useMemo(() => {
    const map = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        const prod = products.find(p => p.id === item.product_id);
        const cat = prod?.category || "other";
        map[cat] = (map[cat] || 0) + (item.total || 0);
      });
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [orders, products]);

  const totalRevenue = orders.filter(o => o.payment_status === "paid").reduce((s, o) => s + (o.total_amount || 0), 0);
  const pendingRevenue = orders.filter(o => o.payment_status !== "paid" && o.status !== "cancelled").reduce((s, o) => s + (o.total_amount || 0), 0);
  const returnedOrders = orders.filter(o => o.status === "returned").length;
  const avgOrder = orders.length > 0 ? Math.round(totalRevenue / (orders.filter(o => o.payment_status === "paid").length || 1)) : 0;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Të ardhura totale", value: totalRevenue.toLocaleString() + " ALL", icon: TrendingUp, color: "text-emerald-400" },
          { label: "Në pritje pagese", value: pendingRevenue.toLocaleString() + " ALL", icon: CreditCard, color: "text-amber-400" },
          { label: "Vlera mesatare", value: avgOrder.toLocaleString() + " ALL", icon: ShoppingBag, color: "text-sky-400" },
          { label: "Kthime", value: returnedOrders, icon: RotateCcw, color: "text-rose-400" },
        ].map((kpi, i) => (
          <div key={i} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              <p className="text-slate-500 text-xs">{kpi.label}</p>
            </div>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue & Orders chart */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
        <h4 className="text-white font-medium text-sm mb-4">Të ardhurat & Porositë (6 muajt e fundit)</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={last6Months} barGap={4}>
            <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" name="Të ardhura" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="orders" name="Porosi" fill="#f59e0b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Status breakdown + Category breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
          <h4 className="text-white font-medium text-sm mb-4">Porosi sipas statusit</h4>
          {byStatus.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-8">Nuk ka porosi</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3} nameKey="name">
                  {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {byStatus.map((s, i) => (
              <span key={i} className="flex items-center gap-1 text-xs text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
          <h4 className="text-white font-medium text-sm mb-4">Të ardhura sipas kategorisë</h4>
          {byCategory.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-8">Nuk ka të dhëna</p>
          ) : (
            <div className="space-y-2.5 mt-2">
              {byCategory.sort((a, b) => b.value - a.value).map((cat, i) => {
                const max = Math.max(...byCategory.map(c => c.value));
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 capitalize">{cat.name}</span>
                      <span className="text-white font-medium">{cat.value.toLocaleString()} ALL</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(cat.value / max) * 100}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}