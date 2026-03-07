import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { ShoppingBag, Mail, Phone, MapPin, StickyNote, Save, Package, Calendar } from "lucide-react";
import { format } from "date-fns";

const segmentConfig = {
  new:      { label: "I Ri",        color: "bg-sky-500/10 text-sky-400" },
  loyal:    { label: "Besnik",      color: "bg-emerald-500/10 text-emerald-400" },
  vip:      { label: "VIP",         color: "bg-amber-500/10 text-amber-400" },
  inactive: { label: "Joaktiv",     color: "bg-slate-600/30 text-slate-400" },
  prospect: { label: "Perspektivë", color: "bg-purple-500/10 text-purple-400" },
};

export default function CustomerDetailModal({ customer, orders, onClose, onRefresh }) {
  const [notes, setNotes] = useState(customer?.notes || "");
  const [saving, setSaving] = useState(false);

  if (!customer) return null;

  const customerOrders = orders.filter(o =>
    o.customer_email === customer.email ||
    o.customer_name?.toLowerCase() === customer.name?.toLowerCase()
  );

  const seg = segmentConfig[customer.segment] || segmentConfig.new;
  const initials = customer.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const avatarColor = customer.avatar_color || "#f59e0b";

  const saveNotes = async () => {
    setSaving(true);
    await base44.entities.Customer.update(customer.id, { notes });
    toast.success("Shënimet u ruajtën!");
    onRefresh?.();
    setSaving(false);
  };

  return (
    <Dialog open={!!customer} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: avatarColor + "33", color: avatarColor }}
            >
              {initials}
            </div>
            <div>
              <p className="text-white font-semibold">{customer.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${seg.color}`}>{seg.label}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-3">
            {customer.email && (
              <div className="flex items-center gap-2 bg-slate-800/40 rounded-lg px-3 py-2.5">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="text-slate-300 text-sm truncate">{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-2 bg-slate-800/40 rounded-lg px-3 py-2.5">
                <Phone className="w-4 h-4 text-slate-500" />
                <span className="text-slate-300 text-sm">{customer.phone}</span>
              </div>
            )}
            {customer.city && (
              <div className="flex items-center gap-2 bg-slate-800/40 rounded-lg px-3 py-2.5">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span className="text-slate-300 text-sm">{customer.city}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-slate-800/40 rounded-lg px-3 py-2.5">
              <ShoppingBag className="w-4 h-4 text-slate-500" />
              <span className="text-slate-300 text-sm">{customer.order_count || 0} porosi • ALL {(customer.total_spent || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Order History */}
          <div>
            <h4 className="text-slate-300 text-sm font-medium mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" /> Historiku i Blerjeve ({customerOrders.length})
            </h4>
            {customerOrders.length === 0 ? (
              <p className="text-slate-600 text-sm text-center py-4 bg-slate-800/20 rounded-xl">Nuk ka porosi të regjistruara</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {customerOrders.map(o => (
                  <div key={o.id} className="flex items-center justify-between bg-slate-800/30 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-white text-sm font-medium">{o.order_number || `#${o.id?.slice(0,6)}`}</p>
                      <p className="text-slate-500 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {o.created_date ? format(new Date(o.created_date), "dd MMM yyyy") : "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 text-sm font-medium">ALL {(o.total_amount || 0).toLocaleString()}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        o.status === "delivered" ? "bg-emerald-500/10 text-emerald-400" :
                        o.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                        "bg-slate-700 text-slate-400"
                      }`}>{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Private Notes */}
          <div>
            <h4 className="text-slate-300 text-sm font-medium mb-2 flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-amber-400" /> Shënime Private
            </h4>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Shto shënime private për këtë klient..."
              className="bg-slate-800 border-slate-700 text-white min-h-[80px]"
              rows={3}
            />
            <Button onClick={saveNotes} disabled={saving} size="sm" className="mt-2 bg-amber-600 hover:bg-amber-700">
              <Save className="w-3.5 h-3.5 mr-1.5" /> Ruaj Shënimet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}