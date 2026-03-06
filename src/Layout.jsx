import React, { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import { cn } from "@/lib/utils";

const pageTitles = {
  Dashboard: "Dashboard",
  SocialMedia: "Social Media AI Generator",
  Automations: "Automatizime Biznesi",
  CustomerSupport: "Customer Support AI",
  HajjVR: "Hajj VR Platform",
  ShopManager: "Shop Manager - SmileShop.al",
  Settings: "Cilësimet",
};

export default function Layout({ children, currentPageName }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900">
      <style>{`
        :root {
          --sidebar-width: ${collapsed ? "72px" : "260px"};
        }
        body {
          background-color: #0f172a;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
      <Sidebar
        currentPage={currentPageName}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "ml-[72px]" : "ml-[260px]"
        )}
      >
        <TopBar pageTitle={pageTitles[currentPageName] || currentPageName} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}