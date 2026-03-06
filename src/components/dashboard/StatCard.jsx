import React from "react";
import { cn } from "@/lib/utils";

export default function StatCard({ title, value, subtitle, icon: Icon, color = "amber", trend }) {
  const colors = {
    amber: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/20",
    emerald: "from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/20",
    sky: "from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/20",
    purple: "from-purple-500/20 to-violet-500/20 text-purple-400 border-purple-500/20",
    rose: "from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/20",
  };

  const iconBg = {
    amber: "bg-amber-500/10 text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    sky: "bg-sky-500/10 text-sky-400",
    purple: "bg-purple-500/10 text-purple-400",
    rose: "bg-rose-500/10 text-rose-400",
  };

  return (
    <div className={cn(
      "bg-gradient-to-br border rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]",
      colors[color]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
          {trend && (
            <p className={cn("text-xs mt-2 font-medium", trend > 0 ? "text-emerald-400" : "text-rose-400")}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% nga muaji i kaluar
            </p>
          )}
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", iconBg[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}