"use client";

import { useState, useDeferredValue, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Zap,
  Loader2,
  Image as ImageIcon,
  Heart,
  Wand2
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
import { cn } from "@/lib/utils";
import { useFirestore, useUser, useDoc } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";

const AVAILABLE_GENRES: Genre[] = ['Fantasy', 'Horror', 'Romance', 'Mystery', 'Drama', 'Sci-Fi'];

export default function WritePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  
  const profileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, "users", user.uid);
  }, [user, db]);
  const { data: profile } = useDoc(profileRef);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const deferredContent = useDeferredValue(content);
  
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [coverImage, setCoverImage] = useState(PlaceHolderImages[0].imageUrl);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [isManifestingIllustration, setIsManifestingIllustration] = useState(false);
  const [manifestPrompt, setManifestPrompt] = useState("");
  const [showManifestDialog, setShowManifestDialog] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSparking, setIsSparking] = useState(false);
  const [isCheckingSafety, setIsCheckingSafety] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const wordCount = useMemo(() => deferredContent.split(/\s+/).filter(Boolean).length, [deferredContent]);

  const toggleGenre = (genre: Genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre) 
        : (prev.length < 3 ? [...prev, genre] : prev)
    );
  };

  const handleSuggestGenres = async () => {
    if (!content || !title) {
      toast({ title: "Keep writing", description: "Give your story a title and a few words first.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await suggestGenres({ title, storyContent: content });
      setSelectedGenres(result.suggestedGenres as Genre[]);
    } catch (error) {
      toast({ title: "Still thinking...", description: "We couldn't suggest genres right now.", variant: "destructive" });
    } finally { setIsAnalyzing(false); }
  };

  const handleStorySpark = async () => {
    setIsSparking(true);
    try {
      const result = await suggestStorySpark({ title, currentContent: content });
      toast({ title: "A Spark of Light", description: result.spark, duration: 8000 });
    } catch (error) {
      toast({ title: "Quiet Mind", description: "The muse is resting.", variant: "destructive" });
    } finally { setIsSparking(false); }
  };

  const handleManifestIllustration = async () => {
    if (!title) {
      toast({ title: "Title Required", description: "Provide a title for your chronicle first.", variant: "destructive" });
      return;
    }
    setIsManifestingIllustration(true);
    try {
      const result = await generateCover({ title, prompt: manifestPrompt });
      setCoverImage(result.imageUrl);
      setShowManifestDialog(false);
      setManifestPrompt("");
      toast({ title: "Illustration Manifested", description: "Your custom cover is ready." });
    } catch (error: any) {
      toast({ title: "Manifestation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsManifestingIllustration(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user || !db) { toast({ title: "Who are you?", description: "Please log in to save.", variant: "destructive" }); return; }
    if (!title && !content) return;
    setIsSaving(true);
    const novelData = {
      title: title || "Untitled Dream",
      content,
      authorId: user.uid,
      authorUsername: profile?.username || "Dreamer",
      genres: selectedGenres,
      coverImage,
      isDraft: true,
      createdAt: new Date().toISOString(),
      publishedAt: null,
      views: 0,
      likes: 0
    };
    addDoc(collection(db, "novels"), novelData).then(() => {
      setIsSaving(false);
      toast({ title: "Dream Tucked Away", description: "Draft secured in your vault." });
      router.push("/vault");
    }).catch(async () => {
      setIsSaving(false);
      errorEmitter.emit("permission-error", new FirestorePermissionError({ path: "novels", operation: "create" }));
    });
  };

  const handlePublish = async () => {
    if (!user || !db) { toast({ title: "Identify yourself", description: "Log in to share your story.", variant: "destructive" }); return; }
    if (!content || !title || selectedGenres.length === 0) {
      toast({ title: "Almost there", description: "Check your title, content, and genres.", variant: "destructive" });
      return;
    }
    setIsCheckingSafety(true);
    try {
      const safetyResult = await checkContentSafety({ novelTitle: title, novelContent: content });
      if (!safetyResult.isSafe) {
        toast({ title: "Gently Declined", description: safetyResult.reasons[0], variant: "destructive" });
        setIsCheckingSafety(false);
        return;
      }
      const novelData = {
        title, content, authorId: user.uid, authorUsername: profile?.username || "Dreamer",
        genres: selectedGenres, coverImage, isDraft: false, 
        createdAt: new Date().toISOString(), 
        publishedAt: new Date().toISOString(),
        views: 0,
        likes: 0
      };
      addDoc(collection(db, "novels"), novelData).then(() => {
        setIsCheckingSafety(false);
        toast({ title: "Story Bloomed", description: "Published to the Archive." });
        router.push("/");
      }).catch(async () => {
        setIsCheckingSafety(false);
        errorEmitter.emit("permission-error", new FirestorePermissionError({ path: "novels", operation: "create" }));
      });
    } catch (error) { setIsCheckingSafety(false); }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <h1 className="font-headline text-4xl font-bold italic text-primary">The Writing Desk</h1>
            <p className="text-muted-foreground text-sm italic">Let your thoughts flow freely.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="gap-2 rounded-full border-primary/20 text-primary hover:bg-primary/5" onClick={handleStorySpark} disabled={isSparking}>
              {isSparking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Get a Spark
            </Button>
            <Button variant="outline" className="gap-2 rounded-full border-primary/10 text-muted-foreground hover:bg-primary/5" onClick={handleSaveDraft} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Draft
            </Button>
            <Button onClick={handlePublish} disabled={isCheckingSafety} className="gap-2 bg-primary hover:bg-primary/90 rounded-full px-8 shadow-md">
              {isCheckingSafety ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publish
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-12">
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="space-y-4 shrink-0">
                <div 
                  className="relative w-28 h-36 rounded-2xl overflow-hidden cursor-pointer group border-2 border-dashed border-primary/10 hover:border-primary/40 transition-all shadow-sm"
                  onClick={() => setShowImageSelector(!showImageSelector)}
                >
                  <Image src={coverImage} alt="Cover" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/20">
                    <ImageIcon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowManifestDialog(true)}
                  className="w-full h-8 text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/5 gap-1.5 rounded-full"
                >
                  <Wand2 className="w-3 h-3" />
                  Manifest AI Art
                </Button>
              </div>
              <div className="flex-1 w-full">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Story Title..." className="bg-transparent border-none text-5xl md:text-6xl font-headline font-bold focus-visible:ring-0 px-0 placeholder:opacity-20 h-auto" />
              </div>
            </div>
            
            {showImageSelector && (
              <div className="glass-morphism rounded-3xl p-6 border-primary/10 animate-fade-in">
                <h4 className="font-headline text-lg font-bold mb-4">Choose a Cover Essence</h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {PlaceHolderImages.slice(0, 12).map(img => (
                    <div key={img.id} className={cn("relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105", coverImage === img.imageUrl ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-60")} onClick={() => { setCoverImage(img.imageUrl); setShowImageSelector(false); }}>
                      <Image src={img.imageUrl} alt={img.description} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="relative">
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Start your story here..." className="writing-editor min-h-[60vh] bg-transparent border-none resize-none focus-visible:ring-0 p-0 placeholder:italic placeholder:opacity-20 text-foreground/90" />
              <div className="absolute bottom-0 right-0 py-4 text-xs text-muted-foreground/40 font-bold uppercase tracking-widest">{wordCount} words</div>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="glass-morphism rounded-3xl p-7 space-y-6 border-primary/10">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-xl font-bold">Genres</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-full" onClick={handleSuggestGenres} disabled={isAnalyzing}>
                  <Sparkles className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_GENRES.map(genre => (
                  <Badge key={genre} variant={selectedGenres.includes(genre) ? "default" : "outline"} className={cn("cursor-pointer h-7 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider", selectedGenres.includes(genre) ? "bg-primary border-none shadow-sm" : "border-primary/10 text-muted-foreground hover:border-primary/40")} onClick={() => toggleGenre(genre)}>{genre}</Badge>
                ))}
              </div>
            </div>

            <div className="glass-morphism rounded-3xl p-7 space-y-4 bg-primary/5 border-primary/10">
              <h3 className="font-headline text-lg font-bold flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Soft Guidelines
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed italic">Your story should be comfortable and safe for all our dreamers to read.</p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground/70"><CheckCircle2 className="w-4 h-4 text-primary/40" /><span>Privacy Protected</span></div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground/70"><CheckCircle2 className="w-4 h-4 text-primary/40" /><span>Safety Check Active</span></div>
              </div>
            </div>

            <Button variant="ghost" className="w-full text-destructive/40 hover:text-destructive hover:bg-destructive/5 gap-2 rounded-full h-11 text-xs font-bold uppercase tracking-widest" onClick={() => { if (confirm("Clear your desk?")) { setTitle(""); setContent(""); setSelectedGenres([]); } }}>
              <Trash2 className="w-4 h-4" />
              Discard Story
            </Button>
          </aside>
        </div>
      </main>

      <Dialog open={showManifestDialog} onOpenChange={setShowManifestDialog}>
        <DialogContent className="bg-white rounded-[2rem] border-primary/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">Manifest Cover Illustration</DialogTitle>
            <DialogDescription className="italic">
              Describe the atmosphere you wish to manifest. Our AI will weave a soft fantasy illustration for your chronicle.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Textarea 
              placeholder="e.g., A lone library at dawn with floating lavender petals..." 
              value={manifestPrompt}
              onChange={(e) => setManifestPrompt(e.target.value)}
              className="bg-primary/5 border-primary/10 rounded-2xl min-h-[100px] resize-none focus:bg-white transition-all"
            />
          </div>
          <DialogFooter>
            <Button 
              onClick={handleManifestIllustration} 
              disabled={isManifestingIllustration || !manifestPrompt.trim()}
              className="w-full bg-primary hover:bg-primary/90 h-12 rounded-full gap-2 font-headline text-lg shadow-lg shadow-primary/10"
            >
              {isManifestingIllustration ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Manifest Illustration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
