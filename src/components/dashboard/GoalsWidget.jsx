import React, { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const defaultGoals = [
  { id: 1, label: "Porosi mujore", current: 0, target: 100, unit: "porosi", color: "bg-emerald-500" },
  { id: 2, label: "Të ardhura mujore", current: 0, target: 500000, unit: "ALL", color: "bg-amber-500" },
  { id: 3, label: "Postime sociale", current: 0, target: 30, unit: "postime", color: "bg-sky-500" },
];

export default function GoalsWidget({ orders, posts }) {
  const thisMonthOrders = orders.filter(o => {
    const d = new Date(o.created_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const thisMonthRevenue = thisMonthOrders
    .filter(o => o.payment_status === "paid")
    .reduce((s, o) => s + (o.total_amount || 0), 0);

  const thisMonthPosts = posts.filter(p => {
    const d = new Date(p.created_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const goals = [
    { ...defaultGoals[0], current: thisMonthOrders.length },
    { ...defaultGoals[1], current: thisMonthRevenue },
    { ...defaultGoals[2], current: thisMonthPosts },
  ];

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4 text-amber-400" />
        <h3 className="text-white font-semibold text-sm">Objektivat Mujore</h3>
      </div>
      <div className="space-y-4">
        {goals.map(goal => {
          const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return (
            <div key={goal.id}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-400 text-xs">{goal.label}</span>
                <span className="text-white text-xs font-medium">
                  {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
                </span>
              </div>
              <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${goal.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className={`text-[10px] mt-1 ${pct >= 100 ? "text-emerald-400" : "text-slate-600"}`}>
                {pct >= 100 ? "✓ Arritur!" : `${pct}% arritur`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}