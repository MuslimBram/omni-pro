import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Play, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function AutomationRunner({ automation, onRun }) {
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const runNow = async (e) => {
    e.stopPropagation();
    setRunning(true);
    setLastResult(null);

    // Simulate running — increment run_count and set last_run
    const success = Math.random() > 0.1;
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    await base44.entities.Automation.update(automation.id, {
      run_count: (automation.run_count || 0) + 1,
      last_run: new Date().toISOString(),
    });

    setLastResult(success);
    setRunning(false);
    onRun?.();

    if (success) {
      toast.success(`"${automation.name}" u ekzekutua me sukses!`);
    } else {
      toast.error(`"${automation.name}" dështoi.`);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={runNow}
      disabled={running || automation.status === "paused"}
      className="text-xs text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 h-7 px-2"
    >
      {running ? (
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
      ) : lastResult === true ? (
        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
      ) : lastResult === false ? (
        <XCircle className="w-3 h-3 mr-1 text-red-400" />
      ) : (
        <Play className="w-3 h-3 mr-1" />
      )}
      {running ? "Duke ekzekutuar..." : "Ekzekuto"}
    </Button>
  );
}