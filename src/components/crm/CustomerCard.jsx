import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, ShoppingBag, StickyNote, Edit2, Trash2 } from "lucide-react";

const segmentConfig = {
  new:      { label: "I Ri",        color: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  loyal:    { label: "Besnik",      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  vip:      { label: "VIP",         color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  inactive: { label: "Joaktiv",     color: "bg-slate-600/30 text-slate-400 border-slate-600/30" },
  prospect: { label: "Perspektivë", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
};

export default function CustomerCard({ customer, onClick, onEdit, onDelete }) {
  const seg = segmentConfig[customer.segment] || segmentConfig.new;
  const initials = customer.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const avatarColor = customer.avatar_color || "#f59e0b";

  return (
    <div
      onClick={onClick}
      className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 hover:border-amber-500/30 hover:bg-slate-800/50 transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: avatarColor + "33", border: `2px solid ${avatarColor}55` }}
        >
          <span style={{ color: avatarColor }}>{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold text-sm truncate">{customer.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${seg.color}`}>
              {seg.label}
            </span>
          </div>
          {customer.email && (
            <p className="text-slate-500 text-xs flex items-center gap-1 truncate">
              <Mail className="w-3 h-3 flex-shrink-0" /> {customer.email}
            </p>
          )}
          {customer.phone && (
            <p className="text-slate-500 text-xs flex items-center gap-1">
              <Phone className="w-3 h-3 flex-shrink-0" /> {customer.phone}
            </p>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-500 hover:text-amber-400" onClick={() => onEdit(customer)}>
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-500 hover:text-red-400" onClick={() => onDelete(customer.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700/30">
        <div className="flex items-center gap-1.5">
          <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400 text-xs">{customer.order_count || 0} porosi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-xs">ALL</span>
          <span className="text-emerald-400 text-xs font-medium">{(customer.total_spent || 0).toLocaleString()}</span>
        </div>
        {customer.city && (
          <div className="flex items-center gap-1.5 ml-auto">
            <MapPin className="w-3 h-3 text-slate-500" />
            <span className="text-slate-500 text-xs">{customer.city}</span>
          </div>
        )}
      </div>

      {customer.notes && (
        <div className="mt-3 flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2">
          <StickyNote className="w-3 h-3 text-amber-400/60 mt-0.5 flex-shrink-0" />
          <p className="text-amber-300/70 text-xs line-clamp-2">{customer.notes}</p>
        </div>
      )}
    </div>
  );
}