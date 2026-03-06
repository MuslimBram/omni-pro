import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles, ShoppingBag, HeadphonesIcon, Zap, Globe2 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import ActivityChart from "@/components/dashboard/ActivityChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import SalesChart from "@/components/dashboard/SalesChart";
import TopProducts from "@/components/dashboard/TopProducts";
import GoalsWidget from "@/components/dashboard/GoalsWidget";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const quickActions = [
  { label: "Krijo Post", icon: Sparkles, page: "SocialMedia", color: "from-amber-500 to-orange-500" },
  { label: "Shto Produkt", icon: ShoppingBag, page: "ShopManager", color: "from-emerald-500 to-green-500" },
  { label: "Hajj VR", icon: Globe2, page: "HajjVR", color: "from-sky-500 to-blue-500" },
  { label: "Automatizo", icon: Zap, page: "Automations", color: "from-purple-500 to-violet-500" },
];

export default function Dashboard() {
  const { data: posts = [] } = useQuery({
    queryKey: ["posts"],
    queryFn: () => base44.entities.SocialPost.list("-created_date", 50),
  });
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => base44.entities.Order.list("-created_date", 50),
  });
  const { data: tickets = [] } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => base44.entities.SupportTicket.list("-created_date", 50),
  });
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => base44.entities.Product.list("-created_date", 50),
  });
  const { data: automations = [] } = useQuery({
    queryKey: ["automations"],
    queryFn: () => base44.entities.Automation.list("-created_date", 50),
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const activeAutomations = automations.filter(a => a.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.page}
            to={createPageUrl(action.page)}
            className="group relative overflow-hidden rounded-2xl p-4 bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            <action.icon className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors mb-2" />
            <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
              {action.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Postime Sociale" value={posts.length} icon={Sparkles} color="amber" trend={12} />
        <StatCard title="Porosi Totale" value={orders.length} icon={ShoppingBag} color="emerald" trend={8} subtitle={`${totalRevenue.toLocaleString()} ALL total`} />
        <StatCard title="Tiketa Suporti" value={tickets.length} icon={HeadphonesIcon} color="sky" trend={-5} />
        <StatCard title="Automatizime" value={activeAutomations} icon={Zap} color="purple" subtitle={`${automations.length} total`} />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>
        <div>
          <RecentActivity posts={posts} orders={orders} tickets={tickets} />
        </div>
      </div>

      {/* Sales Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart orders={orders} />
        </div>
        <div>
          <TopProducts orders={orders} products={products} />
        </div>
      </div>

      {/* Goals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <GoalsWidget orders={orders} posts={posts} />
        </div>
        <div className="lg:col-span-2 bg-slate-800/20 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <HeadphonesIcon className="w-4 h-4 text-sky-400" /> Tiketa të fundit
          </h3>
          <div className="space-y-2">
            {tickets.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center gap-3 py-2 border-b border-slate-700/30 last:border-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.priority === "urgent" ? "bg-red-400" : t.priority === "high" ? "bg-amber-400" : "bg-slate-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{t.subject}</p>
                  <p className="text-slate-600 text-xs">{t.customer_name}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.status === "resolved" ? "bg-emerald-500/10 text-emerald-400" : t.status === "open" ? "bg-sky-500/10 text-sky-400" : "bg-slate-700 text-slate-400"}`}>
                  {t.status}
                </span>
              </div>
            ))}
            {tickets.length === 0 && <p className="text-slate-600 text-sm text-center py-6">Nuk ka tiketa</p>}
          </div>
        </div>
      </div>
    </div>
  );
}