import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { toast } from "sonner";

const platformColors = {
  instagram: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  facebook: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  tiktok: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  twitter: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  linkedin: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

const statusColors = {
  draft: "bg-slate-500/10 text-slate-400",
  scheduled: "bg-amber-500/10 text-amber-400",
  published: "bg-emerald-500/10 text-emerald-400",
};

export default function PostGrid({ posts, onRefresh }) {
  const deletePost = async (id) => {
    await base44.entities.SocialPost.delete(id);
    toast.success("Postimi u fshi!");
    onRefresh?.();
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Nuk ka postime ende. Gjenero një post me AI!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600/50 transition-all group"
        >
          {post.image_url && (
            <div className="h-40 overflow-hidden">
              <img src={post.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          )}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge className={platformColors[post.platform]}>{post.platform}</Badge>
              <Badge className={statusColors[post.status]}>{post.status}</Badge>
            </div>
            <h4 className="text-white font-medium text-sm">{post.title}</h4>
            <p className="text-slate-400 text-xs line-clamp-3">{post.content}</p>
            {post.hashtags?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.hashtags.slice(0, 4).map((h, i) => (
                  <span key={i} className="text-amber-400/60 text-[10px]">#{h}</span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
              <span className="text-slate-600 text-xs">
                {post.created_date ? format(new Date(post.created_date), "dd MMM yyyy") : ""}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deletePost(post.id)}
                className="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}