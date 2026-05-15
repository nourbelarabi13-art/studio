
"use client";

import { useState } from "react";
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
  ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { suggestGenres } from "@/ai/flows/ai-genre-suggestion-flow";
import { checkContentSafety } from "@/ai/flows/ai-content-safety-check-flow";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AVAILABLE_GENRES: Genre[] = ['Fantasy', 'Horror', 'Romance', 'Mystery', 'Drama', 'Sci-Fi'];

export default function WritePage() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCheckingSafety, setIsCheckingSafety] = useState(false);

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

  const handlePublish = async () => {
    if (!content || !title || selectedGenres.length === 0) {
      toast({
        title: "Wait, Traveler",
        description: "Ensure you have a title, content, and at least one genre.",
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
          description: safetyResult.reasons[0] || "Content violates safety standards.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Chronicle Published",
        description: "Your story has been added to the Dark Archive.",
      });
      // Logic for saving to DB
    } catch (error) {
      toast({
        title: "Publishing Error",
        description: "Failed to publish your novel.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingSafety(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="font-headline text-3xl font-bold italic">The Novel Forge</h1>
            <p className="text-muted-foreground text-sm italic">Shape your soul into words.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button variant="outline" className="gap-2 text-muted-foreground border-white/5 hover:bg-muted/30">
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
            <Button 
              onClick={handlePublish} 
              disabled={isCheckingSafety}
              className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              {isCheckingSafety ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publish Story
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          <div className="space-y-6">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Novel Title..."
              className="bg-transparent border-none text-4xl md:text-5xl font-headline font-bold focus-visible:ring-0 px-0 placeholder:opacity-20"
            />
            
            <div className="relative">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Once upon a midnight dreary..."
                className="writing-editor min-h-[60vh] bg-transparent border-none resize-none focus-visible:ring-0 p-0 placeholder:italic placeholder:opacity-20 text-muted-foreground"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[10px] text-muted-foreground/30 uppercase tracking-widest font-bold">
                {content.length} characters • {content.split(/\s+/).filter(Boolean).length} words
              </div>
            </div>
          </div>

          <aside className="space-y-8 animate-fade-in">
            <div className="glass-morphism rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-bold flex items-center gap-2">
                  Genre Grimoire
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-accent hover:text-accent/80"
                  onClick={handleSuggestGenres}
                  disabled={isAnalyzing}
                >
                  <Sparkles className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground italic">Select up to three essence tags</p>
              
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_GENRES.map(genre => (
                  <Badge
                    key={genre}
                    variant={selectedGenres.includes(genre) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedGenres.includes(genre) 
                        ? "bg-primary border-primary" 
                        : "border-white/10 text-muted-foreground hover:border-accent hover:text-accent"
                    )}
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>

              {selectedGenres.length === 0 && (
                <div className="flex items-center gap-2 text-xs text-destructive italic pt-2">
                  <AlertTriangle className="w-3 h-3" />
                  At least one genre required
                </div>
              )}
            </div>

            <div className="glass-morphism rounded-2xl p-6 space-y-4 border-accent/20">
              <h3 className="font-headline font-bold">Guardian Sentinel</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All chronicles undergo a safety ritual before manifestation. 
                Keep the sanctuary safe for all travelers.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>No toxicity rituals found</span>
              </div>
            </div>

            <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 gap-2">
              <Trash2 className="w-4 h-4" />
              Discard Scrolls
            </Button>
          </aside>
        </div>
      </main>
    </div>
  );
}
