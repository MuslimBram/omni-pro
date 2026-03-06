import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Sparkles,
  Zap,
  HeadphonesIcon,
  Globe2,
  ShoppingBag,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Social Media AI", icon: Sparkles, page: "SocialMedia" },
  { name: "Automatizime", icon: Zap, page: "Automations" },
  { name: "Support AI", icon: HeadphonesIcon, page: "CustomerSupport" },
  { name: "Hajj VR", icon: Globe2, page: "HajjVR" },
  { name: "Shop Manager", icon: ShoppingBag, page: "ShopManager" },
  { name: "Cilësimet", icon: Settings, page: "Settings" },
];

export default function Sidebar({ currentPage, collapsed, setCollapsed }) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-slate-950 border-r border-slate-800/50 z-50 transition-all duration-300 flex flex-col",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Moon className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-white font-semibold text-lg tracking-tight whitespace-nowrap">
              SmileHub
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-amber-500/10 text-amber-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-amber-400")} />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-slate-800/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all w-full"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Mbyll</span>
            </>
          )}
        </button>
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-800/50 transition-all w-full mt-1"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm">Dil</span>}
        </button>
      </div>
    </aside>
  );
}