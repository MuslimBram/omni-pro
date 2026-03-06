import React from "react";
import { CheckCircle2, XCircle, Clock, Zap } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Simulated log entries per automation
function generateLogs(automation) {
  if (!automation || !automation.run_count) return [];
  const logs = [];
  for (let i = 0; i < Math.min(automation.run_count, 5); i++) {
    const hoursAgo = i * 24 + Math.floor(Math.random() * 12);
    const date = new Date(Date.now() - hoursAgo * 3600 * 1000);
    const success = Math.random() > 0.15;
    logs.push({
      id: i,
      date,
      success,
      message: success ? "U ekzekutua me sukses" : "Dështoi - tentativa e re në 5 min",
      duration: `${Math.floor(Math.random() * 800) + 100}ms`,
    });
  }
  return logs;
}

export default function AutomationLogs({ automation }) {
  if (!automation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-600 py-16">
        <Zap className="w-10 h-10 mb-3" />
        <p className="text-sm">Zgjidh një automatizim</p>
      </div>
    );
  }

  const logs = generateLogs(automation);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-medium">{automation.name}</h4>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          {automation.run_count || 0} ekzekutime totale
        </div>
      </div>
      {logs.length === 0 ? (
        <p className="text-slate-600 text-sm text-center py-8">Nuk ka log-e ende</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className={cn(
              "flex items-center gap-3 p-3 rounded-xl border",
              log.success ? "bg-emerald-500/5 border-emerald-500/10" : "bg-red-500/5 border-red-500/10"
            )}>
              {log.success
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm", log.success ? "text-slate-300" : "text-red-300")}>{log.message}</p>
                <p className="text-xs text-slate-600 mt-0.5">{format(log.date, "dd/MM/yyyy HH:mm")} • {log.duration}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}