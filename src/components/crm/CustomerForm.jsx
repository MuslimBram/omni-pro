import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const AVATAR_COLORS = ["#f59e0b","#10b981","#3b82f6","#8b5cf6","#ec4899","#06b6d4","#f97316"];

export default function CustomerForm({ customer, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    city: customer?.city || "",
    segment: customer?.segment || "new",
    notes: customer?.notes || "",
    avatar_color: customer?.avatar_color || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name.trim()) return toast.error("Emri është i detyrueshëm");
    setSaving(true);
    if (customer?.id) {
      await base44.entities.Customer.update(customer.id, form);
      toast.success("Klienti u përditësua!");
    } else {
      await base44.entities.Customer.create(form);
      toast.success("Klienti u shtua!");
    }
    onSaved?.();
    onClose();
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>{customer ? "Edito Klientin" : "Shto Klient të Ri"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-slate-400 text-xs">Emri *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-slate-800 border-slate-700 text-white" placeholder="Emri mbiemri" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Email</Label>
              <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="bg-slate-800 border-slate-700 text-white" placeholder="email@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Telefon</Label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="bg-slate-800 border-slate-700 text-white" placeholder="+355..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Qyteti</Label>
              <Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="bg-slate-800 border-slate-700 text-white" placeholder="Tiranë..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Segmenti</Label>
              <Select value={form.segment} onValueChange={v => setForm({...form, segment: v})}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="new" className="text-white focus:bg-slate-700">I Ri</SelectItem>
                  <SelectItem value="loyal" className="text-white focus:bg-slate-700">Besnik</SelectItem>
                  <SelectItem value="vip" className="text-white focus:bg-slate-700">VIP</SelectItem>
                  <SelectItem value="inactive" className="text-white focus:bg-slate-700">Joaktiv</SelectItem>
                  <SelectItem value="prospect" className="text-white focus:bg-slate-700">Perspektivë</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-400 text-xs">Shënime Private</Label>
            <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="bg-slate-800 border-slate-700 text-white" placeholder="Shënime..." rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-400 text-xs">Ngjyra Avatar</Label>
            <div className="flex gap-2">
              {AVATAR_COLORS.map(c => (
                <button key={c} onClick={() => setForm({...form, avatar_color: c})}
                  className={`w-7 h-7 rounded-full transition-all ${form.avatar_color === c ? "ring-2 ring-white scale-110" : ""}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 border-slate-600 text-slate-300">Anulo</Button>
            <Button onClick={save} disabled={saving} className="flex-1 bg-amber-600 hover:bg-amber-700">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Ruaj
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}