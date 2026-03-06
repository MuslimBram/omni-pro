import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const platformColors = {
  instagram: "bg-pink-500/10 text-pink-400",
  facebook: "bg-blue-500/10 text-blue-400",
  tiktok: "bg-slate-500/10 text-slate-300",
  twitter: "bg-sky-500/10 text-sky-400",
  linkedin: "bg-indigo-500/10 text-indigo-400",
};

export default function PostScheduler({ posts, onRefresh }) {
  const [schedulingId, setSchedulingId] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");

  const scheduledPosts = posts.filter(p => p.status === "scheduled");
  const draftPosts = posts.filter(p => p.status === "draft");

  const schedulePost = async (post) => {
    if (!scheduleDate) { toast.error("Zgjidh datën!"); return; }
    await base44.entities.SocialPost.update(post.id, {
      status: "scheduled",
      scheduled_date: new Date(scheduleDate).toISOString(),
    });
    setSchedulingId(null);
    setScheduleDate("");
    toast.success("Postimi u planifikua!");
    onRefresh?.();
  };

  const publishNow = async (post) => {
    await base44.entities.SocialPost.update(post.id, { status: "published" });
    toast.success("Postimi u publikua!");
    onRefresh?.();
  };

  const deletePost = async (id) => {
    await base44.entities.SocialPost.delete(id);
    toast.success("Postimi u fshi!");
    onRefresh?.();
  };

  return (
    <div className="space-y-6">
      {/* Scheduled Posts */}
      <div>
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" /> Postuar të Planifikuara ({scheduledPosts.length})
        </h3>
        {scheduledPosts.length === 0 ? (
          <div className="text-center py-8 bg-slate-800/20 rounded-xl border border-slate-700/40">
            <p className="text-slate-600 text-sm">Nuk ka postime të planifikuara</p>
          </div>
        ) : (
          <div className="space-y-2">
            {scheduledPosts.map(post => (
              <div key={post.id} className="bg-slate-800/30 border border-amber-500/20 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={platformColors[post.platform]}>{post.platform}</Badge>
                    <span className="text-white text-sm font-medium truncate">{post.title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    <Clock className="w-3 h-3" />
                    {post.scheduled_date ? format(new Date(post.scheduled_date), "dd/MM/yyyy HH:mm") : "—"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => publishNow(post)} className="bg-emerald-600 hover:bg-emerald-700 h-7 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Publiko
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-red-400" onClick={() => deletePost(post.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Draft Posts - Schedule them */}
      <div>
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Edit2 className="w-4 h-4 text-slate-400" /> Draftet ({draftPosts.length})
        </h3>
        {draftPosts.length === 0 ? (
          <div className="text-center py-8 bg-slate-800/20 rounded-xl border border-slate-700/40">
            <p className="text-slate-600 text-sm">Nuk ka draft postime</p>
          </div>
        ) : (
          <div className="space-y-2">
            {draftPosts.map(post => (
              <div key={post.id} className={cn(
                "bg-slate-800/30 border rounded-xl p-4 transition-all",
                schedulingId === post.id ? "border-amber-500/30" : "border-slate-700/50"
              )}>
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={platformColors[post.platform]}>{post.platform}</Badge>
                      <span className="text-white text-sm font-medium truncate">{post.title}</span>
                    </div>
                    <p className="text-slate-500 text-xs line-clamp-1">{post.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSchedulingId(schedulingId === post.id ? null : post.id)} className="border-slate-600 text-slate-300 hover:bg-slate-700 h-7 text-xs">
                      <Calendar className="w-3 h-3 mr-1" /> Planifiko
                    </Button>
                    <Button size="sm" onClick={() => publishNow(post)} className="bg-emerald-600 hover:bg-emerald-700 h-7 text-xs">
                      Publiko
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-red-400" onClick={() => deletePost(post.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {schedulingId === post.id && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50">
                    <Input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="bg-slate-800 border-slate-700 text-white h-8 text-xs flex-1" />
                    <Button size="sm" onClick={() => schedulePost(post)} className="bg-amber-600 hover:bg-amber-700 h-8 text-xs">Konfirmo</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}