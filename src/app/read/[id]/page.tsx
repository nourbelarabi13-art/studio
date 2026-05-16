
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { NovelCard } from "@/components/novel-card";
import { 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Type, 
  Share2,
  Bookmark as BookmarkIcon,
  User,
  Heart,
  Eye,
  Loader2,
  Languages,
  Globe,
  Clock,
  Sun,
  Palette,
  Check,
  List,
  Sparkles
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useUser, useCollection } from "@/firebase";
import { doc, collection, query, where, limit, orderBy } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { incrementNovelView, toggleLikeNovel } from "@/firebase/firestore/novel-actions";
import { saveReadingProgress } from "@/firebase/firestore/reading-progress-actions";
import { toggleBookmark } from "@/firebase/firestore/bookmark-actions";
import { Novel, ReadingProgress, BookmarkCategory, UserProfile } from "@/lib/types";
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
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [useTranslation, setUseTranslation] = useState(false);
  
  const [fontSize, setFontSize] = useState(18);
  const [readingMode, setReadingMode] = useState<ReadingMode>('light');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showRestorePosition, setShowRestorePosition] = useState(false);
  const [savedPosition, setSavedPosition] = useState<number | null>(null);
  
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  const novelRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, "novels", id as string);
  }, [db, id]);

  const { data: novel, loading } = useDoc<Novel>(novelRef);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  const { data: currentUserProfile } = useDoc<UserProfile>(profileRef);

  const progressRef = useMemoFirebase(() => {
    if (!db || !user || !id) return null;
    return doc(db, "users", user.uid, "progress", id as string);
  }, [db, user, id]);
  const { data: cloudProgress } = useDoc<ReadingProgress>(progressRef);

  const bookmarkRef = useMemoFirebase(() => {
    if (!db || !user || !id) return null;
    return doc(db, "users", user.uid, "bookmarks", id as string);
  }, [db, user, id]);
  const { data: bookmarkData } = useDoc(bookmarkRef);

  const similarNovelsQuery = useMemoFirebase(() => {
    if (!db || !novel) return null;
    return query(
      collection(db, "novels"),
      where("isDraft", "==", false),
      where("genres", "array-contains-any", novel.genres),
      limit(4)
    );
  }, [db, novel]);
  const { data: similarNovels } = useCollection<Novel>(similarNovelsQuery);

  useEffect(() => {
    if (db && id) {
      incrementNovelView(db, id as string);
    }
  }, [db, id]);

  const updateProgress = useCallback((percentage: number, scrollY: number) => {
    if (!db || !user || !novel || !id) return;
    
    saveReadingProgress(db, {
      uid: user.uid,
      novelId: id as string,
      novelTitle: novel.title,
      coverImage: novel.coverImage,
      authorUsername: novel.authorUsername,
      percentage: Math.round(percentage),
      scrollPosition: scrollY,
      chapterIndex: currentChapterIndex
    });
  }, [db, user, novel, id, currentChapterIndex]);

  useEffect(() => {
    let lastSavedAt = 0;
    const saveThreshold = 5000; 

    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollProgress(scrolled);
      
      const now = Date.now();
      if (now - lastSavedAt > saveThreshold) {
        updateProgress(scrolled, winScroll);
        lastSavedAt = now;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [updateProgress]);

  useEffect(() => {
    if (!loading && (cloudProgress || id)) {
      const cloudPos = cloudProgress?.scrollPosition;
      const bestPos = cloudPos || null;

      if (bestPos && bestPos > 500) {
        setSavedPosition(bestPos);
        setShowRestorePosition(true);
        if (cloudProgress?.chapterIndex !== undefined) {
          setCurrentChapterIndex(cloudProgress.chapterIndex);
        }
      }
    }
  }, [id, loading, cloudProgress]);

  const restoreScrollPosition = () => {
    if (savedPosition !== null) {
      window.scrollTo({ top: savedPosition, behavior: 'smooth' });
      setShowRestorePosition(false);
    }
  };

  const handleLike = async () => {
    if (!user || !currentUserProfile) {
      toast({ title: "Identify Yourself", variant: "destructive" });
      return;
    }
    if (!db || !id) return;
    setIsLiking(true);
    await toggleLikeNovel(db, id as string, user.uid, currentUserProfile.username);
    setIsLiking(false);
  };

  const handleBookmark = async (category: BookmarkCategory) => {
    if (!user) {
      toast({ title: "Identify Yourself", variant: "destructive" });
      return;
    }
    if (!db || !id || !novel) return;
    setIsBookmarking(true);
    const added = await toggleBookmark(db, user.uid, id as string, {
      title: novel.title,
      coverImage: novel.coverImage,
      authorUsername: novel.authorUsername
    }, category);
    setIsBookmarking(false);
    
    toast({
      title: added ? "Chronicle Secured" : "Chronicle Released",
      description: added ? `Added to your ${category === 'favorite' ? 'Favorites' : 'Read Later'} collection.` : "Removed from your archive.",
    });
  };

  const activeChapter = useMemo(() => {
    if (novel?.chapters && novel.chapters.length > 0) {
      return novel.chapters[currentChapterIndex];
    }
    return null;
  }, [novel, currentChapterIndex]);

  const estimatedReadingTime = useMemo(() => {
    if (!novel) return 0;
    const content = activeChapter ? activeChapter.content : novel.content;
    const words = content ? content.split(/\s+/).length : 0;
    return Math.ceil(words / 200);
  }, [novel, activeChapter]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!novel) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-6">
      <h1 className="font-headline text-4xl font-bold">Chronicle Lost</h1>
      <Button onClick={() => router.push("/")} className="rounded-full bg-primary">Return to Sanctuary</Button>
    </div>
  );

  const hasTranslation = !!novel.translations?.[appLanguage];
  const displayTitle = (useTranslation && hasTranslation) ? novel.translations![appLanguage]!.title : (activeChapter?.title || novel.title);
  const displayContent = (useTranslation && hasTranslation) ? novel.translations![appLanguage]!.content : (activeChapter?.content || novel.content);
  const isRtl = (useTranslation && hasTranslation) ? (appLanguage === 'ar') : (novel.language === 'ar');

  const modeStyles = {
    light: "bg-[#fffafa] text-[#2c1818]",
    pink: "bg-[#fdf2f5] text-[#4a1523]",
    lavender: "bg-[#f7f2fd] text-[#26154a]"
  };

  return (
    <div className={cn("min-h-screen transition-colors duration-500", modeStyles[readingMode])}>
      <Navbar />
      
      <div className="fixed top-16 left-0 w-full h-1 z-50 bg-primary/10">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
      </div>

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
              <Badge key={genre} variant="outline" className="border-primary/30 text-primary italic rounded-full bg-primary/5 px-4 h-6">
                {genre}
              </Badge>
            ))}
          </div>
          
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            {displayTitle}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground italic">
            <Link href={`/profile/${novel.authorId}`} className="flex items-center gap-3 text-foreground font-semibold hover:text-primary transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <User className="w-4 h-4" />
              </div>
              {novel.authorUsername}
            </Link>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary/40" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {estimatedReadingTime} {t.read.reading_time}
              </span>
            </div>
          </div>
        </header>

        <div className="sticky top-24 z-40 flex flex-col items-center gap-4">
          <div className="glass-morphism border-primary/10 rounded-full px-6 py-2.5 flex items-center gap-4 shadow-xl backdrop-blur-md">
            {novel.chapters && novel.chapters.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-primary">
                    <List className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border-primary/10 rounded-2xl w-64 p-2">
                  {novel.chapters.map((chap, idx) => (
                    <DropdownMenuItem 
                      key={chap.id} 
                      onClick={() => { setCurrentChapterIndex(idx); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={cn("rounded-xl cursor-pointer gap-3", currentChapterIndex === idx && "bg-primary/5 text-primary")}
                    >
                      <span className="text-[10px] font-bold opacity-30"># {idx + 1}</span>
                      <span className="font-headline text-sm truncate">{chap.title}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {hasTranslation && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setUseTranslation(!useTranslation)}
                className="rounded-full text-primary gap-2 h-10 px-4 hover:bg-primary/5"
              >
                <Languages className="w-4 h-4" />
                <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider">
                  {useTranslation ? t.read.original_toggle : t.read.translate_toggle}
                </span>
              </Button>
            )}

            <div className="w-px h-6 bg-primary/10 mx-1 hidden sm:block" />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary">
                  <Palette className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-6 rounded-[2rem] border-primary/10 bg-white/95 backdrop-blur-lg">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.read.reading_mode}</p>
                    <div className="flex gap-2">
                      {[
                        { id: 'light', color: 'bg-[#fffafa]', label: t.read.mode_light },
                        { id: 'pink', color: 'bg-[#fdf2f5]', label: t.read.mode_pink },
                        { id: 'lavender', color: 'bg-[#f7f2fd]', label: t.read.mode_lavender }
                      ].map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => setReadingMode(mode.id as ReadingMode)}
                          className={cn(
                            "flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                            readingMode === mode.id ? "border-primary bg-primary/5" : "border-primary/10"
                          )}
                        >
                          <div className={cn("w-6 h-6 rounded-full border border-primary/10", mode.color)}>
                            {readingMode === mode.id && <Check className="w-3 h-3 text-primary mx-auto mt-1" />}
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-tight">{mode.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.read.font_size}</p>
                      <span className="text-xs font-mono">{fontSize}px</span>
                    </div>
                    <Slider value={[fontSize]} onValueChange={(val) => setFontSize(val[0])} min={14} max={28} step={1} />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("h-10 w-10 rounded-full", bookmarkData ? "text-primary" : "text-muted-foreground hover:text-primary")}>
                  {bookmarkData ? (
                    bookmarkData.category === 'favorite' ? <Heart className="w-5 h-5 fill-primary" /> : <BookmarkIcon className="w-5 h-5 fill-primary" />
                  ) : (
                    <BookmarkIcon className="w-5 h-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-primary/10 rounded-2xl w-48 p-2">
                <DropdownMenuItem onClick={() => handleBookmark('favorite')} className="gap-3 cursor-pointer rounded-xl">
                  <Heart className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold">Add to Favorites</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBookmark('read-later')} className="gap-3 cursor-pointer rounded-xl">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-xs font-bold">Read Later</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={handleLike} disabled={isLiking} className={cn("h-10 w-10 rounded-full", isLiking ? "animate-pulse" : "text-muted-foreground hover:text-primary")}>
              <Heart className={cn("w-5 h-5", (novel.likes > 0) && "fill-primary text-primary")} />
            </Button>
          </div>
        </div>

        <article 
          className={cn("prose prose-stone max-w-none transition-all duration-300", isRtl && "text-right")}
          dir={isRtl ? 'rtl' : 'ltr'}
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.8, color: 'inherit' }}
        >
          <div className="whitespace-pre-wrap space-y-10 font-body opacity-90 leading-relaxed">
            {displayContent}
          </div>
        </article>

        <footer className="pt-24 border-t border-primary/10 space-y-16">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              className="gap-3 border-primary/10 text-muted-foreground rounded-full px-8 h-12 hover:bg-primary/5"
              disabled={currentChapterIndex === 0}
              onClick={() => { setCurrentChapterIndex(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <ChevronLeft className="w-4 h-4" />
              {t.read.prev}
            </Button>
            <Button 
              className="gap-3 bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-12 shadow-xl"
              disabled={!novel.chapters || currentChapterIndex === (novel.chapters.length - 1)}
              onClick={() => { setCurrentChapterIndex(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
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
              <Button onClick={handleLike} className="bg-primary text-white hover:bg-primary/90 rounded-full px-10 h-14 font-headline text-lg shadow-xl gap-3">
                <Heart className="w-5 h-5" />
                {t.read.appreciate}
              </Button>
              <Button variant="outline" className="border-primary/20 rounded-full px-10 h-14 gap-3 text-primary hover:bg-primary/5 font-headline text-lg">
                <Share2 className="w-5 h-5" />
                {t.read.share}
              </Button>
            </div>
          </div>

          {similarNovels && similarNovels.length > 1 && (
            <section className="space-y-8 pt-16">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-headline text-2xl font-bold italic">Similar Chronicles</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarNovels
                  .filter(n => n.id !== id)
                  .slice(0, 4)
                  .map(similarNovel => (
                    <NovelCard key={similarNovel.id} novel={similarNovel} />
                  ))}
              </div>
            </section>
          )}
        </footer>
      </main>
    </div>
  );
}
