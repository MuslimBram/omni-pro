import React from "react";
import { Sparkles, ShoppingBag, HeadphonesIcon, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const iconMap = {
  post: { icon: Sparkles, color: "text-amber-400 bg-amber-500/10" },
  order: { icon: ShoppingBag, color: "text-emerald-400 bg-emerald-500/10" },
  ticket: { icon: HeadphonesIcon, color: "text-sky-400 bg-sky-500/10" },
  automation: { icon: Zap, color: "text-purple-400 bg-purple-500/10" },
};

export default function RecentActivity({ posts = [], orders = [], tickets = [] }) {
  const activities = [
    ...posts.slice(0, 3).map(p => ({
      type: "post",
      title: p.title || "Post i ri",
      subtitle: p.platform,
      time: p.created_date,
    })),
    ...orders.slice(0, 3).map(o => ({
      type: "order",
      title: `Porosi #${o.order_number || o.id?.slice(0, 6)}`,
      subtitle: `${o.total_amount?.toFixed(0) || 0} ALL`,
      time: o.created_date,
    })),
    ...tickets.slice(0, 3).map(t => ({
      type: "ticket",
      title: t.subject || "Tiketë",
      subtitle: t.status,
      time: t.created_date,
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-1">Aktiviteti i Fundit</h3>
      <p className="text-slate-500 text-sm mb-4">Veprimet e fundit në platformë</p>

      {activities.length === 0 ? (
        <p className="text-slate-600 text-sm text-center py-8">Nuk ka aktivitet ende</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, i) => {
            const { icon: Icon, color } = iconMap[activity.type];
            return (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-all">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{activity.title}</p>
                  <p className="text-xs text-slate-500 capitalize">{activity.subtitle}</p>
                </div>
                <span className="text-xs text-slate-600 flex-shrink-0">
                  {activity.time ? format(new Date(activity.time), "HH:mm") : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}