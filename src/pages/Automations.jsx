import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Zap, Clock, Play, Pause, Trash2, Activity, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import AutomationLogs from "@/components/automations/AutomationLogs";

const triggerLabels = { schedule: "Orar", event: "Event", webhook: "Webhook", manual: "Manual" };
const actionLabels = { send_email: "Dërgo Email", generate_post: "Gjenero Post", update_inventory: "Përditëso Inventar", send_notification: "Njoftim", custom: "Custom" };
const triggerColors = { schedule: "bg-purple-500/10 text-purple-400", event: "bg-sky-500/10 text-sky-400", webhook: "bg-amber-500/10 text-amber-400", manual: "bg-slate-500/10 text-slate-300" };

export default function Automations() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedAuto, setSelectedAuto] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", trigger_type: "schedule", action_type: "send_email", schedule: "" });

  const { data: automations = [] } = useQuery({
    queryKey: ["automations"],
    queryFn: () => base44.entities.Automation.list("-created_date", 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Automation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      setOpen(false);
      setForm({ name: "", description: "", trigger_type: "schedule", action_type: "send_email", schedule: "" });
      toast.success("Automatizimi u krijua!");
    },
  });

  const toggleStatus = async (auto) => {
    await base44.entities.Automation.update(auto.id, {
      status: auto.status === "active" ? "paused" : "active",
    });
    queryClient.invalidateQueries({ queryKey: ["automations"] });
  };

  const deleteAutomation = async (id) => {
    await base44.entities.Automation.delete(id);
    queryClient.invalidateQueries({ queryKey: ["automations"] });
    toast.success("Automatizimi u fshi!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-slate-400 text-sm">Menaxho automatizime për biznesin tënd</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600">
              <Plus className="w-4 h-4 mr-2" /> Krijo Automatizim
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Automatizim i Ri</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Emri" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
              <Textarea placeholder="Përshkrimi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
              <Select value={form.trigger_type} onValueChange={(v) => setForm({ ...form, trigger_type: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(triggerLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-white focus:bg-slate-700">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={form.action_type} onValueChange={(v) => setForm({ ...form, action_type: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(actionLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-white focus:bg-slate-700">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.trigger_type === "schedule" && (
                <Input placeholder="Cron (p.sh. 0 9 * * 1-5)" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
              )}
              <Button onClick={() => createMutation.mutate(form)} disabled={!form.name} className="w-full bg-purple-600 hover:bg-purple-700">
                Krijo Automatizim
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main content: list + logs panel */}
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {automations.length === 0 ? (
            <div className="text-center py-20">
              <Zap className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">Nuk ka automatizime ende</p>
              <p className="text-slate-600 text-sm mt-1">Krijo automatizimin e parë për biznesin tënd</p>
            </div>
          ) : (
            <div className="space-y-3">
              {automations.map((auto) => (
                <div
                  key={auto.id}
                  onClick={() => setSelectedAuto(selectedAuto?.id === auto.id ? null : auto)}
                  className={`bg-slate-800/30 border rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all ${selectedAuto?.id === auto.id ? "border-purple-500/30 bg-purple-500/5" : "border-slate-700/50 hover:border-slate-600/50"}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${auto.status === "active" ? "bg-emerald-500/10" : "bg-slate-700/50"}`}>
                    {auto.status === "active" ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-slate-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium text-sm">{auto.name}</h4>
                      <Badge className={triggerColors[auto.trigger_type]}>{triggerLabels[auto.trigger_type]}</Badge>
                    </div>
                    <p className="text-slate-500 text-xs mt-1 truncate">{auto.description || actionLabels[auto.action_type]}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                      <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {auto.run_count || 0} ekzekutime</span>
                      {auto.last_run && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(auto.last_run), "dd/MM HH:mm")}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    <Switch checked={auto.status === "active"} onCheckedChange={() => toggleStatus(auto)} />
                    <Button variant="ghost" size="icon" onClick={() => deleteAutomation(auto.id)} className="text-slate-500 hover:text-red-400 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logs Panel */}
        {selectedAuto && (
          <div className="w-96 flex-shrink-0 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/50">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium text-sm">Log-et e Ekzekutimit</span>
            </div>
            <AutomationLogs automation={selectedAuto} />
          </div>
        )}
      </div>
    </div>
  );
}