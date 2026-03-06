import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function NewOrderForm({ products, onSave, onCancel }) {
  const [form, setForm] = useState({
    customer_name: "", customer_email: "", customer_phone: "",
    shipping_address: "", city: "", notes: "",
    payment_method: "cash_on_delivery", payment_status: "unpaid",
  });
  const [items, setItems] = useState([{ product_id: "", product_name: "", quantity: 1, unit_price: 0, total: 0 }]);
  const [saving, setSaving] = useState(false);

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "product_id") {
      const product = products.find(p => p.id === value);
      if (product) {
        updated[index].product_name = product.name;
        updated[index].unit_price = product.price;
        updated[index].total = product.price * updated[index].quantity;
      }
    }
    if (field === "quantity" || field === "unit_price") {
      updated[index].total = updated[index].quantity * updated[index].unit_price;
    }
    setItems(updated);
  };

  const addItem = () => setItems([...items, { product_id: "", product_name: "", quantity: 1, unit_price: 0, total: 0 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, i) => s + (i.total || 0), 0);
  const shipping = 500;

  const handleSave = async () => {
    if (!form.customer_name || items.length === 0) return;
    setSaving(true);
    const orderNum = "ORD-" + Date.now().toString().slice(-6);
    await base44.entities.Order.create({
      ...form,
      order_number: orderNum,
      items,
      subtotal,
      shipping_cost: shipping,
      total_amount: subtotal + shipping,
    });
    setSaving(false);
    toast.success("Porosia u krijua!");
    onSave?.();
  };

  return (
    <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Emri i Klientit *</Label>
          <Input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Telefon</Label>
          <Input value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Email</Label>
          <Input value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Qyteti</Label>
          <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-slate-300 text-xs">Adresa</Label>
          <Input value={form.shipping_address} onChange={e => setForm({ ...form, shipping_address: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Mënyra e Pagesës</Label>
          <Select value={form.payment_method} onValueChange={v => setForm({ ...form, payment_method: v })}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="cash_on_delivery" className="text-white focus:bg-slate-700">Para në dorëzim</SelectItem>
              <SelectItem value="bank_transfer" className="text-white focus:bg-slate-700">Transfer bankar</SelectItem>
              <SelectItem value="card" className="text-white focus:bg-slate-700">Kartë</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Statusi Pagesës</Label>
          <Select value={form.payment_status} onValueChange={v => setForm({ ...form, payment_status: v })}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="unpaid" className="text-white focus:bg-slate-700">Pa paguar</SelectItem>
              <SelectItem value="paid" className="text-white focus:bg-slate-700">Paguar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-slate-300 text-xs">Artikujt *</Label>
          <Button variant="ghost" size="sm" onClick={addItem} className="text-emerald-400 hover:text-emerald-300 h-7 text-xs">
            <Plus className="w-3 h-3 mr-1" /> Shto Artikull
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center bg-slate-800/40 rounded-lg p-2">
              <div className="col-span-5">
                <Select value={item.product_id} onValueChange={v => updateItem(i, "product_id", v)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-8 text-xs"><SelectValue placeholder="Produkti" /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {products.map(p => <SelectItem key={p.id} value={p.id} className="text-white focus:bg-slate-700 text-xs">{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, "quantity", parseInt(e.target.value) || 1)} className="bg-slate-800 border-slate-700 text-white h-8 text-xs" />
              </div>
              <div className="col-span-2">
                <Input type="number" value={item.unit_price} onChange={e => updateItem(i, "unit_price", parseFloat(e.target.value) || 0)} className="bg-slate-800 border-slate-700 text-white h-8 text-xs" />
              </div>
              <div className="col-span-2 text-right">
                <span className="text-emerald-400 text-xs font-medium">{item.total?.toLocaleString()} ALL</span>
              </div>
              <div className="col-span-1 flex justify-end">
                {items.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeItem(i)} className="h-7 w-7 text-slate-500 hover:text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-300 text-xs">Shënime</Label>
        <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="bg-slate-800 border-slate-700 text-white" />
      </div>

      {/* Total */}
      <div className="bg-slate-800/50 rounded-xl p-3 space-y-1 text-sm">
        <div className="flex justify-between text-slate-400"><span>Nëntotal</span><span>{subtotal.toLocaleString()} ALL</span></div>
        <div className="flex justify-between text-slate-400"><span>Transport</span><span>{shipping.toLocaleString()} ALL</span></div>
        <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-700"><span>Total</span><span className="text-emerald-400">{(subtotal + shipping).toLocaleString()} ALL</span></div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="border-slate-600 text-slate-300 hover:bg-slate-700 flex-1">Anulo</Button>
        <Button onClick={handleSave} disabled={!form.customer_name || saving} className="bg-emerald-600 hover:bg-emerald-700 flex-1">
          Krijo Porosinë
        </Button>
      </div>
    </div>
  );
}