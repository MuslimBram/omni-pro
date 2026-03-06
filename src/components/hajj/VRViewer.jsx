import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Volume2, VolumeX, ChevronLeft, ChevronRight, Maximize2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const locations = {
  makkah: { name: "Mekka", color: "from-amber-500 to-yellow-500" },
  madinah: { name: "Medina", color: "from-emerald-500 to-green-500" },
  mina: { name: "Mina", color: "from-sky-500 to-blue-500" },
  arafat: { name: "Arafat", color: "from-purple-500 to-violet-500" },
  muzdalifah: { name: "Muzdalifa", color: "from-rose-500 to-pink-500" },
  jamarat: { name: "Xhamarat", color: "from-orange-500 to-red-500" },
};

const rituals = {
  ihram: "Ihrami", tawaf: "Tavafi", sai: "Saiu", wuquf: "Vuquf",
  rami: "Rami", halq: "Halqi", farewell_tawaf: "Tavafi Lamtumirës",
};

export default function VRViewer({ experiences }) {
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(false);
  const [tab, setTab] = useState("view"); // view | dua | tips

  const sorted = [...experiences].sort((a, b) => (a.step_number || 0) - (b.step_number || 0));
  const exp = sorted[current];

  if (!exp) return (
    <div className="bg-slate-800/20 border border-slate-700/50 rounded-2xl flex items-center justify-center h-64">
      <p className="text-slate-600 text-sm">Nuk ka eksperienca. Shto disa!</p>
    </div>
  );

  const loc = locations[exp.location];

  return (
    <div className="bg-slate-800/20 border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Immersive image panel */}
      <div className="relative h-72 overflow-hidden">
        <img
          src={exp.thumbnail_url}
          alt={exp.title}
          className="w-full h-full object-cover transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm">
              🕋 VR Eksperiencë
            </Badge>
            <Badge className={`bg-gradient-to-r ${loc?.color} text-white border-0`}>
              <MapPin className="w-3 h-3 mr-1" />{loc?.name || exp.location}
            </Badge>
          </div>
          <Button
            variant="ghost" size="icon"
            onClick={() => setMuted(!muted)}
            className="bg-black/40 text-white hover:bg-black/60 rounded-full h-8 w-8"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </Button>
        </div>

        {/* Navigation arrows */}
        <div className="absolute bottom-16 left-4 right-4 flex items-center justify-between">
          <Button
            variant="ghost" size="icon"
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="bg-black/40 text-white hover:bg-black/60 rounded-full h-9 w-9"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex gap-1.5">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  "rounded-full transition-all",
                  i === current ? "bg-amber-400 w-6 h-2" : "bg-white/30 w-2 h-2 hover:bg-white/60"
                )}
              />
            ))}
          </div>
          <Button
            variant="ghost" size="icon"
            onClick={() => setCurrent(Math.min(sorted.length - 1, current + 1))}
            disabled={current === sorted.length - 1}
            className="bg-black/40 text-white hover:bg-black/60 rounded-full h-9 w-9"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Bottom title */}
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/80 text-white border-0 text-xs">Hapi {exp.step_number}</Badge>
            {exp.ritual_name && <Badge className="bg-black/60 text-white border-0 text-xs">{rituals[exp.ritual_name] || exp.ritual_name}</Badge>}
          </div>
          <h3 className="text-white font-bold text-lg mt-1 drop-shadow-lg">{exp.title}</h3>
        </div>
      </div>

      {/* Tab panel */}
      <div className="p-5">
        <div className="flex gap-2 mb-4">
          {[
            { key: "view", label: "Përshkrimi" },
            { key: "dua", label: "Duaja 🤲" },
            { key: "tips", label: "Këshilla" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                tab === t.key
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/30"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "view" && (
          <div>
            <p className="text-slate-300 text-sm leading-relaxed">{exp.description || "Nuk ka përshkrim."}</p>
            {exp.duration_minutes && (
              <p className="text-slate-600 text-xs mt-3 flex items-center gap-1">
                ⏱ Kohëzgjatja: {exp.duration_minutes} minuta
              </p>
            )}
          </div>
        )}

        {tab === "dua" && (
          <div className="space-y-3">
            {exp.dua_text ? (
              <>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                  <p className="text-amber-200 text-right text-xl leading-loose font-serif" dir="rtl">
                    {exp.dua_text}
                  </p>
                </div>
                {exp.dua_translation && (
                  <p className="text-slate-400 text-sm leading-relaxed border-t border-slate-700/50 pt-3">
                    <span className="text-slate-500 text-xs block mb-1">Shqip:</span>
                    {exp.dua_translation}
                  </p>
                )}
              </>
            ) : (
              <p className="text-slate-600 text-sm text-center py-6">Nuk ka dua për këtë hap.</p>
            )}
          </div>
        )}

        {tab === "tips" && (
          <div className="space-y-2">
            {exp.tips?.length > 0 ? exp.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-700/20 rounded-xl">
                <span className="text-amber-400 font-bold text-sm flex-shrink-0">{i + 1}.</span>
                <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
              </div>
            )) : (
              <p className="text-slate-600 text-sm text-center py-6">Nuk ka këshilla.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}