import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PostGenerator from "@/components/social/PostGenerator";
import PostGrid from "@/components/social/PostGrid";

export default function SocialMedia() {
  const queryClient = useQueryClient();
  const { data: posts = [] } = useQuery({
    queryKey: ["social-posts"],
    queryFn: () => base44.entities.SocialPost.list("-created_date", 50),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["social-posts"] });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="generate" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            Gjenero Post
          </TabsTrigger>
          <TabsTrigger value="posts" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            Postimet e Mia ({posts.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="generate" className="mt-6">
          <PostGenerator onPostCreated={refresh} />
        </TabsContent>
        <TabsContent value="posts" className="mt-6">
          <PostGrid posts={posts} onRefresh={refresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
}