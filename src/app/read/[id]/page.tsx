
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Type, 
  Share2,
  Bookmark,
  User,
  Heart,
  Eye,
  Loader2
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
import { useFirestore, useDoc, useUser } from "@/firebase";
import { doc, getFirestore } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { incrementNovelView, toggleLikeNovel } from "@/firebase/firestore/novel-actions";
import { Novel } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ReadingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [reportReason, setReportReason] = useState("");
  const [isLiking, setIsLiking] = useState(false);

  const novelRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, "novels", id as string);
  }, [db, id]);

  const { data: novel, loading } = useDoc<Novel>(novelRef);

  // Tracking Views
  useEffect(() => {
    if (db && id) {
      incrementNovelView(db, id as string);
    }
  }, [db, id]);

  const handleReport = () => {
    if (!reportReason.trim()) return;
    toast({
      title: "Guardian Alerted",
      description: "Thank you for helping keep the sanctuary safe. Our sentinels will review this report.",
    });
    setReportReason("");
  };

  const handleLike = async () => {
    if (!user) {
      toast({ title: "Identify Yourself", description: "Please join our archive to like stories.", variant: "destructive" });
      return;
    }
    if (!db || !id) return;

    setIsLiking(true);
    const liked = await toggleLikeNovel(db, id as string, user.uid);
    setIsLiking(false);
    
    toast({
      title: liked ? "Story Loved" : "Love Recalled",
      description: liked ? "Your appreciation has been recorded in the archive." : "You have softly withdrawn your appreciation.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="italic text-muted-foreground">Unrolling the chronicle...</p>
        </div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-6">
        <h1 className="font-headline text-4xl font-bold">Chronicle Lost</h1>
        <p className="text-muted-foreground italic max-w-md">This story appears to have vanished back into the shadows of the archive.</p>
        <Button onClick={() => router.push("/")} className="rounded-full bg-primary">Return to Sanctuary</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen dreamy-fantasy-gradient pb-24">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl space-y-12 animate-fade-in">
        {/* Header Section */}
        <header className="space-y-6 text-center border-b border-primary/10 pb-12">
          <div className="flex justify-center gap-2 mb-4">
            {novel.genres.map(genre => (
              <Badge key={genre} variant="outline" className="border-primary/30 text-primary italic rounded-full bg-primary/5">
                {genre}
              </Badge>
            ))}
          </div>
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
            {novel.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-muted-foreground italic">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-3 h-3" />
              </div>
              {novel.authorUsername}
            </div>
            <div className="w-px h-4 bg-primary/10" />
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
              <Eye className="w-3.5 h-3.5" />
              {novel.views || 0}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              <Heart className="w-3.5 h-3.5 fill-primary/20" />
              {novel.likes || 0}
            </div>
          </div>
        </header>

        {/* Reading Tools (Sticky) */}
        <div className="sticky top-20 z-10 flex justify-center">
          <div className="glass-morphism border-primary/10 rounded-full px-6 py-2.5 flex items-center gap-6 shadow-xl">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLike}
              disabled={isLiking}
              className={cn("h-9 w-9 rounded-full transition-colors", isLiking ? "animate-pulse" : "text-muted-foreground hover:text-primary hover:bg-primary/5")}
            >
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full">
              <Type className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full">
              <Bookmark className="w-5 h-5" />
            </Button>
            <div className="w-px h-5 bg-primary/10" />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full">
                  <Flag className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-primary/10">
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
                    className="bg-muted/30 border-primary/10"
                  />
                </div>
                <DialogFooter>
                  <Button variant="ghost" className="text-muted-foreground">Cancel</Button>
                  <Button onClick={handleReport} className="bg-destructive hover:bg-destructive/90 text-white rounded-full">Send Report</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Content Section */}
        <article className="writing-editor prose prose-stone prose-lg max-w-none space-y-8 text-foreground/80 leading-relaxed font-body">
          <div className="whitespace-pre-wrap">
            {novel.content}
          </div>
        </article>

        {/* Footer Navigation */}
        <footer className="pt-16 border-t border-primary/10 space-y-12">
          <div className="flex items-center justify-between">
            <Button variant="outline" className="gap-2 border-primary/10 text-muted-foreground rounded-full px-6" disabled>
              <ChevronLeft className="w-4 h-4" />
              Previous Chapter
            </Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-md shadow-primary/10">
              Next Chapter
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm border border-primary/5 rounded-[2rem] p-10 text-center space-y-6 shadow-sm">
            <h3 className="font-headline text-3xl font-bold">You've reached the end of this fragment.</h3>
            <p className="text-muted-foreground italic text-lg">Your appreciation keeps the archive blooming.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button onClick={handleLike} className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 h-12 shadow-lg shadow-primary/10 gap-2">
                <Heart className="w-4 h-4" />
                Appreciate Story
              </Button>
              <Button variant="outline" className="border-primary/10 rounded-full px-8 h-12 gap-2 text-primary hover:bg-primary/5">
                <Share2 className="w-4 h-4" />
                Share Story
              </Button>
            </div>
            <p className="text-xs text-muted-foreground italic pt-4">Penned with care by {novel.authorUsername}</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
