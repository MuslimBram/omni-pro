import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Search, Filter } from "lucide-react";
import CustomerCard from "@/components/crm/CustomerCard";
import CustomerDetailModal from "@/components/crm/CustomerDetailModal";
import CustomerForm from "@/components/crm/CustomerForm";
import { toast } from "sonner";

const SEGMENTS = [
  { value: "all",      label: "Të Gjithë" },
  { value: "new",      label: "Të Rinj" },
  { value: "loyal",    label: "Besnikë" },
  { value: "vip",      label: "VIP" },
  { value: "inactive", label: "Joaktivë" },
  { value: "prospect", label: "Perspektivë" },
];

const SEGMENT_COLORS = {
  new: "bg-sky-500/10 text-sky-400",
  loyal: "bg-emerald-500/10 text-emerald-400",
  vip: "bg-amber-500/10 text-amber-400",
  inactive: "bg-slate-600/30 text-slate-400",
  prospect: "bg-purple-500/10 text-purple-400",
};

export default function CRM() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formCustomer, setFormCustomer] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list("-created_date", 200),
  });
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => base44.entities.Order.list("-created_date", 500),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["customers"] });

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search);
      const matchSeg = segmentFilter === "all" || c.segment === segmentFilter;
      return matchSearch && matchSeg;
    });
  }, [customers, search, segmentFilter]);

  const segmentCounts = useMemo(() => {
    const counts = {};
    customers.forEach(c => { counts[c.segment] = (counts[c.segment] || 0) + 1; });
    return counts;
  }, [customers]);

  const deleteCustomer = async (id) => {
    if (!confirm("Jeni i sigurt që doni ta fshini këtë klient?")) return;
    await base44.entities.Customer.delete(id);
    toast.success("Klienti u fshi!");
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">CRM - Klientët</h1>
            <p className="text-slate-500 text-sm">{customers.length} klientë gjithsej</p>
          </div>
        </div>
        <Button onClick={() => { setFormCustomer(null); setShowForm(true); }} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="w-4 h-4 mr-2" /> Shto Klient
        </Button>
      </div>

      {/* Segment Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {SEGMENTS.filter(s => s.value !== "all").map(seg => (
          <button
            key={seg.value}
            onClick={() => setSegmentFilter(segmentFilter === seg.value ? "all" : seg.value)}
            className={`rounded-xl border p-3 text-left transition-all ${
              segmentFilter === seg.value
                ? "border-amber-500/40 bg-amber-500/10"
                : "border-slate-700/50 bg-slate-800/20 hover:border-slate-600"
            }`}
          >
            <p className={`text-lg font-bold ${SEGMENT_COLORS[seg.value]?.split(" ")[1] || "text-white"}`}>
              {segmentCounts[seg.value] || 0}
            </p>
            <p className="text-slate-400 text-xs mt-0.5">{seg.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Kërko klient..."
            className="bg-slate-800 border-slate-700 text-white pl-10"
          />
        </div>
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white w-44">
            <Filter className="w-3.5 h-3.5 mr-2 text-slate-500" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {SEGMENTS.map(s => (
              <SelectItem key={s.value} value={s.value} className="text-white focus:bg-slate-700">{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Customer Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nuk u gjetën klientë</p>
          {customers.length === 0 && (
            <Button onClick={() => { setFormCustomer(null); setShowForm(true); }} variant="outline" className="mt-4 border-slate-600 text-slate-400">
              <Plus className="w-4 h-4 mr-2" /> Shto klientin e parë
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => (
            <CustomerCard
              key={c.id}
              customer={c}
              onClick={() => setSelectedCustomer(c)}
              onEdit={c => { setFormCustomer(c); setShowForm(true); }}
              onDelete={deleteCustomer}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          orders={orders}
          onClose={() => setSelectedCustomer(null)}
          onRefresh={refresh}
        />
      )}
      {showForm && (
        <CustomerForm
          customer={formCustomer}
          onClose={() => { setShowForm(false); setFormCustomer(null); }}
          onSaved={refresh}
        />
      )}
    </div>
  );
}