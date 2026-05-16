
"use client";

import { useState, useDeferredValue, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Genre } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  Send, 
  Sparkles, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { suggestGenres } from "@/ai/flows/ai-genre-suggestion-flow";
import { checkContentSafety } from "@/ai/flows/ai-content-safety-check-flow";
import { suggestStorySpark } from "@/ai/flows/ai-story-spark-flow";
import { cn } from "@/lib/utils";

const AVAILABLE_GENRES: Genre[] = ['Fantasy', 'Horror', 'Romance', 'Mystery', 'Drama', 'Sci-Fi'];

export default function WritePage() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const deferredContent = useDeferredValue(content);
  
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSparking, setIsSparking] = useState(false);
  const [isCheckingSafety, setIsCheckingSafety] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const wordCount = useMemo(() => deferredContent.split(/\s+/).filter(Boolean).length, [deferredContent]);
  const charCount = useMemo(() => deferredContent.length, [deferredContent]);

  const toggleGenre = (genre: Genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre) 
        : (prev.length < 3 ? [...prev, genre] : prev)
    );
  };

  const handleSuggestGenres = async () => {
    if (!content || !title) {
      toast({
        title: "Incomplete Scrolls",
        description: "Please provide a title and content before invoking the muse.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await suggestGenres({ title, storyContent: content });
      const suggested = result.suggestedGenres as Genre[];
      setSelectedGenres(suggested);
      toast({
        title: "The Muse Whispers",
        description: `Suggested genres: ${suggested.join(", ")}`,
      });
    } catch (error) {
      toast({
        title: "Silent Muse",
        description: "The AI was unable to analyze your scrolls at this time.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStorySpark = async () => {
    setIsSparking(true);
    try {
      const result = await suggestStorySpark({ title, currentContent: content });
      toast({
        title: "A Spark of Ink",
        description: result.spark,
        duration: 10000,
      });
    } catch (error) {
      toast({
        title: "The Shadows are Silent",
        description: "No spark could be summoned.",
        variant: "destructive",
      });
    } finally {
      setIsSparking(false);
    }
  };

  const handleSaveDraft = () => {
    if (!title && !content) return;
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Scrolls Preserved",
        description: `Draft "${title || 'Untitled Fragment'}" has been secured in your vault.`,
      });
    }, 800);
  };

  const handlePublish = async () => {
    if (!content || !title || selectedGenres.length === 0) {
      toast({
        title: "Wait, Traveler",
        description: "Ensure you have a title, content, and at least one genre essence.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingSafety(true);
    try {
      const safetyResult = await checkContentSafety({ 
        novelTitle: title, 
        novelContent: content 
      });

      if (!safetyResult.isSafe) {
        toast({
          title: "Guardian Intervention",
          description: safetyResult.reasons[0] || "Your content carries heavy shadows that violate sanctuary rules.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Manifestation Complete",
        description: "Your chronicle has been published to the Archive.",
      });
    } catch (error) {
      toast({
        title: "Binding Error",
        description: "The ink failed to bind. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingSafety(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <h1 className="font-headline text-4xl font-bold italic text-primary">The Novel Forge</h1>
            <p className="text-muted-foreground text-sm italic opacity-80">Shape your soul into immortal words.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <Button 
              variant="outline" 
              className="gap-2 text-accent border-accent/20 hover:bg-accent/10 rounded-full h-12 px-6"
              onClick={handleStorySpark}
              disabled={isSparking}
            >
              {isSparking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Story Spark
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 text-muted-foreground border-white/5 hover:bg-muted/30 rounded-full h-12 px-6"
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Draft
            </Button>
            <Button 
              onClick={handlePublish} 
              disabled={isCheckingSafety}
              className="gap-2 bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 rounded-full h-12 px-8"
            >
              {isCheckingSafety ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publish Story
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-12">
          <div className="space-y-8">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your Chronicle Title..."
              className="bg-transparent border-none text-5xl md:text-6xl font-headline font-bold focus-visible:ring-0 px-0 placeholder:opacity-10 py-4 h-auto"
            />
            
            <div className="relative group">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="The moon bled garnet across the obsidian fields..."
                className="writing-editor min-h-[65vh] bg-transparent border-none resize-none focus-visible:ring-0 p-0 placeholder:italic placeholder:opacity-10 text-muted-foreground/90 selection:bg-primary/20"
              />
              <div className="absolute bottom-4 right-0 flex items-center gap-4 text-[9px] text-muted-foreground/20 uppercase tracking-[0.2em] font-bold pointer-events-none group-hover:text-muted-foreground/40 transition-colors">
                <span>{charCount} Characters</span>
                <span className="w-1 h-1 bg-muted-foreground/20 rounded-full" />
                <span>{wordCount} Words</span>
              </div>
            </div>
          </div>

          <aside className="space-y-10 animate-fade-in">
            <div className="glass-morphism rounded-3xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-xl font-bold flex items-center gap-2">
                  Genre Grimoire
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-accent hover:text-accent/80 hover:bg-accent/10 rounded-full"
                  onClick={handleSuggestGenres}
                  disabled={isAnalyzing}
                >
                  <Sparkles className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground italic opacity-70 leading-relaxed">Infuse your story with elemental genre essences (up to three).</p>
              
              <div className="flex flex-wrap gap-2.5">
                {AVAILABLE_GENRES.map(genre => (
                  <Badge
                    key={genre}
                    variant={selectedGenres.includes(genre) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all h-8 px-4 rounded-full text-[10px] uppercase font-bold tracking-widest",
                      selectedGenres.includes(genre) 
                        ? "bg-primary border-primary shadow-lg shadow-primary/20" 
                        : "border-white/10 text-muted-foreground hover:border-accent hover:text-accent"
                    )}
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>

              {selectedGenres.length === 0 && (
                <div className="flex items-center gap-2 text-[10px] text-destructive italic pt-2 font-bold uppercase tracking-wider animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  At least one essence required
                </div>
              )}
            </div>

            <div className="glass-morphism rounded-3xl p-8 space-y-6 border-accent/20">
              <h3 className="font-headline text-xl font-bold">Guardian Sentinel</h3>
              <p className="text-xs text-muted-foreground leading-relaxed italic opacity-80">
                "All manifestations are reviewed by the Sentinels to ensure the sanctuary remains a pure space for expression."
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                  <CheckCircle2 className="w-4 h-4 text-green-500/60" />
                  <span>Safety Ritual Pending</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                  <CheckCircle2 className="w-4 h-4 text-green-500/60" />
                  <span>Privacy Lock Active</span>
                </div>
              </div>
            </div>

            <Button variant="ghost" className="w-full text-destructive/60 hover:text-destructive hover:bg-destructive/5 gap-2 h-12 rounded-full text-xs font-bold uppercase tracking-widest">
              <Trash2 className="w-4 h-4" />
              Discard Scrolls
            </Button>
          </aside>
        </div>
      </main>
    </div>
  );
}
