
"use client";

import { useState, useMemo, useCallback, useTransition, useDeferredValue, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, collection, addDoc, updateDoc, increment, query, where, getDocs } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { useLanguage } from "@/lib/i18n/context";
import { Chapter, Genre, AppLanguage } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { checkAchievements } from "@/firebase/firestore/achievement-actions";
import { createNotification } from "@/firebase/firestore/notification-actions";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

// Sub-components
import { EditorCore } from "@/components/write/editor-core";
import { ChaptersPanel } from "@/components/write/chapters-panel";
import { StatsSidebar } from "@/components/write/stats-sidebar";
import { WriteToolbar } from "@/components/write/write-toolbar";
import { SideNotesPanel } from "@/components/write/side-notes-panel";

export default function WritePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const { language: appLanguage } = useLanguage();
  const [isPending, startTransition] = useTransition();
  
  const defaultWritingImage = PlaceHolderImages.find(img => img.id === 'writing-default')?.imageUrl || '';

  const profileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, "users", user.uid);
  }, [user, db]);
  const { data: profile } = useDoc(profileRef);

  // Novel State (Master)
  const [novelId, setNovelId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [writingLanguage, setWritingLanguage] = useState<AppLanguage>(appLanguage);
  const [writingCountry, setWritingCountry] = useState<string>("Morocco");
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  
  // Chapter State
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: 'chap-1', title: 'Chapter 1', content: '', order: 0 }
  ]);
  const [activeChapterId, setActiveChapterId] = useState('chap-1');

  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  // Use deferred value for heavy stats to prevent typing lag
  const deferredChapters = useDeferredValue(chapters);
  const totalWordCount = useMemo(() => {
    return deferredChapters.reduce((acc, chap) => {
      const words = chap.content ? chap.content.trim().split(/\s+/).filter(Boolean).length : 0;
      return acc + words;
    }, 0);
  }, [deferredChapters]);

  const activeChapter = useMemo(() => 
    chapters.find(c => c.id === activeChapterId) || chapters[0],
  [chapters, activeChapterId]);

  // Stable Handlers
  const handleContentChange = useCallback((newContent: string) => {
    setChapters(prev => prev.map(c => 
      c.id === activeChapterId ? { ...c, content: newContent } : c
    ));
  }, [activeChapterId]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  const handleChapterTitleChange = useCallback((id: string, newTitle: string) => {
    setChapters(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  }, []);

  const handleSelectChapter = useCallback((id: string) => {
    startTransition(() => {
      setActiveChapterId(id);
    });
  }, []);

  const addChapter = useCallback(() => {
    const newId = `chap-${Date.now()}`;
    const newChapter: Chapter = { 
      id: newId, 
      title: `Chapter ${chapters.length + 1}`, 
      content: '', 
      order: chapters.length 
    };
    setChapters(prev => [...prev, newChapter]);
    setActiveChapterId(newId);
  }, [chapters.length]);

  const toggleGenre = useCallback((genre: Genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev.slice(-2), genre]
    );
  }, []);

  // Autosave Logic
  const saveProgress = useCallback(async (isAuto = false) => {
    if (!user || !db) return;
    if (!isAuto) setIsSaving(true);

    const novelData = {
      title: title || "Untitled Dream",
      content: chapters.map(c => c.content).join('\n\n'), 
      chapters,
      authorId: user.uid,
      authorUsername: profile?.username || "Dreamer",
      genres: selectedGenres,
      coverImage: defaultWritingImage,
      isDraft: true,
      updatedAt: new Date().toISOString(),
      language: writingLanguage,
      country: writingCountry,
    };

    try {
      if (novelId) {
        const ref = doc(db, "novels", novelId);
        await updateDoc(ref, novelData);
      } else {
        const ref = await addDoc(collection(db, "novels"), {
          ...novelData,
          createdAt: new Date().toISOString(),
          views: 0,
          likes: 0,
        });
        setNovelId(ref.id);
      }
      setLastSaved(new Date());
    } catch (e) {
      if (!isAuto) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: novelId ? `novels/${novelId}` : 'novels',
          operation: 'write',
          requestResourceData: novelData
        }));
      }
    } finally {
      if (!isAuto) setIsSaving(false);
    }
  }, [user, db, novelId, title, chapters, selectedGenres, writingLanguage, writingCountry, profile, defaultWritingImage]);

  // Periodic autosave every 30 seconds if changed
  useEffect(() => {
    const timer = setInterval(() => {
      if (user && db && (title || totalWordCount > 0)) {
        saveProgress(true);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [saveProgress, title, totalWordCount, user, db]);

  const handlePublish = async () => {
    if (!user || !db) return;
    setIsPublishing(true);
    
    try {
      const fullContent = chapters.map(c => `## ${c.title}\n\n${c.content}`).join('\n\n');
      const novelData = {
        title: title || "Untitled Dream", 
        content: fullContent,
        chapters,
        authorId: user.uid, 
        authorUsername: profile?.username || "Dreamer",
        genres: selectedGenres, 
        isDraft: false, 
        publishedAt: new Date().toISOString(),
        language: writingLanguage,
        country: writingCountry,
      };

      if (novelId) {
        await updateDoc(doc(db, "novels", novelId), novelData);
      } else {
        const ref = await addDoc(collection(db, "novels"), {
          ...novelData,
          createdAt: new Date().toISOString(),
          views: 0,
          likes: 0,
          coverImage: defaultWritingImage,
        });
        setNovelId(ref.id);
      }

      await updateDoc(doc(db, "users", user.uid), { publishedCount: increment(1) });
      checkAchievements(db, user.uid);
      
      // Notify followers
      const followersQuery = query(collection(db, "follows"), where("followingId", "==", user.uid));
      const followersSnap = await getDocs(followersQuery);
      followersSnap.forEach(followerDoc => {
        createNotification(db, followerDoc.data().followerId, {
          type: 'story',
          message: `${profile?.username} published a new chronicle: "${title || "Untitled"}"`,
          fromUserId: user.uid,
          fromUserName: profile?.username,
          targetId: novelId || ""
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

  return (
    <div className="min-h-screen bg-[#fffcfc] flex flex-col">
      <Navbar />
      
      <WriteToolbar 
        lastSaved={lastSaved}
        isSaving={isSaving}
        isPublishing={isPublishing}
        wordCount={totalWordCount}
        onSave={() => saveProgress()}
        onPublish={handlePublish}
        isNotesOpen={isNotesOpen}
        onToggleNotes={() => setIsNotesOpen(!isNotesOpen)}
      />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-[1600px]">
        <div className={cn(
          "grid gap-12 transition-all duration-500",
          isNotesOpen 
            ? "lg:grid-cols-[250px_1fr_350px]" 
            : "lg:grid-cols-[280px_1fr_300px]"
        )}>
          {/* Left: Fragments */}
          <aside className={cn(isNotesOpen && "hidden xl:block")}>
            <ChaptersPanel 
              chapters={chapters}
              activeId={activeChapterId}
              isPending={isPending}
              onSelect={handleSelectChapter}
              onAdd={addChapter}
              onTitleChange={handleChapterTitleChange}
            />
          </aside>

          {/* Center: Writing Desk */}
          <div className="space-y-12 min-h-[80vh] max-w-4xl mx-auto w-full">
            <EditorCore 
              title={title}
              onTitleChange={handleTitleChange}
              chapterTitle={activeChapter.title}
              content={activeChapter.content}
              onContentChange={handleContentChange}
              isRtl={writingLanguage === 'ar'}
            />
          </div>

          {/* Right: Side Notes or Context */}
          <aside>
            {isNotesOpen ? (
              <SideNotesPanel 
                novelId={novelId}
                chapterId={activeChapterId}
                onClose={() => setIsNotesOpen(false)}
              />
            ) : (
              <StatsSidebar 
                language={writingLanguage}
                setLanguage={setWritingLanguage}
                genres={selectedGenres}
                onGenreToggle={toggleGenre}
                country={writingCountry}
                setCountry={setWritingCountry}
              />
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
