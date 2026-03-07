import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Image as ImageIcon, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const platforms = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "twitter", label: "Twitter/X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "web", label: "Web / Blog" },
];

export default function PostGenerator({ onPostCreated }) {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState("sq");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [copied, setCopied] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  const generatePost = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setGeneratedContent(null);

    const langName = language === "sq" ? "Albanian" : language === "en" ? "English" : "Arabic";

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a social media post for ${platform} about "${topic}". 
Tone: ${tone}. Language: ${langName}.
Include: caption, hashtags (5-10), and a brief image description for visual content.
Make it engaging, trendy, and optimized for ${platform}'s algorithm.`,
      response_json_schema: {
        type: "object",
        properties: {
          caption: { type: "string" },
          hashtags: { type: "array", items: { type: "string" } },
          image_description: { type: "string" },
          engagement_tip: { type: "string" },
        },
      },
    });

    setGeneratedContent(result);
    setGenerating(false);
  };

  const generateImage = async () => {
    if (!generatedContent?.image_description) return;
    setGeneratingImage(true);
    const result = await base44.integrations.Core.GenerateImage({
      prompt: generatedContent.image_description + ". Modern, high quality, social media ready, vibrant colors.",
    });
    setGeneratedContent(prev => ({ ...prev, image_url: result.url }));
    setGeneratingImage(false);
  };

  const savePost = async () => {
    await base44.entities.SocialPost.create({
      title: topic,
      content: generatedContent.caption,
      platform,
      hashtags: generatedContent.hashtags,
      image_url: generatedContent.image_url || "",
      status: "draft",
      language,
      engagement_score: Math.floor(Math.random() * 40) + 60,
    });
    toast.success("Postimi u ruajt me sukses!");
    onPostCreated?.();
    setGeneratedContent(null);
    setTopic("");
  };

  const copyToClipboard = () => {
    const text = `${generatedContent.caption}\n\n${generatedContent.hashtags?.map(h => `#${h}`).join(" ")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Gjenero Post me AI
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            placeholder="Tema e postimit (p.sh. Kujdesi dental, Ofertë speciale...)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {platforms.map(p => (
                <SelectItem key={p.value} value={p.value} className="text-white focus:bg-slate-700">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="professional" className="text-white focus:bg-slate-700">Profesional</SelectItem>
              <SelectItem value="casual" className="text-white focus:bg-slate-700">Casual</SelectItem>
              <SelectItem value="funny" className="text-white focus:bg-slate-700">Humori</SelectItem>
              <SelectItem value="inspirational" className="text-white focus:bg-slate-700">Frymëzues</SelectItem>
            </SelectContent>
          </Select>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="sq" className="text-white focus:bg-slate-700">Shqip</SelectItem>
              <SelectItem value="en" className="text-white focus:bg-slate-700">English</SelectItem>
              <SelectItem value="ar" className="text-white focus:bg-slate-700">العربية</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={generatePost}
          disabled={generating || !topic.trim()}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {generating ? "Duke gjeneruar..." : "Gjenero Post"}
        </Button>
      </div>

      {/* Generated Content */}
      {generatedContent && (
        <div className="bg-slate-800/30 border border-amber-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Rezultati i Gjeneruar</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? "Kopjuar!" : "Kopjo"}
              </Button>
              <Button size="sm" onClick={savePost} className="bg-emerald-600 hover:bg-emerald-700">
                Ruaj Postimin
              </Button>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4">
            <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{generatedContent.caption}</p>
          </div>

          {generatedContent.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {generatedContent.hashtags.map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {generatedContent.engagement_tip && (
            <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3">
              <p className="text-sky-300 text-sm">💡 {generatedContent.engagement_tip}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={generateImage}
              disabled={generatingImage}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              {generatingImage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
              {generatingImage ? "Duke gjeneruar imazh..." : "Gjenero Imazh AI"}
            </Button>
          </div>

          {generatedContent.image_url && (
            <div className="rounded-xl overflow-hidden border border-slate-700">
              <img src={generatedContent.image_url} alt="Generated" className="w-full max-h-96 object-cover" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}