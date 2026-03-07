import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Instagram, Facebook, Globe, Linkedin, Twitter, X } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";
import { sq } from "date-fns/locale";
import { toast } from "sonner";

const platformIcons = {
  instagram: { icon: Instagram, color: "text-pink-400", bg: "bg-pink-500/10" },
  facebook:  { icon: Facebook,  color: "text-blue-400", bg: "bg-blue-500/10" },
  tiktok:    { icon: Globe,     color: "text-slate-300", bg: "bg-slate-500/10" },
  twitter:   { icon: Twitter,   color: "text-sky-400",  bg: "bg-sky-500/10" },
  linkedin:  { icon: Linkedin,  color: "text-blue-500", bg: "bg-blue-600/10" },
  web:       { icon: Globe,     color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

const statusColor = {
  draft:     "border-slate-600",
  scheduled: "border-amber-500/60",
  published: "border-emerald-500/60",
};

function PostDetailDialog({ post, onClose, onRefresh }) {
  if (!post) return null;
  const pc = platformIcons[post.platform] || platformIcons.web;
  const Icon = pc.icon;

  const updateDate = async (days) => {
    const base = post.scheduled_date ? new Date(post.scheduled_date) : new Date();
    base.setDate(base.getDate() + days);
    await base44.entities.SocialPost.update(post.id, { scheduled_date: base.toISOString() });
    toast.success("Data u ndryshua!");
    onRefresh?.();
    onClose();
  };

  return (
    <Dialog open={!!post} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${pc.bg}`}>
              <Icon className={`w-4 h-4 ${pc.color}`} />
            </span>
            {post.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {post.image_url && (
            <img src={post.image_url} alt="" className="w-full h-40 object-cover rounded-xl" />
          )}
          <div className="bg-slate-800/40 rounded-xl p-4">
            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>
          {post.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags.map((h, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs">#{h}</span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Platforma: <span className={`font-medium ${pc.color}`}>{post.platform}</span></span>
            <span>Statusi: <span className={`font-medium ${post.status === "published" ? "text-emerald-400" : post.status === "scheduled" ? "text-amber-400" : "text-slate-400"}`}>{post.status}</span></span>
          </div>
          {post.scheduled_date && (
            <div className="bg-slate-800/30 rounded-xl p-3">
              <p className="text-slate-400 text-xs mb-2">Planifikuar: {format(new Date(post.scheduled_date), "dd MMM yyyy HH:mm")}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300 text-xs" onClick={() => updateDate(-1)}>
                  <ChevronLeft className="w-3 h-3 mr-1" /> 1 Ditë Pas
                </Button>
                <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300 text-xs" onClick={() => updateDate(1)}>
                  1 Ditë Para <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CalendarView({ posts, onRefresh }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState(null);
  const [dragging, setDragging] = useState(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart); // 0=Sun

  const scheduledPosts = posts.filter(p => p.scheduled_date || p.status === "scheduled");

  const getPostsForDay = (day) =>
    scheduledPosts.filter(p => p.scheduled_date && isSameDay(new Date(p.scheduled_date), day));

  const handleDragStart = (e, post) => {
    setDragging(post);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e, day) => {
    e.preventDefault();
    if (!dragging) return;
    const existing = dragging.scheduled_date ? new Date(dragging.scheduled_date) : new Date();
    const newDate = new Date(day);
    newDate.setHours(existing.getHours(), existing.getMinutes());
    await base44.entities.SocialPost.update(dragging.id, { scheduled_date: newDate.toISOString() });
    toast.success("Postimi u zhvendos!");
    onRefresh?.();
    setDragging(null);
  };

  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };

  const WEEK_DAYS = ["Die", "Hën", "Mar", "Mër", "Enj", "Pre", "Sht"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-base">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="border-slate-600 text-slate-300 hover:bg-slate-800 w-8 h-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-xs" onClick={() => setCurrentMonth(new Date())}>
            Sot
          </Button>
          <Button variant="outline" size="icon" className="border-slate-600 text-slate-300 hover:bg-slate-800 w-8 h-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-800/20 border border-slate-700/50 rounded-2xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-700/50">
          {WEEK_DAYS.map(d => (
            <div key={d} className="py-2.5 text-center text-slate-500 text-xs font-medium">{d}</div>
          ))}
        </div>
        {/* Days grid */}
        <div className="grid grid-cols-7">
          {/* Padding for first week */}
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[100px] border-b border-r border-slate-700/20" />
          ))}
          {days.map((day, idx) => {
            const dayPosts = getPostsForDay(day);
            const isToday = isSameDay(day, new Date());
            const colIdx = (startPad + idx) % 7;
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] p-1.5 border-b border-r border-slate-700/20 transition-colors ${dragging ? "hover:bg-amber-500/5" : ""} ${colIdx === 6 ? "border-r-0" : ""}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${isToday ? "bg-amber-500 text-white" : "text-slate-500"}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayPosts.slice(0, 3).map(post => {
                    const pc = platformIcons[post.platform] || platformIcons.web;
                    const Icon = pc.icon;
                    return (
                      <div
                        key={post.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, post)}
                        onClick={() => setSelectedPost(post)}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] cursor-pointer hover:opacity-80 border ${statusColor[post.status] || "border-slate-600"} bg-slate-800/60 truncate`}
                      >
                        <Icon className={`w-2.5 h-2.5 flex-shrink-0 ${pc.color}`} />
                        <span className="text-slate-300 truncate">{post.title}</span>
                      </div>
                    );
                  })}
                  {dayPosts.length > 3 && (
                    <div className="text-[9px] text-slate-500 pl-1">+{dayPosts.length - 3} më shumë</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-600 rounded" /> Draft</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-amber-500/60 rounded" /> Planifikuar</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500/60 rounded" /> Publikuar</span>
        <span className="ml-auto text-slate-600">Tërhiq postimet për të ndryshuar datën</span>
      </div>

      <PostDetailDialog post={selectedPost} onClose={() => setSelectedPost(null)} onRefresh={onRefresh} />
    </div>
  );
}