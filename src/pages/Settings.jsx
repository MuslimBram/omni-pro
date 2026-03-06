import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  User, Store, Sparkles, HeadphonesIcon, Bell, Save, Loader2, Shield
} from "lucide-react";

function useSetting(key, defaultValue) {
  const { data: settings = [] } = useQuery({
    queryKey: ["app-settings"],
    queryFn: () => base44.entities.AppSettings.list(),
    staleTime: 30000,
  });
  const setting = settings.find(s => s.setting_key === key);
  try {
    return setting ? JSON.parse(setting.setting_value) : defaultValue;
  } catch {
    return setting?.setting_value ?? defaultValue;
  }
}

export default function Settings() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: allSettings = [] } = useQuery({
    queryKey: ["app-settings"],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  const getSetting = (key, def) => {
    const s = allSettings.find(s => s.setting_key === key);
    if (!s) return def;
    try { return JSON.parse(s.setting_value); } catch { return s.setting_value ?? def; }
  };

  const [shopSettings, setShopSettings] = useState({
    shop_name: "SmileShop.al", shop_email: "", shop_phone: "",
    shop_address: "", shipping_default: "500",
  });
  const [socialSettings, setSocialSettings] = useState({
    default_language: "sq", auto_hashtags: true, brand_voice: "",
  });
  const [supportSettings, setSupportSettings] = useState({
    auto_reply: true,
    welcome_message: "Përshëndetje! Si mund t'ju ndihmoj?",
    business_hours: "E Hënë - E Premte, 09:00 - 17:00",
  });
  const [notifSettings, setNotifSettings] = useState({
    email_on_order: true, email_on_ticket: true, low_stock_alert: true,
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Hydrate from DB once loaded
  useEffect(() => {
    if (allSettings.length === 0) return;
    const shop = getSetting("shop", null);
    const social = getSetting("social", null);
    const support = getSetting("support", null);
    const notif = getSetting("notifications", null);
    if (shop) setShopSettings(shop);
    if (social) setSocialSettings(social);
    if (support) setSupportSettings(support);
    if (notif) setNotifSettings(notif);
  }, [allSettings]);

  const upsertSetting = async (key, value, category) => {
    const existing = allSettings.find(s => s.setting_key === key);
    const payload = { setting_key: key, setting_value: JSON.stringify(value), category };
    if (existing) {
      await base44.entities.AppSettings.update(existing.id, payload);
    } else {
      await base44.entities.AppSettings.create(payload);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    await Promise.all([
      upsertSetting("shop", shopSettings, "shop"),
      upsertSetting("social", socialSettings, "social_media"),
      upsertSetting("support", supportSettings, "support"),
      upsertSetting("notifications", notifSettings, "notifications"),
    ]);
    queryClient.invalidateQueries({ queryKey: ["app-settings"] });
    setSaving(false);
    toast.success("Cilësimet u ruajtën!");
  };

  const SaveBtn = ({ onClick }) => (
    <Button onClick={onClick || saveAll} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
      Ruaj Cilësimet
    </Button>
  );

  return (
    <div className="max-w-3xl">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700/50 flex-wrap gap-1 h-auto p-1">
          {[
            { value: "profile", icon: User, label: "Profili" },
            { value: "shop", icon: Store, label: "Dyqani" },
            { value: "social", icon: Sparkles, label: "Social" },
            { value: "support", icon: HeadphonesIcon, label: "Support" },
            { value: "notifications", icon: Bell, label: "Njoftimet" },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <t.icon className="w-3.5 h-3.5 mr-1.5" /> {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                {user?.full_name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <h3 className="text-white font-semibold">{user?.full_name || "Duke ngarkuar..."}</h3>
                <p className="text-slate-500 text-sm">{user?.email}</p>
              </div>
              <div className="ml-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${user?.role === "admin" ? "bg-amber-500/10 text-amber-400" : "bg-slate-700 text-slate-400"}`}>
                  <Shield className="w-3 h-3 inline mr-1" />{user?.role || "user"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-700/50">
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Emri</Label>
                <Input value={user?.full_name || ""} disabled className="bg-slate-800 border-slate-700 text-slate-400" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Email</Label>
                <Input value={user?.email || ""} disabled className="bg-slate-800 border-slate-700 text-slate-400" />
              </div>
            </div>
            <p className="text-slate-600 text-xs">Informacioni i profilit menaxhohet nga platforma.</p>
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
                <Label className="text-slate-300 text-xs">Email Dyqani</Label>
                <Input value={shopSettings.shop_email} onChange={(e) => setShopSettings({...shopSettings, shop_email: e.target.value})} className="bg-slate-800 border-slate-700 text-white" placeholder="info@smileshop.al" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Telefon</Label>
                <Input value={shopSettings.shop_phone} onChange={(e) => setShopSettings({...shopSettings, shop_phone: e.target.value})} className="bg-slate-800 border-slate-700 text-white" placeholder="+355..." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Transport Default (ALL)</Label>
                <Input value={shopSettings.shipping_default} onChange={(e) => setShopSettings({...shopSettings, shipping_default: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Adresa e Dyqanit</Label>
              <Textarea value={shopSettings.shop_address} onChange={(e) => setShopSettings({...shopSettings, shop_address: e.target.value})} className="bg-slate-800 border-slate-700 text-white" placeholder="Rruga, Qyteti, Shqipëri" />
            </div>
            <SaveBtn />
          </div>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="mt-6">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-semibold">Cilësimet Social Media</h3>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Zëri i Brand-it (për gjenerim AI)</Label>
              <Textarea
                placeholder="Përshkruani tonin e brand-it tuaj (p.sh. profesional, miqësor, trendy, SmileShop shet produkte dentare premium...)"
                value={socialSettings.brand_voice}
                onChange={(e) => setSocialSettings({...socialSettings, brand_voice: e.target.value})}
                rows={4}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex items-center justify-between py-3 border border-slate-700/30 rounded-xl px-4">
              <div>
                <p className="text-white text-sm font-medium">Hashtag-e Automatike</p>
                <p className="text-slate-500 text-xs">Gjenero hashtag-e automatikisht me AI</p>
              </div>
              <Switch
                checked={socialSettings.auto_hashtags}
                onCheckedChange={(v) => setSocialSettings({...socialSettings, auto_hashtags: v})}
              />
            </div>
            <SaveBtn />
          </div>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support" className="mt-6">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-semibold">Cilësimet e Suportit</h3>
            <div className="flex items-center justify-between py-3 border border-slate-700/30 rounded-xl px-4">
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
                rows={3}
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
            <SaveBtn />
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-semibold">Cilësimet e Njoftimeve</h3>
            <div className="space-y-3">
              {[
                { key: "email_on_order", label: "Email kur vjen porosi e re", desc: "Njoftim me email për çdo porosi" },
                { key: "email_on_ticket", label: "Email kur hapet tiketë", desc: "Njoftim për tiketa të reja suporti" },
                { key: "low_stock_alert", label: "Alert stoku i ulët", desc: "Njoftim kur produkti ka stok të ulët" },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-3 border border-slate-700/30 rounded-xl px-4">
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
            </div>
            <SaveBtn />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}