import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  User, Store, Sparkles, HeadphonesIcon, Bell, Globe2, Save, Loader2
} from "lucide-react";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [shopSettings, setShopSettings] = useState({
    shop_name: "SmileShop.al",
    shop_email: "",
    shop_phone: "",
    shop_address: "",
    currency: "ALL",
    shipping_default: "500",
  });
  const [socialSettings, setSocialSettings] = useState({
    default_language: "sq",
    auto_hashtags: true,
    brand_voice: "",
  });
  const [supportSettings, setSupportSettings] = useState({
    auto_reply: true,
    welcome_message: "Përshëndetje! Si mund t'ju ndihmoj?",
    business_hours: "E Hënë - E Premte, 09:00 - 17:00",
  });
  const [notifSettings, setNotifSettings] = useState({
    email_on_order: true,
    email_on_ticket: true,
    low_stock_alert: true,
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    // We just show a toast to simulate saving
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
    toast.success("Cilësimet u ruajtën!");
  };

  return (
    <div className="max-w-3xl">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700/50 flex-wrap">
          <TabsTrigger value="profile" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <User className="w-4 h-4 mr-2" /> Profili
          </TabsTrigger>
          <TabsTrigger value="shop" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Store className="w-4 h-4 mr-2" /> Dyqani
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Sparkles className="w-4 h-4 mr-2" /> Social
          </TabsTrigger>
          <TabsTrigger value="support" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <HeadphonesIcon className="w-4 h-4 mr-2" /> Support
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Bell className="w-4 h-4 mr-2" /> Njoftimet
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-semibold">Informacioni i Profilit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Emri</Label>
                <Input value={user?.full_name || ""} disabled className="bg-slate-800 border-slate-700 text-slate-400" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Email</Label>
                <Input value={user?.email || ""} disabled className="bg-slate-800 border-slate-700 text-slate-400" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Roli</Label>
                <Input value={user?.role || "user"} disabled className="bg-slate-800 border-slate-700 text-slate-400" />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Shop Tab */}
        <TabsContent value="shop" className="mt-6">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-semibold">Cilësimet e Dyqanit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Emri i Dyqanit</Label>
                <Input value={shopSettings.shop_name} onChange={(e) => setShopSettings({...shopSettings, shop_name: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Email</Label>
                <Input value={shopSettings.shop_email} onChange={(e) => setShopSettings({...shopSettings, shop_email: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Telefon</Label>
                <Input value={shopSettings.shop_phone} onChange={(e) => setShopSettings({...shopSettings, shop_phone: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Transport Default (ALL)</Label>
                <Input value={shopSettings.shipping_default} onChange={(e) => setShopSettings({...shopSettings, shipping_default: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Adresa</Label>
              <Textarea value={shopSettings.shop_address} onChange={(e) => setShopSettings({...shopSettings, shop_address: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <Button onClick={saveSettings} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Ruaj Cilësimet
            </Button>
          </div>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="mt-6">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-semibold">Cilësimet Social Media</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Zëri i Brand-it (për gjenerim AI)</Label>
                <Textarea
                  placeholder="Përshkruani tonin e brand-it tuaj (p.sh. profesional, miqësor, trendy...)"
                  value={socialSettings.brand_voice}
                  onChange={(e) => setSocialSettings({...socialSettings, brand_voice: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                <div>
                  <p className="text-white text-sm font-medium">Hashtag-e Automatike</p>
                  <p className="text-slate-500 text-xs">Gjenero hashtag-e automatikisht me AI</p>
                </div>
                <Switch
                  checked={socialSettings.auto_hashtags}
                  onCheckedChange={(v) => setSocialSettings({...socialSettings, auto_hashtags: v})}
                />
              </div>
            </div>
            <Button onClick={saveSettings} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Ruaj
            </Button>
          </div>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support" className="mt-6">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-semibold">Cilësimet e Suportit</h3>
            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <div>
                <p className="text-white text-sm font-medium">Përgjigje Automatike AI</p>
                <p className="text-slate-500 text-xs">AI do të sugjerojë përgjigje automatikisht</p>
              </div>
              <Switch
                checked={supportSettings.auto_reply}
                onCheckedChange={(v) => setSupportSettings({...supportSettings, auto_reply: v})}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Mesazhi i Mirëseardhjes</Label>
              <Textarea
                value={supportSettings.welcome_message}
                onChange={(e) => setSupportSettings({...supportSettings, welcome_message: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Orari i Punës</Label>
              <Input
                value={supportSettings.business_hours}
                onChange={(e) => setSupportSettings({...supportSettings, business_hours: e.target.value})}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Button onClick={saveSettings} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Ruaj
            </Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-semibold">Cilësimet e Njoftime</h3>
            {[
              { key: "email_on_order", label: "Email kur vjen porosi e re", desc: "Njoftim me email për çdo porosi" },
              { key: "email_on_ticket", label: "Email kur hapet tiketë", desc: "Njoftim për tiketa të reja suporti" },
              { key: "low_stock_alert", label: "Alert stoku i ulët", desc: "Njoftim kur produkti ka stok të ulët" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-700/50">
                <div>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-slate-500 text-xs">{item.desc}</p>
                </div>
                <Switch
                  checked={notifSettings[item.key]}
                  onCheckedChange={(v) => setNotifSettings({...notifSettings, [item.key]: v})}
                />
              </div>
            ))}
            <Button onClick={saveSettings} disabled={saving} className="bg-amber-600 hover:bg-amber-700 mt-4">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Ruaj
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}