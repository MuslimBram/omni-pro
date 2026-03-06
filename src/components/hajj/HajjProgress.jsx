import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Trophy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function HajjProgress({ experiences, onRefresh }) {
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hajj_completed") || "[]"); } catch { return []; }
  });

  const toggleComplete = (expId) => {
    const newCompleted = completed.includes(expId)
      ? completed.filter(id => id !== expId)
      : [...completed, expId];
    setCompleted(newCompleted);
    localStorage.setItem("hajj_completed", JSON.stringify(newCompleted));
    if (!completed.includes(expId)) toast.success("Rituali u shënua si i kryer! 🤲");
  };

  const percent = experiences.length > 0 ? Math.round((completed.length / experiences.length) * 100) : 0;

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" /> Progresi i Haxhit
        </h3>
        <span className="text-amber-400 font-bold text-lg">{percent}%</span>
      </div>
      <Progress value={percent} className="h-2 mb-1 bg-slate-700" />
      <p className="text-slate-500 text-xs mb-5">{completed.length} nga {experiences.length} rituale të kryera</p>

      {percent === 100 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4 text-center">
          <p className="text-amber-300 text-sm font-medium">🕋 Urime! Haxhi u krye me sukses!</p>
        </div>
      )}

      <div className="space-y-2">
        {[...experiences].sort((a, b) => (a.step_number || 0) - (b.step_number || 0)).map(exp => {
          const isDone = completed.includes(exp.id);
          return (
            <div
              key={exp.id}
              onClick={() => toggleComplete(exp.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                isDone
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-slate-800/20 border-slate-700/30 hover:border-slate-600/50"
              )}
            >
              {isDone
                ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                : <Circle className="w-5 h-5 text-slate-600 flex-shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", isDone ? "text-slate-400 line-through" : "text-white")}>
                  {exp.step_number}. {exp.title}
                </p>
                <p className="text-slate-600 text-xs capitalize">{exp.location} • {exp.duration_minutes} min</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}