
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Loader2,
  Languages
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
import { doc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { incrementNovelView, toggleLikeNovel } from "@/firebase/firestore/novel-actions";
import { Novel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

export default function ReadingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const { t, language: appLanguage } = useLanguage();
  
  const [reportReason, setReportReason] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [useTranslation, setUseTranslation] = useState(false);

  const novelRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, "novels", id as string);
  }, [db, id]);

  const { data: novel, loading } = useDoc<Novel>(novelRef);

  useEffect(() => {
    if (db && id) {
      incrementNovelView(db, id as string);
    }
  }, [db, id]);

  const handleReport = () => {
    if (!reportReason.trim()) return;
    toast({
      title: "Guardian Alerted",
      description: "Thank you for helping keep the sanctuary safe.",
    });
    setReportReason("");
  };

  const handleLike = async () => {
    if (!user) {
      toast({ title: "Identify Yourself", variant: "destructive" });
      return;
    }
    if (!db || !id) return;

    setIsLiking(true);
    const liked = await toggleLikeNovel(db, id as string, user.uid);
    setIsLiking(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-6">
        <h1 className="font-headline text-4xl font-bold">Chronicle Lost</h1>
        <Button onClick={() => router.push("/")} className="rounded-full bg-primary">Return to Sanctuary</Button>
      </div>
    );
  }

  const hasTranslation = !!novel.translations?.[appLanguage];
  const displayTitle = (useTranslation && hasTranslation) ? novel.translations![appLanguage]!.title : novel.title;
  const displayContent = (useTranslation && hasTranslation) ? novel.translations![appLanguage]!.content : novel.content;

  return (
    <div className="min-h-screen dreamy-fantasy-gradient pb-24">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl space-y-12 animate-fade-in">
        <header className="space-y-6 text-center border-b border-primary/10 pb-12">
          <div className="flex justify-center gap-2 mb-4">
            {novel.genres.map(genre => (
              <Badge key={genre} variant="outline" className="border-primary/30 text-primary italic rounded-full bg-primary/5">
                {genre}
              </Badge>
            ))}
          </div>
          <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
            {displayTitle}
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

        <div className="sticky top-20 z-10 flex flex-col items-center gap-4">
          {hasTranslation && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setUseTranslation(!useTranslation)}
              className="rounded-full bg-white/80 backdrop-blur-md border-primary/20 text-primary gap-2 shadow-sm"
            >
              <Languages className="w-4 h-4" />
              {useTranslation ? t.read.original_toggle : t.read.translate_toggle}
            </Button>
          )}

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
                  <DialogTitle className="font-headline text-2xl">{t.read.report}</DialogTitle>
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

        <article className="writing-editor prose prose-stone prose-lg max-w-none space-y-8 text-foreground/80 leading-relaxed font-body">
          <div className="whitespace-pre-wrap">
            {displayContent}
          </div>
        </article>

        <footer className="pt-16 border-t border-primary/10 space-y-12">
          <div className="flex items-center justify-between">
            <Button variant="outline" className="gap-2 border-primary/10 text-muted-foreground rounded-full px-6" disabled>
              <ChevronLeft className="w-4 h-4" />
              {t.read.prev}
            </Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-md shadow-primary/10">
              {t.read.next}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm border border-primary/5 rounded-[2rem] p-10 text-center space-y-6 shadow-sm">
            <h3 className="font-headline text-3xl font-bold">{t.read.end}</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button onClick={handleLike} className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 h-12 shadow-lg shadow-primary/10 gap-2">
                <Heart className="w-4 h-4" />
                {t.read.appreciate}
              </Button>
              <Button variant="outline" className="border-primary/10 rounded-full px-8 h-12 gap-2 text-primary hover:bg-primary/5">
                <Share2 className="w-4 h-4" />
                {t.read.share}
              </Button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
