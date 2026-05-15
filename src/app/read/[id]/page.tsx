
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { MOCK_NOVELS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Type, 
  Maximize2, 
  Share2,
  Bookmark,
  User
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ReadingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [reportReason, setReportReason] = useState("");
  const novel = MOCK_NOVELS.find(n => n.id === id) || MOCK_NOVELS[0];

  const handleReport = () => {
    if (!reportReason.trim()) return;
    toast({
      title: "Guardian Alerted",
      description: "Thank you for helping keep the sanctuary safe. Our sentinels will review this report.",
    });
    setReportReason("");
  };

  return (
    <div className="min-h-screen bg-[#171113]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl space-y-12 animate-fade-in">
        {/* Header Section */}
        <header className="space-y-6 text-center border-b border-white/5 pb-12">
          <div className="flex justify-center gap-2 mb-4">
            {novel.genres.map(genre => (
              <Badge key={genre} variant="outline" className="border-primary/30 text-primary italic">
                {genre}
              </Badge>
            ))}
          </div>
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            {novel.title}
          </h1>
          <div className="flex items-center justify-center gap-3 text-muted-foreground italic">
            <span className="text-sm">Penned by</span>
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <User className="w-3 h-3" />
              </div>
              {novel.authorUsername}
            </div>
          </div>
        </header>

        {/* Reading Tools (Sticky) */}
        <div className="sticky top-20 z-10 flex justify-center">
          <div className="glass-morphism border-white/10 rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent">
              <Type className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent">
              <Bookmark className="w-5 h-5" />
            </Button>
            <div className="w-px h-4 bg-white/10" />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <Flag className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-white/5">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl">Summon the Guardian Sentinel</DialogTitle>
                  <DialogDescription className="italic">
                    Report content that violates our sanctuary's safety guidelines.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Textarea 
                    placeholder="Describe the transgression..." 
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="bg-muted/30 border-white/5"
                  />
                </div>
                <DialogFooter>
                  <Button variant="ghost" className="text-muted-foreground">Cancel</Button>
                  <Button onClick={handleReport} className="bg-destructive hover:bg-destructive/90">Send Report</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Content Section */}
        <article className="writing-editor prose prose-invert prose-lg max-w-none space-y-8 text-muted-foreground leading-loose">
          <p className="first-letter:text-7xl first-letter:font-headline first-letter:text-primary first-letter:float-left first-letter:mr-4 first-letter:mt-1">
            {novel.content}
          </p>
          <p>
            The velvet sky was torn by streaks of amethyst light, illuminating the ancient spires of the Archive. Within these walls, every shadow held a whisper, and every whisper held a soul.
          </p>
          <p>
            "Patience," a voice like silk sliding over stone echoed through the corridor. "The story is only beginning to reveal its secrets."
          </p>
          <p>
            It was the kind of night where the air felt heavy with the weight of untold tragedies and unspoken promises. A night where a single word could change the course of history, or end a life before the dawn broke the horizon.
          </p>
          <p>
            The Inkwell was never dry for those who dared to touch the void...
          </p>
        </article>

        {/* Footer Navigation */}
        <footer className="pt-16 border-t border-white/5 space-y-8">
          <div className="flex items-center justify-between">
            <Button variant="outline" className="gap-2 border-white/5 text-muted-foreground" disabled>
              <ChevronLeft className="w-4 h-4" />
              Previous Chapter
            </Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              Next Chapter
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="bg-card/40 rounded-3xl p-8 text-center space-y-4">
            <h3 className="font-headline text-2xl font-bold">You've reached the end of this fragment.</h3>
            <p className="text-muted-foreground italic">Follow {novel.authorUsername} to be notified of new manifestations.</p>
            <div className="flex justify-center gap-4">
              <Button variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8">
                Follow Author
              </Button>
              <Button variant="outline" className="border-white/10 rounded-full px-8 gap-2">
                <Share2 className="w-4 h-4" />
                Share Story
              </Button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
