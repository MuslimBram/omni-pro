import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  HeadphonesIcon, Plus, Send, Loader2, Sparkles,
  Circle, CheckCircle2, Clock, AlertCircle, MessageSquare, Trash2, Mail
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusIcons = {
  open: <Circle className="w-3 h-3 text-sky-400" />,
  in_progress: <Clock className="w-3 h-3 text-amber-400" />,
  resolved: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
  closed: <AlertCircle className="w-3 h-3 text-slate-500" />,
};

const priorityColors = {
  low: "bg-slate-500/10 text-slate-400",
  medium: "bg-sky-500/10 text-sky-400",
  high: "bg-amber-500/10 text-amber-400",
  urgent: "bg-red-500/10 text-red-400",
};

export default function CustomerSupport() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [filter, setFilter] = useState("all");
  const [ticketForm, setTicketForm] = useState({
    customer_name: "", customer_email: "", subject: "", message: "", priority: "medium", category: "general",
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => base44.entities.SupportTicket.list("-created_date", 100),
  });

  const filteredTickets = filter === "all" ? tickets : tickets.filter(t => t.status === filter);

  const createTicket = async () => {
    const conversation = [{ role: "customer", content: ticketForm.message, timestamp: new Date().toISOString() }];
    await base44.entities.SupportTicket.create({ ...ticketForm, conversation });
    queryClient.invalidateQueries({ queryKey: ["tickets"] });
    setNewTicketOpen(false);
    setTicketForm({ customer_name: "", customer_email: "", subject: "", message: "", priority: "medium", category: "general" });
    toast.success("Tiketa u krijua!");
  };

  const generateAIResponse = async () => {
    if (!selectedTicket) return;
    setAiLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional customer support agent for SmileShop.al (dental/oral care shop in Albania).
Reply to this ticket in Albanian:
Subject: ${selectedTicket.subject}
Message: ${selectedTicket.message}
Category: ${selectedTicket.category}
Previous conversation: ${JSON.stringify(selectedTicket.conversation || [])}

Be helpful, empathetic, and provide a clear solution.`,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" },
          suggested_status: { type: "string" },
        },
      },
    });
    setReply(result.response);
    setAiLoading(false);
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedTicket) return;
    const newConversation = [
      ...(selectedTicket.conversation || []),
      { role: "agent", content: reply, timestamp: new Date().toISOString() },
    ];
    await base44.entities.SupportTicket.update(selectedTicket.id, {
      conversation: newConversation,
      ai_response: reply,
      status: "in_progress",
    });
    queryClient.invalidateQueries({ queryKey: ["tickets"] });
    setReply("");
    setSelectedTicket({ ...selectedTicket, conversation: newConversation, status: "in_progress" });
    toast.success("Përgjigja u dërgua!");
  };

  const updateStatus = async (status) => {
    await base44.entities.SupportTicket.update(selectedTicket.id, { status });
    queryClient.invalidateQueries({ queryKey: ["tickets"] });
    setSelectedTicket({ ...selectedTicket, status });
    if (status === "resolved" && selectedTicket.customer_email) {
      await base44.integrations.Core.SendEmail({
        to: selectedTicket.customer_email,
        subject: `Tiketa juaj u zgjidh: ${selectedTicket.subject}`,
        body: `Përshëndetje ${selectedTicket.customer_name},\n\nTiketa juaj "${selectedTicket.subject}" u zgjidh me sukses nga ekipi ynë.\n\nFaleminderit për kontaktin!\nEkipi SmileShop.al`,
        from_name: "SmileShop.al Support",
      });
      toast.success("Email konfirmimi u dërgua te klienti!");
    }
  };

  const deleteTicket = async (id) => {
    await base44.entities.SupportTicket.delete(id);
    queryClient.invalidateQueries({ queryKey: ["tickets"] });
    if (selectedTicket?.id === id) setSelectedTicket(null);
    toast.success("Tiketa u fshi!");
  };

  const openCount = tickets.filter(t => t.status === "open").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;
  const urgentCount = tickets.filter(t => t.priority === "urgent").length;

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-110px)]">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
          <p className="text-slate-500 text-xs">Totale</p>
          <p className="text-white text-xl font-bold">{tickets.length}</p>
        </div>
        <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-3">
          <p className="text-slate-500 text-xs">Hapura</p>
          <p className="text-sky-400 text-xl font-bold">{openCount}</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
          <p className="text-slate-500 text-xs">Zgjidhura</p>
          <p className="text-emerald-400 text-xl font-bold">{resolvedCount}</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
          <p className="text-slate-500 text-xs">Urgjente</p>
          <p className="text-red-400 text-xl font-bold">{urgentCount}</p>
        </div>
      </div>
      <div className="flex gap-6 flex-1 min-h-0">
      {/* Ticket List */}
      <div className="w-96 flex-shrink-0 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white focus:bg-slate-700">Të gjitha</SelectItem>
              <SelectItem value="open" className="text-white focus:bg-slate-700">Hapur</SelectItem>
              <SelectItem value="in_progress" className="text-white focus:bg-slate-700">Në progres</SelectItem>
              <SelectItem value="resolved" className="text-white focus:bg-slate-700">Zgjidhur</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setNewTicketOpen(true)} className="bg-sky-600 hover:bg-sky-700" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => { setSelectedTicket(ticket); setReply(""); }}
              className={cn(
                "p-4 rounded-xl cursor-pointer transition-all border",
                selectedTicket?.id === ticket.id
                  ? "bg-sky-500/10 border-sky-500/30"
                  : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {statusIcons[ticket.status]}
                  <span className="text-white text-sm font-medium truncate">{ticket.subject}</span>
                </div>
                <Badge className={priorityColors[ticket.priority]} variant="secondary">
                  {ticket.priority}
                </Badge>
              </div>
              <p className="text-slate-500 text-xs truncate">{ticket.customer_name} • {ticket.customer_email}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-slate-600 text-xs">
                  {ticket.created_date ? format(new Date(ticket.created_date), "dd/MM/yyyy HH:mm") : ""}
                </p>
                <button
                  onClick={e => { e.stopPropagation(); deleteTicket(ticket.id); }}
                  className="text-slate-700 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          {filteredTickets.length === 0 && (
            <div className="text-center py-12 text-slate-600 text-sm">Nuk ka tiketa</div>
          )}
        </div>
      </div>

      {/* Ticket Detail / Chat */}
      <div className="flex-1 flex flex-col bg-slate-800/20 rounded-2xl border border-slate-700/50 overflow-hidden">
        {selectedTicket ? (
          <>
            <div className="p-5 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">{selectedTicket.subject}</h3>
                  <p className="text-slate-500 text-sm">{selectedTicket.customer_name} • {selectedTicket.customer_email}</p>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedTicket.status} onValueChange={updateStatus}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="open" className="text-white focus:bg-slate-700">Hapur</SelectItem>
                      <SelectItem value="in_progress" className="text-white focus:bg-slate-700">Në progres</SelectItem>
                      <SelectItem value="resolved" className="text-white focus:bg-slate-700">Zgjidhur</SelectItem>
                      <SelectItem value="closed" className="text-white focus:bg-slate-700">Mbyllur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {(selectedTicket.conversation || [{ role: "customer", content: selectedTicket.message }]).map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "agent" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-3",
                    msg.role === "agent" ? "bg-sky-600/20 text-sky-100" : "bg-slate-700/50 text-slate-200"
                  )}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    {msg.timestamp && (
                      <p className="text-[10px] mt-1 opacity-50">
                        {format(new Date(msg.timestamp), "HH:mm")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-700/50">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={generateAIResponse} disabled={aiLoading} className="border-slate-600 text-slate-300 hover:bg-slate-700 flex-shrink-0">
                  {aiLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
                  AI Përgjigje
                </Button>
                <Input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Shkruaj përgjigjen..."
                  className="bg-slate-800 border-slate-700 text-white flex-1"
                  onKeyDown={(e) => e.key === "Enter" && sendReply()}
                />
                <Button onClick={sendReply} disabled={!reply.trim()} className="bg-sky-600 hover:bg-sky-700 flex-shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
            <MessageSquare className="w-12 h-12 mb-3" />
            <p className="text-sm">Zgjidh një tiketë për të parë detajet</p>
          </div>
        )}
      </div>

      </div>

      {/* New Ticket Dialog */}
      <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader><DialogTitle className="text-white">Tiketë e Re</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-3">
            <Input placeholder="Emri i klientit" value={ticketForm.customer_name} onChange={(e) => setTicketForm({ ...ticketForm, customer_name: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
            <Input placeholder="Email" value={ticketForm.customer_email} onChange={(e) => setTicketForm({ ...ticketForm, customer_email: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
            <Input placeholder="Subjekti" value={ticketForm.subject} onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
            <Textarea placeholder="Mesazhi" value={ticketForm.message} onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
            <div className="grid grid-cols-2 gap-3">
              <Select value={ticketForm.priority} onValueChange={(v) => setTicketForm({ ...ticketForm, priority: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="low" className="text-white focus:bg-slate-700">Ulët</SelectItem>
                  <SelectItem value="medium" className="text-white focus:bg-slate-700">Mesatare</SelectItem>
                  <SelectItem value="high" className="text-white focus:bg-slate-700">Lartë</SelectItem>
                  <SelectItem value="urgent" className="text-white focus:bg-slate-700">Urgjente</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ticketForm.category} onValueChange={(v) => setTicketForm({ ...ticketForm, category: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="general" className="text-white focus:bg-slate-700">Gjenerale</SelectItem>
                  <SelectItem value="billing" className="text-white focus:bg-slate-700">Faturim</SelectItem>
                  <SelectItem value="technical" className="text-white focus:bg-slate-700">Teknike</SelectItem>
                  <SelectItem value="shipping" className="text-white focus:bg-slate-700">Dërgesa</SelectItem>
                  <SelectItem value="returns" className="text-white focus:bg-slate-700">Kthime</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createTicket} disabled={!ticketForm.subject || !ticketForm.message} className="w-full bg-sky-600 hover:bg-sky-700">
              Krijo Tiketë
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}