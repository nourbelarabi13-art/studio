
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Genre, AppLanguage, Chapter, StoryPoll } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
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
  Layout,
  FileText,
  Clock,
  MapPin,
  ListTodo
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
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { useLanguage } from "@/lib/i18n/context";
import { createNotification } from "@/firebase/firestore/notification-actions";
import { checkAchievements } from "@/firebase/firestore/achievement-actions";

const AVAILABLE_GENRES: Genre[] = ['Fantasy', 'Horror', 'Romance', 'Mystery', 'Drama', 'Sci-Fi'];
const COUNTRIES = [
  "Morocco", "France", "United Kingdom", "Egypt", "Saudi Arabia", "United States", "Canada", "Other"
];

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
  const [writingCountry, setWritingCountry] = useState<string>("Morocco");
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [coverImage, setCoverImage] = useState(PlaceHolderImages[0].imageUrl);
  
  // Chapter State
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: 'chap-1', title: 'Chapter 1', content: '', order: 0 }
  ]);
  const [activeChapterId, setActiveChapterId] = useState('chap-1');

  // Poll State
  const [isPollEnabled, setIsPollEnabled] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["Choice A", "Choice B"]);
  
  // UI State
  const [showManifestDialog, setShowManifestDialog] = useState(false);
  const [isManifestingIllustration, setIsManifestingIllustration] = useState(false);
  const [manifestPrompt, setManifestPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSparking, setIsSparking] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];

  const totalWordCount = useMemo(() => {
    return chapters.reduce((acc, chap) => acc + (chap.content ? chap.content.split(/\s+/).filter(Boolean).length : 0), 0);
  }, [chapters]);

  const estimatedReadingTime = useMemo(() => Math.ceil(totalWordCount / 200), [totalWordCount]);

  const handleChapterTitleChange = (newTitle: string) => {
    setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, title: newTitle } : c));
  };

  const handleChapterContentChange = (newContent: string) => {
    setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: newContent } : c));
  };

  const addChapter = () => {
    const newId = `chap-${Date.now()}`;
    const newChapter: Chapter = { id: newId, title: `Chapter ${chapters.length + 1}`, content: '', order: chapters.length };
    setChapters(prev => [...prev, newChapter]);
    setActiveChapterId(newId);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user && db && (title || totalWordCount > 0)) saveProgress(true);
    }, 15000); 
    return () => clearTimeout(timer);
  }, [title, chapters, selectedGenres, coverImage, writingLanguage, writingCountry, isPollEnabled, pollQuestion, pollOptions]);

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
      language: writingLanguage,
      country: writingCountry,
      poll: isPollEnabled ? { question: pollQuestion, options: pollOptions, active: true } : null
    };

    try {
      if (novelId) {
        await updateDoc(doc(db, "novels", novelId), novelData);
      } else {
        const ref = await addDoc(collection(db, "novels"), novelData);
        setNovelId(ref.id);
      }
      setLastSaved(new Date());
    } catch (e) {
      if (!isAuto) toast({ title: "Save Failed", variant: "destructive" });
    } finally {
      if (!isAuto) setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!user || !db) return;
    if (!totalWordCount || !title || selectedGenres.length === 0) {
      toast({ title: "Forge Incomplete", description: "Ensure title, genres, and words are manifested.", variant: "destructive" });
      return;
    }
    
    setIsPublishing(true);
    try {
      const fullContent = chapters.map(c => `## ${c.title}\n\n${c.content}`).join('\n\n');
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
        country: writingCountry,
        translations: translationResult.translations,
        poll: isPollEnabled ? { question: pollQuestion, options: pollOptions, active: true } : null
      };

      let finalId = novelId;
      if (novelId) {
        await updateDoc(doc(db, "novels", novelId), novelData);
      } else {
        const ref = await addDoc(collection(db, "novels"), novelData);
        finalId = ref.id;
      }

      await updateDoc(doc(db, "users", user.uid), { publishedCount: increment(1) });
      await checkAchievements(db, user.uid);
      
      const followersQuery = query(collection(db, "follows"), where("followingId", "==", user.uid));
      const followersSnap = await getDocs(followersQuery);
      followersSnap.forEach(followerDoc => {
        createNotification(db, followerDoc.data().followerId, {
          type: 'story',
          message: `${profile?.username} published a new chronicle: "${title}"`,
          fromUserId: user.uid,
          fromUserName: profile?.username,
          targetId: finalId || ""
        });
      });

      toast({ title: "Manifested", description: "Your story is now part of the global Archive." });
      router.push("/vault");
    } catch (error) { 
      toast({ title: "Ritual Interrupted", variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
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
          <div className="flex items-center gap-4 ml-6">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> {totalWordCount} words
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="rounded-full gap-2 text-primary" onClick={() => saveProgress()} disabled={isSaving}>
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing} className="rounded-full bg-primary hover:bg-primary/90 px-8 shadow-lg shadow-primary/10">
            {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Publish
          </Button>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid lg:grid-cols-[280px_1fr_300px] gap-12">
          <aside className="space-y-6">
            <div className="glass-morphism rounded-[2rem] p-6 border-primary/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline text-lg font-bold flex items-center gap-2"><Layout className="w-4 h-4 text-primary" /> Fragments</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary" onClick={addChapter}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-2">
                {chapters.map((chap) => (
                  <div key={chap.id} className={cn("p-3 rounded-2xl border cursor-pointer transition-all", activeChapterId === chap.id ? "bg-primary/5 border-primary/20" : "border-transparent hover:bg-primary/5")} onClick={() => setActiveChapterId(chap.id)}>
                    <p className={cn("text-sm font-bold truncate", activeChapterId === chap.id ? "text-primary" : "text-muted-foreground")}>{chap.title || "Untitled"}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-12 min-h-[80vh]">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative w-32 h-44 rounded-2xl overflow-hidden cursor-pointer group border-2 border-dashed border-primary/10" onClick={() => setShowManifestDialog(true)}>
                <Image src={coverImage} alt="Cover" fill className="object-cover opacity-80" />
              </div>
              <div className="flex-1 w-full space-y-4">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untethered Dream..." className="bg-transparent border-none text-5xl font-headline font-bold focus-visible:ring-0 px-0 h-auto" />
                <Input value={activeChapter.title} onChange={(e) => handleChapterTitleChange(e.target.value)} placeholder="Fragment Title..." className="bg-primary/5 border-none h-10 px-4 rounded-full text-lg font-headline italic" />
              </div>
            </div>
            <Textarea value={activeChapter.content} onChange={(e) => handleChapterContentChange(e.target.value)} placeholder="Manifest your thoughts..." className={cn("writing-editor min-h-[60vh] bg-transparent border-none resize-none focus-visible:ring-0 p-0 text-xl", isRtl && "text-right")} dir={isRtl ? 'rtl' : 'ltr'} />
          </div>

          <aside className="space-y-8">
            <div className="glass-morphism rounded-[2rem] p-7 space-y-6 border-primary/10">
              <h3 className="font-headline text-xl font-bold flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Context</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Story Language</label>
                  <Select value={writingLanguage} onValueChange={(val) => setWritingLanguage(val as AppLanguage)}>
                    <SelectTrigger className="rounded-2xl border-primary/10"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white rounded-2xl">
                      <SelectItem value="en">English 🇬🇧</SelectItem>
                      <SelectItem value="ar">العربية 🇸🇦</SelectItem>
                      <SelectItem value="fr">Français 🇫🇷</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Genres</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_GENRES.map(genre => (
                      <Badge key={genre} variant={selectedGenres.includes(genre) ? "default" : "outline"} className={cn("cursor-pointer rounded-full text-[9px]", selectedGenres.includes(genre) ? "bg-primary" : "text-muted-foreground")} onClick={() => setSelectedGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev.slice(-2), genre])}>{genre}</Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-primary/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Checkbox id="poll-enable" checked={isPollEnabled} onCheckedChange={(val) => setIsPollEnabled(!!val)} />
                    <label htmlFor="poll-enable" className="text-xs font-bold uppercase tracking-widest text-muted-foreground cursor-pointer flex items-center gap-2">
                      <ListTodo className="w-3.5 h-3.5" /> Enable Oracle Poll
                    </label>
                  </div>
                  
                  {isPollEnabled && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <Input 
                        placeholder="Ending Question..." 
                        value={pollQuestion} 
                        onChange={(e) => setPollQuestion(e.target.value)}
                        className="h-10 text-xs rounded-xl bg-primary/5 border-none"
                      />
                      <div className="space-y-2">
                        {pollOptions.map((opt, idx) => (
                          <Input 
                            key={idx}
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...pollOptions];
                              newOpts[idx] = e.target.value;
                              setPollOptions(newOpts);
                            }}
                            className="h-8 text-[10px] rounded-lg border-primary/10"
                          />
                        ))}
                        <Button variant="ghost" size="sm" onClick={() => setPollOptions([...pollOptions, `Choice ${pollOptions.length + 1}`])} className="w-full text-[9px] uppercase font-bold text-primary">Add Choice</Button>
                      </div>
                    </div>
                  )}
                </div>

                <Button variant="outline" className="w-full h-12 rounded-2xl gap-2 border-primary/10 text-primary" onClick={() => setShowManifestDialog(true)}><Wand2 className="w-4 h-4" /> AI Illustration</Button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Dialog open={showManifestDialog} onOpenChange={setShowManifestDialog}>
        <DialogContent className="bg-white rounded-[2.5rem] p-10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-3xl text-primary">Manifest Art</DialogTitle>
            <DialogDescription className="italic">Describe the atmosphere of your chronicle cover.</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Textarea placeholder="e.g., A library floating in the lavender clouds..." value={manifestPrompt} onChange={(e) => setManifestPrompt(e.target.value)} className="bg-primary/5 border-primary/10 rounded-2xl min-h-[120px]" />
          </div>
          <DialogFooter>
            <Button onClick={async () => {
              if (!title || !manifestPrompt) return;
              setIsManifestingIllustration(true);
              try {
                const res = await generateCover({ title, prompt: manifestPrompt });
                setCoverImage(res.imageUrl);
                setShowManifestDialog(false);
                toast({ title: "Art Manifested" });
              } catch (e) { toast({ title: "Manifestation Failed", variant: "destructive" }); }
              finally { setIsManifestingIllustration(false); }
            }} disabled={isManifestingIllustration || !manifestPrompt.trim()} className="w-full h-14 bg-primary rounded-full font-headline text-lg">
              {isManifestingIllustration ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              Manifest Illustration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
