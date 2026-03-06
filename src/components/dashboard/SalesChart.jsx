import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl">
        <p className="text-slate-300 text-xs font-medium mb-1">{label}</p>
        <p className="text-emerald-400 text-sm font-bold">{payload[0]?.value?.toLocaleString()} ALL</p>
      </div>
    );
  }
  return null;
};

export default function SalesChart({ orders = [] }) {
  // Group orders by month
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthStr = d.toLocaleString("sq-AL", { month: "short" });
    const monthOrders = orders.filter(o => {
      if (!o.created_date) return false;
      const od = new Date(o.created_date);
      return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
    });
    return {
      name: monthStr,
      revenue: monthOrders.filter(o => o.payment_status === "paid").reduce((s, o) => s + (o.total_amount || 0), 0),
      orders: monthOrders.length,
    };
  });

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-1">Shitjet Mujore</h3>
      <p className="text-slate-500 text-sm mb-6">Të ardhurat 6 muajt e fundit</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={monthlyData} barSize={28}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={v => v > 999 ? `${(v/1000).toFixed(0)}K` : v} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="#10b981">
            {monthlyData.map((entry, index) => (
              <Cell key={index} fill={index === monthlyData.length - 1 ? "#f59e0b" : "#10b981"} opacity={index === monthlyData.length - 1 ? 1 : 0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}