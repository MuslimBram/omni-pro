import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PostGenerator from "@/components/social/PostGenerator";
import PostGrid from "@/components/social/PostGrid";
import PostScheduler from "@/components/social/PostScheduler";
import CalendarView from "@/components/social/CalendarView";
import { Calendar, Sparkles, LayoutGrid, CalendarDays } from "lucide-react";

export default function SocialMedia() {
  const queryClient = useQueryClient();
  const { data: posts = [] } = useQuery({
    queryKey: ["social-posts"],
    queryFn: () => base44.entities.SocialPost.list("-created_date", 50),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["social-posts"] });
  const scheduledCount = posts.filter(p => p.status === "scheduled").length;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="generate" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Gjenero Post
          </TabsTrigger>
          <TabsTrigger value="posts" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <LayoutGrid className="w-3.5 h-3.5 mr-1.5" /> Postimet ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <CalendarDays className="w-3.5 h-3.5 mr-1.5" /> Kalendar {scheduledCount > 0 && `(${scheduledCount})`}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Calendar className="w-3.5 h-3.5 mr-1.5" /> Planifiko
          </TabsTrigger>
        </TabsList>
        <TabsContent value="generate" className="mt-6">
          <PostGenerator onPostCreated={refresh} />
        </TabsContent>
        <TabsContent value="posts" className="mt-6">
          <PostGrid posts={posts} onRefresh={refresh} />
        </TabsContent>
        <TabsContent value="calendar" className="mt-6">
          <CalendarView posts={posts} onRefresh={refresh} />
        </TabsContent>
        <TabsContent value="schedule" className="mt-6">
          <PostScheduler posts={posts} onRefresh={refresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
}