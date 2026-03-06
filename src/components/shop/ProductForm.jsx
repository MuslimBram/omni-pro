import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const categories = [
  { value: "dental_care", label: "Kujdes Dental" },
  { value: "oral_hygiene", label: "Higjenë Orale" },
  { value: "whitening", label: "Zbardhim" },
  { value: "accessories", label: "Aksesorë" },
  { value: "kids", label: "Fëmijë" },
  { value: "professional", label: "Profesional" },
  { value: "other", label: "Tjetër" },
];

export default function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState(product || {
    name: "", description: "", price: "", cost_price: "", sku: "",
    category: "dental_care", stock_quantity: 0, min_stock_alert: 10,
    brand: "", weight: "", status: "active",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const data = {
      ...form,
      price: parseFloat(form.price) || 0,
      cost_price: parseFloat(form.cost_price) || 0,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      min_stock_alert: parseInt(form.min_stock_alert) || 10,
      weight: parseFloat(form.weight) || 0,
    };

    if (product?.id) {
      await base44.entities.Product.update(product.id, data);
    } else {
      await base44.entities.Product.create(data);
    }
    setSaving(false);
    toast.success(product?.id ? "Produkti u përditësua!" : "Produkti u shtua!");
    onSave?.();
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Emri</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">SKU</Label>
          <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Çmimi (ALL)</Label>
          <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Çmimi i Kostos (ALL)</Label>
          <Input type="number" value={form.cost_price} onChange={(e) => set("cost_price", e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Kategoria</Label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {categories.map(c => <SelectItem key={c.value} value={c.value} className="text-white focus:bg-slate-700">{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Brand</Label>
          <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Sasia në Stok</Label>
          <Input type="number" value={form.stock_quantity} onChange={(e) => set("stock_quantity", e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Alert Stoku Min</Label>
          <Input type="number" value={form.min_stock_alert} onChange={(e) => set("min_stock_alert", e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-slate-300 text-xs">Përshkrimi</Label>
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="bg-slate-800 border-slate-700 text-white" />
      </div>
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel} className="border-slate-600 text-slate-300 hover:bg-slate-700">Anulo</Button>
        <Button onClick={handleSave} disabled={!form.name || saving} className="bg-emerald-600 hover:bg-emerald-700">
          {product?.id ? "Përditëso" : "Shto Produktin"}
        </Button>
      </div>
    </div>
  );
}