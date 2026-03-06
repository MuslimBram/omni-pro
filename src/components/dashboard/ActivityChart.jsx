import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", posts: 12, orders: 35, tickets: 8 },
  { name: "Shk", posts: 19, orders: 42, tickets: 12 },
  { name: "Mar", posts: 28, orders: 58, tickets: 6 },
  { name: "Pri", posts: 35, orders: 67, tickets: 15 },
  { name: "Maj", posts: 42, orders: 75, tickets: 9 },
  { name: "Qer", posts: 48, orders: 82, tickets: 11 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl">
        <p className="text-slate-300 text-xs font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ActivityChart() {
  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-1">Aktiviteti</h3>
      <p className="text-slate-500 text-sm mb-6">Pasqyrë e 6 muajve të fundit</p>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="posts" stroke="#f59e0b" fill="url(#colorPosts)" strokeWidth={2} name="Postime" />
          <Area type="monotone" dataKey="orders" stroke="#10b981" fill="url(#colorOrders)" strokeWidth={2} name="Porosi" />
          <Area type="monotone" dataKey="tickets" stroke="#38bdf8" fill="url(#colorTickets)" strokeWidth={2} name="Tiketa" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}