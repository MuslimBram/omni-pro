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
    </div>
  );
}