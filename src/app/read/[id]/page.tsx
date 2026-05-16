
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
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
  Languages,
  Globe,
  Clock,
  Sun,
  Palette,
  Check
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { incrementNovelView, toggleLikeNovel } from "@/firebase/firestore/novel-actions";
import { Novel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

type ReadingMode = 'light' | 'pink' | 'lavender';

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
  
  // Custom reading controls
  const [fontSize, setFontSize] = useState(18);
  const [readingMode, setReadingMode] = useState<ReadingMode>('light');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showRestorePosition, setShowRestorePosition] = useState(false);
  const [savedPosition, setSavedPosition] = useState<number | null>(null);

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

  // Handle scroll progress and save position
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
      
      // Periodically save scroll position to local storage
      if (id) {
        localStorage.setItem(`read-pos-${id}`, winScroll.toString());
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [id]);

  // Check for saved position on mount
  useEffect(() => {
    if (id) {
      const pos = localStorage.getItem(`read-pos-${id}`);
      if (pos && parseInt(pos) > 500) {
        setSavedPosition(parseInt(pos));
        setShowRestorePosition(true);
      }
    }
  }, [id, loading]);

  const restoreScrollPosition = () => {
    if (savedPosition !== null) {
      window.scrollTo({ top: savedPosition, behavior: 'smooth' });
      setShowRestorePosition(false);
    }
  };

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

  const estimatedReadingTime = useMemo(() => {
    if (!novel) return 0;
    const words = novel.content.split(/\s+/).length;
    return Math.ceil(words / 200); // 200 wpm average
  }, [novel]);

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
  const displayLang = (useTranslation && hasTranslation) ? appLanguage : novel.language;
  const isRtl = displayLang === 'ar';

  const modeStyles = {
    light: "bg-[#fff9f9] text-[#2c1818]",
    pink: "bg-[#fdf2f5] text-[#4a1523]",
    lavender: "bg-[#f7f2fd] text-[#26154a]"
  };

  return (
    <div className={cn("min-h-screen transition-colors duration-500", modeStyles[readingMode])}>
      <Navbar />
      
      {/* Scroll Progress Bar */}
      <div className="fixed top-16 left-0 w-full h-1 z-50 bg-primary/10">
        <div 
          className="h-full bg-primary transition-all duration-300" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Restore Position Alert */}
      {showRestorePosition && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="glass-morphism rounded-2xl p-4 px-6 flex items-center gap-4 shadow-2xl border-primary/20 backdrop-blur-xl">
            <div className="space-y-0.5">
              <p className="text-sm font-bold">{t.read.continue}</p>
              <p className="text-xs text-muted-foreground italic">{t.read.continue_desc}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="text-xs rounded-full" onClick={() => setShowRestorePosition(false)}>Dismiss</Button>
              <Button size="sm" className="text-xs rounded-full bg-primary" onClick={restoreScrollPosition}>{t.read.restore}</Button>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-16 max-w-3xl space-y-16 animate-fade-in">
        <header className="space-y-8 text-center border-b border-primary/10 pb-16">
          <div className="flex justify-center gap-3 mb-4">
            {novel.genres.map(genre => (
              <Badge key={genre} variant="outline" className="border-primary/30 text-primary italic rounded-full bg-primary/5 px-4">
                {genre}
              </Badge>
            ))}
            <Badge variant="outline" className="border-primary/10 text-muted-foreground italic rounded-full bg-white/50 flex gap-1.5 items-center px-4">
              <Globe className="w-3 h-3" />
              {novel.language === 'ar' ? 'العربية' : novel.language === 'fr' ? 'Français' : 'English'}
            </Badge>
          </div>
          
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight leading-tight transition-all">
            {displayTitle}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground italic">
            <div className="flex items-center gap-3 text-foreground font-semibold">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <User className="w-4 h-4" />
              </div>
              {novel.authorUsername}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary/40" />
              <span className="text-xs font-bold uppercase tracking-widest">
                {estimatedReadingTime} {t.read.reading_time}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                <Eye className="w-4 h-4 opacity-40" />
                {novel.views || 0}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                <Heart className="w-4 h-4 fill-primary/10" />
                {novel.likes || 0}
              </div>
            </div>
          </div>
        </header>

        {/* Floating Controls */}
        <div className="sticky top-24 z-40 flex flex-col items-center gap-4">
          <div className="glass-morphism border-primary/10 rounded-full px-6 py-2.5 flex items-center gap-4 shadow-xl backdrop-blur-md">
            {hasTranslation && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setUseTranslation(!useTranslation)}
                className="rounded-full text-primary gap-2 h-10 px-4 hover:bg-primary/5"
              >
                <Languages className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
                  {useTranslation ? t.read.original_toggle : t.read.translate_toggle}
                </span>
              </Button>
            )}

            <div className="w-px h-6 bg-primary/10 mx-1 hidden sm:block" />

            {/* Reading Modes & Font Control */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary">
                  <Palette className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-6 rounded-[2rem] border-primary/10 bg-white/95 backdrop-blur-lg">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t.read.reading_mode}</p>
                    <div className="flex gap-2">
                      {[
                        { id: 'light', color: 'bg-white', label: t.read.mode_light },
                        { id: 'pink', color: 'bg-[#fdf2f5]', label: t.read.mode_pink },
                        { id: 'lavender', color: 'bg-[#f7f2fd]', label: t.read.mode_lavender }
                      ].map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => setReadingMode(mode.id as ReadingMode)}
                          className={cn(
                            "flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                            readingMode === mode.id ? "border-primary bg-primary/5" : "border-primary/10 hover:border-primary/30"
                          )}
                        >
                          <div className={cn("w-6 h-6 rounded-full border border-primary/10", mode.color)}>
                            {readingMode === mode.id && <Check className="w-3 h-3 text-primary mx-auto mt-1" />}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-tight">{mode.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t.read.font_size}</p>
                      <span className="text-xs font-mono">{fontSize}px</span>
                    </div>
                    <Slider 
                      value={[fontSize]} 
                      onValueChange={(val) => setFontSize(val[0])} 
                      min={14} 
                      max={28} 
                      step={1}
                      className="py-2"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLike}
              disabled={isLiking}
              className={cn("h-10 w-10 rounded-full transition-colors", isLiking ? "animate-pulse" : "text-muted-foreground hover:text-primary")}
            >
              <Heart className={cn("w-5 h-5", isLiking && "fill-primary")} />
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full">
                  <Flag className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-primary/10 rounded-[2.5rem] p-10">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl">{t.read.report}</DialogTitle>
                  <DialogDescription className="italic">Help us keep the sanctuary safe for all dreamers.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-6">
                  <Textarea 
                    placeholder="Describe the transgression..." 
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="bg-muted/30 border-primary/10 rounded-2xl min-h-[120px]"
                  />
                </div>
                <DialogFooter>
                  <Button variant="ghost" className="rounded-full px-8" onClick={() => setReportReason("")}>Cancel</Button>
                  <Button onClick={handleReport} className="bg-destructive hover:bg-destructive/90 text-white rounded-full px-8 shadow-lg shadow-destructive/20">Send Report</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <article 
          className={cn(
            "prose prose-stone max-w-none transition-all duration-300",
            isRtl && "text-right"
          )}
          dir={isRtl ? 'rtl' : 'ltr'}
          style={{ 
            fontSize: `${fontSize}px`, 
            lineHeight: 1.8,
            color: 'inherit'
          }}
        >
          <div className="whitespace-pre-wrap space-y-10 font-body opacity-90">
            {displayContent}
          </div>
        </article>

        <footer className="pt-24 border-t border-primary/10 space-y-16">
          <div className="flex items-center justify-between">
            <Button variant="outline" className="gap-3 border-primary/10 text-muted-foreground rounded-full px-8 h-12 hover:bg-primary/5" disabled>
              <ChevronLeft className="w-4 h-4" />
              {t.read.prev}
            </Button>
            <Button className="gap-3 bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-12 shadow-xl shadow-primary/20">
              {t.read.next}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="bg-white/40 backdrop-blur-md border border-primary/10 rounded-[3rem] p-12 text-center space-y-8 shadow-sm">
            <div className="space-y-2">
              <h3 className="font-headline text-4xl font-bold">{t.read.end}</h3>
              <p className="text-muted-foreground italic">Your presence brought life to this chronicle.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <Button onClick={handleLike} className="bg-primary text-white hover:bg-primary/90 rounded-full px-10 h-14 font-headline text-lg shadow-xl shadow-primary/20 gap-3 group">
                <Heart className="w-5 h-5 transition-transform group-hover:scale-125" />
                {t.read.appreciate}
              </Button>
              <Button variant="outline" className="border-primary/20 rounded-full px-10 h-14 gap-3 text-primary hover:bg-primary/5 font-headline text-lg backdrop-blur-sm">
                <Share2 className="w-5 h-5" />
                {t.read.share}
              </Button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
