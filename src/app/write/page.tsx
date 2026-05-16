
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Genre, AppLanguage, Chapter } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Save, 
  Send, 
  Sparkles, 
  Trash2, 
  Zap,
  Loader2,
  Image as ImageIcon,
  Wand2,
  Globe,
  Plus,
  ChevronUp,
  ChevronDown,
  Book,
  Clock,
  Layout,
  FileText
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { suggestGenres } from "@/ai/flows/ai-genre-suggestion-flow";
import { checkContentSafety } from "@/ai/flows/ai-content-safety-check-flow";
import { suggestStorySpark } from "@/ai/flows/ai-story-spark-flow";
import { generateCover } from "@/ai/flows/ai-cover-generator-flow";
import { translateStory } from "@/ai/flows/translate-story-flow";
import { cn } from "@/lib/utils";
import { useFirestore, useUser, useDoc } from "@/firebase";
import { collection, addDoc, doc, updateDoc, getDocs, query, where, increment } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { useLanguage } from "@/lib/i18n/context";
import { createNotification } from "@/firebase/firestore/notification-actions";
import { checkAchievements } from "@/firebase/firestore/achievement-actions";

const AVAILABLE_GENRES: Genre[] = ['Fantasy', 'Horror', 'Romance', 'Mystery', 'Drama', 'Sci-Fi'];

export default function WritePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const { t, language: appLanguage } = useLanguage();
  
  const profileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, "users", user.uid);
  }, [user, db]);
  const { data: profile } = useDoc(profileRef);

  // Novel State
  const [novelId, setNovelId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [writingLanguage, setWritingLanguage] = useState<AppLanguage>(appLanguage);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [coverImage, setCoverImage] = useState(PlaceHolderImages[0].imageUrl);
  
  // Chapter State
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: 'chap-1', title: 'Chapter 1', content: '', order: 0 }
  ]);
  const [activeChapterId, setActiveChapterId] = useState('chap-1');
  
  // UI State
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [isManifestingIllustration, setIsManifestingIllustration] = useState(false);
  const [manifestPrompt, setManifestPrompt] = useState("");
  const [showManifestDialog, setShowManifestDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSparking, setIsSparking] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];

  // Stats
  const totalWordCount = useMemo(() => {
    return chapters.reduce((acc, chap) => acc + (chap.content ? chap.content.split(/\s+/).filter(Boolean).length : 0), 0);
  }, [chapters]);

  const estimatedReadingTime = useMemo(() => Math.ceil(totalWordCount / 200), [totalWordCount]);
  
  const manifestProgress = useMemo(() => {
    const minWordsPerChapter = 200;
    const progress = Math.min(100, (totalWordCount / (chapters.length * minWordsPerChapter)) * 100);
    return progress;
  }, [totalWordCount, chapters.length]);

  // Handlers
  const handleChapterTitleChange = (newTitle: string) => {
    setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, title: newTitle } : c));
  };

  const handleChapterContentChange = (newContent: string) => {
    setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: newContent } : c));
  };

  const addChapter = () => {
    const newId = `chap-${Date.now()}`;
    const newChapter: Chapter = {
      id: newId,
      title: `Chapter ${chapters.length + 1}`,
      content: '',
      order: chapters.length
    };
    setChapters(prev => [...prev, newChapter]);
    setActiveChapterId(newId);
  };

  const removeChapter = (id: string) => {
    if (chapters.length === 1) return;
    setChapters(prev => prev.filter(c => c.id !== id));
    if (activeChapterId === id) {
      setActiveChapterId(chapters.find(c => c.id !== id)?.id || '');
    }
  };

  const moveChapter = (index: number, direction: 'up' | 'down') => {
    const newChapters = [...chapters];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newChapters.length) return;
    
    [newChapters[index], newChapters[targetIndex]] = [newChapters[targetIndex], newChapters[index]];
    setChapters(newChapters.map((c, i) => ({ ...c, order: i })));
  };

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user && db && (title || totalWordCount > 0)) {
        saveProgress(true);
      }
    }, 15000); 
    return () => clearTimeout(timer);
  }, [title, chapters, selectedGenres, coverImage, writingLanguage]);

  const saveProgress = async (isAuto = false) => {
    if (!user || !db) return;
    if (!isAuto) setIsSaving(true);

    const novelData = {
      title: title || "Untitled Dream",
      content: chapters.map(c => c.content).join('\n\n'), 
      chapters,
      authorId: user.uid,
      authorUsername: profile?.username || "Dreamer",
      genres: selectedGenres,
      coverImage,
      isDraft: true,
      createdAt: new Date().toISOString(),
      publishedAt: null,
      views: 0,
      likes: 0,
      language: writingLanguage
    };

    try {
      if (novelId) {
        await updateDoc(doc(db, "novels", novelId), novelData);
      } else {
        const ref = await addDoc(collection(db, "novels"), novelData);
        setNovelId(ref.id);
      }
      setLastSaved(new Date());
      if (!isAuto) toast({ title: "Draft Saved", description: "Your manifestation is secure." });
    } catch (e) {
      if (!isAuto) toast({ title: "Save Failed", variant: "destructive" });
    } finally {
      if (!isAuto) setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!user || !db) return;
    if (!totalWordCount || !title || selectedGenres.length === 0) {
      toast({ title: "Forge Incomplete", description: "Ensure your title, genres, and words are ready.", variant: "destructive" });
      return;
    }
    
    setIsPublishing(true);
    try {
      const fullContent = chapters.map(c => `## ${c.title}\n\n${c.content}`).join('\n\n');
      
      const safetyResult = await checkContentSafety({ novelTitle: title, novelContent: fullContent });
      if (!safetyResult.isSafe) {
        toast({ title: "Safety Alert", description: safetyResult.reasons[0], variant: "destructive" });
        setIsPublishing(false);
        return;
      }

      const targetLanguages = (['en', 'ar', 'fr'] as AppLanguage[]).filter(l => l !== writingLanguage);
      const translationResult = await translateStory({ title, content: fullContent, targetLanguages });

      const novelData = {
        title, 
        content: fullContent,
        chapters,
        authorId: user.uid, 
        authorUsername: profile?.username || "Dreamer",
        genres: selectedGenres, 
        coverImage, 
        isDraft: false, 
        createdAt: new Date().toISOString(), 
        publishedAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        language: writingLanguage,
        translations: translationResult.translations
      };

      let finalId = novelId;
      if (novelId) {
        await updateDoc(doc(db, "novels", novelId), novelData);
      } else {
        const ref = await addDoc(collection(db, "novels"), novelData);
        finalId = ref.id;
      }

      // Update published count and check achievements
      await updateDoc(doc(db, "users", user.uid), {
        publishedCount: increment(1)
      });
      await checkAchievements(db, user.uid);
      
      // Notify followers
      const followersQuery = query(collection(db, "follows"), where("followingId", "==", user.uid));
      const followersSnap = await getDocs(followersQuery);
      followersSnap.forEach(followerDoc => {
        const followerId = followerDoc.data().followerId;
        createNotification(db, followerId, {
          type: 'story',
          message: `${profile?.username} published a new chronicle: "${title}"`,
          fromUserId: user.uid,
          fromUserName: profile?.username,
          targetId: finalId || ""
        });
      });

      toast({ title: "Manifested", description: "Your story is now part of the archive." });
      router.push("/vault");
    } catch (error) { 
      toast({ title: "Ritual Interrupted", description: "The publishing failed.", variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSuggestGenres = async () => {
    const fullContent = chapters.map(c => c.content).join('\n\n');
    if (!fullContent || !title) return;
    setIsAnalyzing(true);
    try {
      const result = await suggestGenres({ title, storyContent: fullContent });
      setSelectedGenres(result.suggestedGenres as Genre[]);
    } catch (error) {
      toast({ title: "Oracle Silent", variant: "destructive" });
    } finally { setIsAnalyzing(false); }
  };

  const handleStorySpark = async () => {
    setIsSparking(true);
    try {
      const result = await suggestStorySpark({ title, currentContent: activeChapter.content });
      toast({ title: "A Spark Appears", description: result.spark, duration: 8000 });
    } catch (error) {
      toast({ title: "Mist Lost", variant: "destructive" });
    } finally { setIsSparking(false); }
  };

  const isRtl = writingLanguage === 'ar';

  return (
    <div className="min-h-screen bg-[#fffcfc] flex flex-col">
      <Navbar />
      
      <div className="sticky top-16 z-30 w-full glass-morphism border-b border-primary/10 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
            <Clock className="w-3.5 h-3.5 text-primary/40" />
            {lastSaved ? `Last saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Drafting...'}
          </div>
          <div className="h-4 w-px bg-primary/10" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <FileText className="w-3 h-3" />
              {totalWordCount} words
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Clock className="w-3 h-3" />
              {estimatedReadingTime} min read
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="rounded-full gap-2 text-primary hover:bg-primary/5" onClick={handleStorySpark} disabled={isSparking}>
            {isSparking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Spark</span>
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full gap-2 text-muted-foreground hover:bg-primary/5" onClick={() => saveProgress()} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Save Draft</span>
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing} className="rounded-full bg-primary hover:bg-primary/90 px-6 gap-2 shadow-lg shadow-primary/10">
            {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Publish
          </Button>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid lg:grid-cols-[280px_1fr_300px] gap-12 items-start">
          
          <aside className="space-y-6 lg:sticky lg:top-36">
            <div className="glass-morphism rounded-[2rem] p-6 border-primary/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline text-lg font-bold flex items-center gap-2">
                  <Layout className="w-4 h-4 text-primary" />
                  Chronicle Fragments
                </h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary hover:bg-primary/5" onClick={addChapter}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {chapters.map((chap, idx) => (
                  <div 
                    key={chap.id}
                    className={cn(
                      "group relative flex items-center gap-2 p-3 rounded-2xl transition-all border",
                      activeChapterId === chap.id 
                        ? "bg-primary/5 border-primary/20 shadow-sm" 
                        : "bg-white/40 border-transparent hover:bg-primary/5"
                    )}
                  >
                    <button 
                      onClick={() => setActiveChapterId(chap.id)}
                      className="flex-1 text-left truncate"
                    >
                      <p className={cn("text-sm font-bold truncate", activeChapterId === chap.id ? "text-primary" : "text-muted-foreground")}>
                        {chap.title || "Untitled Fragment"}
                      </p>
                      <p className="text-[9px] text-muted-foreground/40 font-mono">
                        {chap.content ? chap.content.split(/\s+/).filter(Boolean).length : 0} words
                      </p>
                    </button>
                    
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => moveChapter(idx, 'up')} disabled={idx === 0}>
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => moveChapter(idx, 'down')} disabled={idx === chapters.length - 1}>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/40 hover:text-destructive" onClick={() => removeChapter(chap.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-morphism rounded-[2rem] p-6 border-primary/10 space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Manifestation Progress</h4>
              <Progress value={manifestProgress} className="h-1.5 bg-primary/5" />
              <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                Aim for at least 200 words per fragment to ensure a rich reading experience.
              </p>
            </div>
          </aside>

          <div className="space-y-12 min-h-[80vh]">
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative w-32 h-44 rounded-2xl overflow-hidden cursor-pointer group border-2 border-dashed border-primary/10 hover:border-primary/40 transition-all shadow-sm shrink-0" onClick={() => setShowImageSelector(true)}>
                  <Image src={coverImage} alt="Cover" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/20">
                    <ImageIcon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1 w-full space-y-4">
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Untethered Dream..." 
                    className="bg-transparent border-none text-5xl md:text-7xl font-headline font-bold focus-visible:ring-0 px-0 placeholder:opacity-10 h-auto text-foreground" 
                  />
                  <div className="flex items-center gap-4">
                    <Input
                      value={activeChapter.title}
                      onChange={(e) => handleChapterTitleChange(e.target.value)}
                      placeholder="Fragment Title..."
                      className="bg-primary/5 border-none h-10 px-4 rounded-full text-lg font-headline italic focus-visible:ring-0 w-64"
                    />
                    <Badge variant="outline" className="rounded-full border-primary/20 text-primary uppercase text-[9px] tracking-widest px-4 h-6">
                      Chapter {chapters.findIndex(c => c.id === activeChapterId) + 1}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="relative" dir={isRtl ? 'rtl' : 'ltr'}>
                <Textarea 
                  value={activeChapter.content} 
                  onChange={(e) => handleChapterContentChange(e.target.value)} 
                  placeholder="Begin manifesting your thoughts..." 
                  className={cn(
                    "writing-editor min-h-[60vh] bg-transparent border-none resize-none focus-visible:ring-0 p-0 placeholder:italic placeholder:opacity-10 text-xl leading-relaxed text-foreground/80",
                    isRtl && "text-right"
                  )} 
                />
              </div>
            </div>
          </div>

          <aside className="space-y-8 lg:sticky lg:top-36">
            <div className="glass-morphism rounded-[2rem] p-7 space-y-6 border-primary/10">
              <h3 className="font-headline text-xl font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Forge Context
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Archive Tongue</label>
                  <Select value={writingLanguage} onValueChange={(val) => setWritingLanguage(val as AppLanguage)}>
                    <SelectTrigger className="w-full rounded-2xl bg-white border-primary/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-primary/10 rounded-2xl">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Genre Essence</label>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10 rounded-full" onClick={handleSuggestGenres} disabled={isAnalyzing}>
                      <Sparkles className={cn("w-3 h-3", isAnalyzing && "animate-spin")} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_GENRES.map(genre => (
                      <Badge 
                        key={genre} 
                        variant={selectedGenres.includes(genre) ? "default" : "outline"} 
                        className={cn(
                          "cursor-pointer rounded-full text-[9px] font-bold uppercase tracking-wider h-7 px-3",
                          selectedGenres.includes(genre) ? "bg-primary border-none" : "border-primary/10 text-muted-foreground hover:border-primary/30"
                        )}
                        onClick={() => setSelectedGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev.slice(-2), genre])}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-2xl gap-2 border-primary/10 text-primary hover:bg-primary/5"
                  onClick={() => setShowManifestDialog(true)}
                >
                  <Wand2 className="w-4 h-4" />
                  Manifest AI Cover
                </Button>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 text-center space-y-2">
              <Sparkles className="w-5 h-5 text-primary mx-auto opacity-40" />
              <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                "Words are seeds. Water them with focus, and watch your garden grow."
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Dialog open={showManifestDialog} onOpenChange={setShowManifestDialog}>
        <DialogContent className="bg-white rounded-[2.5rem] p-10 max-w-md border-primary/10">
          <DialogHeader>
            <DialogTitle className="font-headline text-3xl text-primary">Manifest Art</DialogTitle>
            <DialogDescription className="italic">Describe the atmosphere of your dream.</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Textarea 
              placeholder="e.g., A library floating in the lavender clouds of dawn..." 
              value={manifestPrompt}
              onChange={(e) => setManifestPrompt(e.target.value)}
              className="bg-primary/5 border-primary/10 rounded-2xl min-h-[120px] resize-none p-6"
            />
          </div>
          <DialogFooter>
            <Button 
              onClick={async () => {
                if (!title || !manifestPrompt) return;
                setIsManifestingIllustration(true);
                try {
                  const res = await generateCover({ title, prompt: manifestPrompt });
                  setCoverImage(res.imageUrl);
                  setShowManifestDialog(false);
                  toast({ title: "Art Manifested" });
                } catch (e) {
                  toast({ title: "Manifestation Failed", variant: "destructive" });
                } finally { setIsManifestingIllustration(false); }
              }} 
              disabled={isManifestingIllustration || !manifestPrompt.trim()}
              className="w-full h-14 bg-primary hover:bg-primary/90 rounded-full font-headline text-lg shadow-xl"
            >
              {isManifestingIllustration ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              Manifest Illustration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
