import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Globe2, MapPin, BookOpen, Plus, ChevronRight, Loader2
} from "lucide-react";
import HajjProgress from "@/components/hajj/HajjProgress";
import VRViewer from "@/components/hajj/VRViewer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const locations = {
  makkah: { name: "Mekka", color: "from-amber-500 to-yellow-500", image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600" },
  madinah: { name: "Medina", color: "from-emerald-500 to-green-500", image: "https://images.unsplash.com/photo-1590076215667-875d4ef2d7de?w=600" },
  mina: { name: "Mina", color: "from-sky-500 to-blue-500", image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600" },
  arafat: { name: "Arafat", color: "from-purple-500 to-violet-500", image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600" },
  muzdalifah: { name: "Muzdalifa", color: "from-rose-500 to-pink-500", image: "https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=600" },
  jamarat: { name: "Xhamarat", color: "from-orange-500 to-red-500", image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=600" },
};

const rituals = {
  ihram: "Ihrami", tawaf: "Tavafi", sai: "Saiu", wuquf: "Vuquf",
  rami: "Rami", halq: "Halqi", farewell_tawaf: "Tavafi Lamtumirës",
};

export default function HajjVR() {
  const queryClient = useQueryClient();
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", location: "makkah", ritual_name: "tawaf",
    step_number: 1, dua_text: "", dua_translation: "", duration_minutes: 30,
  });

  const { data: experiences = [] } = useQuery({
    queryKey: ["hajj"],
    queryFn: () => base44.entities.HajjExperience.list("step_number", 50),
  });

  const generateContent = async () => {
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate detailed Hajj pilgrimage content for:
Location: ${form.location}
Ritual: ${form.ritual_name}
Include:
1. A vivid description of the experience
2. The Arabic dua/prayer for this ritual
3. Albanian translation of the dua
4. 3-5 practical tips for pilgrims
Write in Albanian.`,
      response_json_schema: {
        type: "object",
        properties: {
          description: { type: "string" },
          dua_text: { type: "string" },
          dua_translation: { type: "string" },
          tips: { type: "array", items: { type: "string" } },
        },
      },
    });
    setForm(prev => ({
      ...prev,
      description: result.description,
      dua_text: result.dua_text,
      dua_translation: result.dua_translation,
      tips: result.tips,
    }));
    setGenerating(false);
  };

  const saveExperience = async () => {
    const loc = locations[form.location];
    await base44.entities.HajjExperience.create({
      ...form,
      thumbnail_url: loc.image,
    });
    queryClient.invalidateQueries({ queryKey: ["hajj"] });
    setAddOpen(false);
    toast.success("Eksperienca u shtua!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-400 text-sm">Eksperiencë virtuale e Haxhit - udhëzo haxhilerët përmes ritualeve</p>
        <Button onClick={() => setAddOpen(true)} className="bg-gradient-to-r from-amber-500 to-orange-500">
          <Plus className="w-4 h-4 mr-2" /> Shto Eksperiencë
        </Button>
      </div>

      {/* Location Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(locations).map(([key, loc]) => {
          const count = experiences.filter(e => e.location === key).length;
          return (
            <div key={key} className="relative overflow-hidden rounded-2xl group cursor-pointer h-32">
              <img src={loc.image} alt={loc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <p className="text-white font-semibold text-sm">{loc.name}</p>
                <p className="text-white/60 text-xs">{count} eksperienca</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Journey + Progress + VR Viewer */}
      {experiences.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <HajjProgress experiences={experiences} />
          </div>
          <div className="lg:col-span-2">
            <VRViewer experiences={experiences} />
          </div>
        </div>
      )}

      {/* Journey Timeline */}
      {experiences.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-white font-semibold">Udhëtimi i Haxhit</h3>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-700/50" />
            {experiences.map((exp, i) => (
              <div
                key={exp.id}
                onClick={() => setSelectedExperience(exp)}
                className="relative pl-12 pb-6 cursor-pointer group"
              >
                <div className={cn(
                  "absolute left-3 w-5 h-5 rounded-full border-2 transition-all",
                  selectedExperience?.id === exp.id
                    ? "bg-amber-500 border-amber-400 scale-125"
                    : "bg-slate-800 border-slate-600 group-hover:border-amber-400"
                )} />
                <div className={cn(
                  "bg-slate-800/30 border rounded-2xl p-5 transition-all",
                  selectedExperience?.id === exp.id ? "border-amber-500/30" : "border-slate-700/50 group-hover:border-slate-600/50"
                )}>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-amber-500/10 text-amber-400 border-0">Hapi {exp.step_number}</Badge>
                    <Badge className="bg-slate-700/50 text-slate-300 border-0">
                      <MapPin className="w-3 h-3 mr-1" />
                      {locations[exp.location]?.name || exp.location}
                    </Badge>
                    {exp.ritual_name && (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-0">
                        {rituals[exp.ritual_name] || exp.ritual_name}
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-white font-medium">{exp.title}</h4>
                  <p className="text-slate-400 text-sm mt-1 line-clamp-2">{exp.description}</p>
                  {exp.duration_minutes && (
                    <p className="text-slate-600 text-xs mt-2">⏱ {exp.duration_minutes} minuta</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <Globe2 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">Shto eksperiencat e Haxhit për të ndërtuar udhëtimin virtual</p>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedExperience} onOpenChange={() => setSelectedExperience(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
          {selectedExperience && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">{selectedExperience.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-3">
                {selectedExperience.thumbnail_url && (
                  <img src={selectedExperience.thumbnail_url} alt="" className="w-full h-48 object-cover rounded-xl" />
                )}
                <p className="text-slate-300 text-sm leading-relaxed">{selectedExperience.description}</p>
                {selectedExperience.dua_text && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-amber-200 text-right text-lg leading-loose font-serif">{selectedExperience.dua_text}</p>
                    {selectedExperience.dua_translation && (
                      <p className="text-slate-400 text-sm mt-3 border-t border-amber-500/10 pt-3">{selectedExperience.dua_translation}</p>
                    )}
                  </div>
                )}
                {selectedExperience.tips?.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium text-sm mb-2">Këshilla</h4>
                    <ul className="space-y-1">
                      {selectedExperience.tips.map((tip, i) => (
                        <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 mt-1 text-amber-400 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Experience Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-white">Shto Eksperiencë Hajj</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-3">
            <Input placeholder="Titulli" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(locations).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-white focus:bg-slate-700">{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={form.ritual_name} onValueChange={(v) => setForm({ ...form, ritual_name: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(rituals).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-white focus:bg-slate-700">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Hapi #" value={form.step_number} onChange={(e) => setForm({ ...form, step_number: parseInt(e.target.value) || 1 })} className="bg-slate-800 border-slate-700 text-white" />
              <Input type="number" placeholder="Kohëzgjatja (min)" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })} className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <Button variant="outline" onClick={generateContent} disabled={generating} className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
              {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookOpen className="w-4 h-4 mr-2" />}
              Gjenero Përmbajtje me AI
            </Button>
            <Textarea placeholder="Përshkrimi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="bg-slate-800 border-slate-700 text-white" />
            <Textarea placeholder="Duaja (Arabisht)" value={form.dua_text} onChange={(e) => setForm({ ...form, dua_text: e.target.value })} className="bg-slate-800 border-slate-700 text-white text-right" dir="rtl" />
            <Textarea placeholder="Përkthimi i duasë" value={form.dua_translation} onChange={(e) => setForm({ ...form, dua_translation: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
            <Button onClick={saveExperience} disabled={!form.title} className="w-full bg-amber-600 hover:bg-amber-700">
              Ruaj Eksperiencën
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}