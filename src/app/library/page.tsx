
"use client";

import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, where } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { Bookmark, Novel } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Heart, Bookmark as BookmarkIcon, Ghost, Sparkles } from "lucide-react";
import { NovelCard } from "@/components/novel-card";
import { useLanguage } from "@/lib/i18n/context";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LibraryPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { t } = useLanguage();

  const bookmarksQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "bookmarks"),
      orderBy("createdAt", "desc")
    );
  }, [db, user]);

  const { data: bookmarks, loading } = useCollection<Bookmark>(bookmarksQuery);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center dreamy-fantasy-gradient">
        <BookmarkIcon className="w-12 h-12 text-primary mb-6" />
        <h1 className="font-headline text-3xl font-bold mb-4">Your Library Awaits</h1>
        <p className="text-muted-foreground italic max-w-md">Your saved chronicles are precious secrets. Please sign in to view your collection.</p>
        <Link href="/login">
          <Button className="mt-8 rounded-full px-12 h-14 bg-primary text-white shadow-xl shadow-primary/20">Sign in to your Library</Button>
        </Link>
      </div>
    );
  }

  const favorites = bookmarks?.filter(b => b.category === 'favorite') || [];
  const readLater = bookmarks?.filter(b => b.category === 'read-later') || [];

  return (
    <div className="min-h-screen dreamy-fantasy-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-16 space-y-12">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <BookmarkIcon className="w-6 h-6" />
            </div>
            <h1 className="font-headline text-4xl font-bold">My Personal Archive</h1>
          </div>
          <p className="text-muted-foreground italic">A curated collection of your favorite dreams and future journeys.</p>
        </header>

        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="bg-primary/5 rounded-full p-1 h-12 border border-primary/10 mb-12">
            <TabsTrigger value="favorites" className="rounded-full px-10 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Heart className="w-4 h-4" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="read-later" className="rounded-full px-10 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Sparkles className="w-4 h-4" />
              Read Later
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : favorites.length === 0 ? (
              <EmptyState message="No favorite chronicles have been added to your archive yet." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {favorites.map((bookmark) => (
                  <NovelCard 
                    key={bookmark.novelId} 
                    novel={{
                      id: bookmark.novelId,
                      title: bookmark.novelTitle,
                      coverImage: bookmark.coverImage,
                      authorUsername: bookmark.authorUsername,
                      content: "",
                      authorId: "",
                      genres: [],
                      publishedAt: null,
                      createdAt: bookmark.createdAt,
                      isDraft: false,
                      views: 0,
                      likes: 0,
                      language: 'en'
                    }} 
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="read-later">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : readLater.length === 0 ? (
              <EmptyState message="Your 'Read Later' collection is currently empty." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {readLater.map((bookmark) => (
                  <NovelCard 
                    key={bookmark.novelId} 
                    novel={{
                      id: bookmark.novelId,
                      title: bookmark.novelTitle,
                      coverImage: bookmark.coverImage,
                      authorUsername: bookmark.authorUsername,
                      content: "",
                      authorId: "",
                      genres: [],
                      publishedAt: null,
                      createdAt: bookmark.createdAt,
                      isDraft: false,
                      views: 0,
                      likes: 0,
                      language: 'en'
                    }} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-32 glass-morphism rounded-[3rem] border-dashed border-primary/20 flex flex-col items-center gap-6">
      <Ghost className="w-16 h-16 text-primary/20" />
      <div className="space-y-2">
        <p className="text-muted-foreground italic text-lg">{message}</p>
        <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">Wander the Archive to find your next story</p>
      </div>
      <Link href="/">
        <Button variant="outline" className="rounded-full border-primary/20 text-primary hover:bg-primary/5 px-8">Return to Archive</Button>
      </Link>
    </div>
  );
}
