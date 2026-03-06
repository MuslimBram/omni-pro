import React, { useState, useEffect } from "react";
import { Bell, Search, User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TopBar({ pageTitle }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h1 className="text-white font-semibold text-lg">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">
          <Search className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-slate-900" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-all">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm text-slate-300 hidden sm:block">
                {user?.full_name || "User"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-900 border-slate-700">
            <DropdownMenuItem className="text-slate-300 focus:text-white focus:bg-slate-800">
              Profili
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-400 focus:text-red-300 focus:bg-slate-800"
              onClick={() => base44.auth.logout()}
            >
              Dil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}