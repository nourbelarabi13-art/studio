
"use client";

import { Navbar } from "@/components/navbar";
import { NovelCard } from "@/components/novel-card";
import { Genre, Novel } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, BookOpen, TrendingUp, Zap, Search, X, Heart, Users, Globe } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { DynamicBackground } from "@/components/dynamic-background";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GENRES: Genre[] = ['Fantasy', 'Horror', 'Romance', 'Mystery', 'Drama', 'Sci-Fi'];

export default function Home() {
  const db = useFirestore();
  const { user } = useUser();
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState("");
  const [sevenDaysAgo, setSevenDaysAgo] = useState<string | null>(null);
  const archiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    setSevenDaysAgo(date.toISOString());
  }, []);

  // Archive Query
  const novelsQuery = useMemoFirebase(() => {
    if (!db) return null;
    let q = query(
      collection(db, "novels"),
      where("isDraft", "==", false),
      orderBy("publishedAt", "desc")
    );
    if (selectedGenre !== 'All') {
      q = query(q, where("genres", "array-contains", selectedGenre));
    }
    return q;
  }, [db, selectedGenre]);

  const { data: novels, loading } = useCollection<Novel>(novelsQuery);

  // Following Query
  const followsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "follows"), where("followerId", "==", user.uid));
  }, [db, user]);
  const { data: follows } = useCollection(followsQuery);
  const followedIds = useMemo(() => follows?.map(f => f.followingId) || [], [follows]);

  const followingNovelsQuery = useMemoFirebase(() => {
    if (!db || followedIds.length === 0) return null;
    // Note: limit to 10 for "in" query constraint
    const chunks = followedIds.slice(0, 10); 
    return query(
      collection(db, "novels"),
      where("isDraft", "==", false),
      where("authorId", "in", chunks),
      orderBy("publishedAt", "desc")
    );
  }, [db, followedIds]);
  const { data: followingNovels, loading: followingLoading } = useCollection<Novel>(followingNovelsQuery);

  // Client-side search filtering
  const filteredNovels = useMemo(() => {
    if (!novels) return [];
    if (!searchQuery.trim()) return novels;
    const lowerQuery = searchQuery.toLowerCase();
    return novels.filter(n => 
      n.title.toLowerCase().includes(lowerQuery) || 
      n.authorUsername.toLowerCase().includes(lowerQuery) ||
      n.content.toLowerCase().includes(lowerQuery)
    );
  }, [novels, searchQuery]);

  // Weekly Trending
  const trendingQuery = useMemoFirebase(() => {
    if (!db || !sevenDaysAgo) return null;
    return query(
      collection(db, "novels"),
      where("isDraft", "==", false),
      where("publishedAt", ">=", sevenDaysAgo),
      orderBy("publishedAt", "desc"),
      orderBy("views", "desc"),
      limit(4)
    );
  }, [db, sevenDaysAgo]);
  const { data: trendingNovels } = useCollection<Novel>(trendingQuery);

  // Rising
  const risingQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "novels"),
      where("isDraft", "==", false),
      orderBy("publishedAt", "desc"),
      orderBy("views", "desc"),
      limit(4)
    );
  }, [db]);
  const { data: risingNovels } = useCollection<Novel>(risingQuery);

  const scrollToArchive = () => {
    archiveRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <DynamicBackground />
        
        <div className="container relative z-10 px-4 text-center space-y-8 max-w-4xl animate-fade-in">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-2 border border-primary/20 backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              Welcome to the Sanctuary
            </div>
            <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tight text-foreground leading-tight text-balance">
              Find Your <span className="text-primary italic">Dream</span>
            </h1>
            <p className="font-body text-xl md:text-2xl text-muted-foreground/90 leading-relaxed max-w-2xl mx-auto italic">
              An elegant space where soft fantasies breathe and stories find their light.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
            <Link href="/write">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-xl px-10 py-7 h-auto rounded-full font-headline font-semibold shadow-xl shadow-primary/20 transition-transform hover:scale-105">
                Start Writing
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={scrollToArchive}
              className="border-primary/20 text-primary hover:bg-primary/5 text-xl px-10 py-7 h-auto rounded-full font-headline font-semibold backdrop-blur-md transition-transform hover:scale-105"
            >
              Explore Library
            </Button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16 space-y-32">
        {/* Trending Section */}
        {trendingNovels && trendingNovels.length > 0 && !searchQuery && (
          <div className="space-y-12 animate-fade-in">
            <div className="flex flex-col gap-2">
              <h2 className="font-headline text-4xl font-bold flex items-center gap-3 text-foreground">
                <TrendingUp className="text-primary w-8 h-8" />
                Trending This Week
              </h2>
              <p className="text-muted-foreground italic text-lg ml-11">The stories captivating the community right now.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {trendingNovels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} badge="trending" />
              ))}
            </div>
          </div>
        )}

        {/* The Sanctuary Feeds */}
        <div ref={archiveRef} className="space-y-12 scroll-mt-20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-primary/10 pb-12">
            <div className="space-y-3">
              <h2 className="font-headline text-4xl font-bold flex items-center gap-3 text-foreground">
                <BookOpen className="text-primary w-8 h-8" />
                The Archive
              </h2>
              <p className="text-muted-foreground italic text-lg">Gently curated for your wandering mind</p>
            </div>
            
            <div className="flex flex-col gap-6 w-full lg:w-auto">
              <div className="relative group max-w-md w-full ml-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search titles or authors..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-11 bg-white/50 border-primary/10 h-12 rounded-full focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          <Tabs defaultValue="archive" className="w-full">
            <div className="flex items-center justify-between mb-8">
              <TabsList className="bg-primary/5 rounded-full p-1 h-12 border border-primary/10">
                <TabsTrigger value="archive" className="rounded-full px-8 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Globe className="w-4 h-4" />
                  Archive
                </TabsTrigger>
                <TabsTrigger value="for-you" className="rounded-full px-8 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Sparkles className="w-4 h-4" />
                  For You
                </TabsTrigger>
                <TabsTrigger value="following" className="rounded-full px-8 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Users className="w-4 h-4" />
                  Following
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-wrap gap-2 justify-end">
                <Button 
                  variant={selectedGenre === 'All' ? 'default' : 'ghost'} 
                  onClick={() => setSelectedGenre('All')}
                  className={cn("rounded-full transition-all h-9 px-5", selectedGenre === 'All' ? 'bg-primary' : 'text-muted-foreground hover:text-primary hover:bg-primary/5')}
                >
                  All
                </Button>
                {GENRES.map(genre => (
                  <Button 
                    key={genre} 
                    variant={selectedGenre === genre ? 'default' : 'ghost'}
                    onClick={() => setSelectedGenre(genre)}
                    className={cn("rounded-full transition-all h-9 px-5", selectedGenre === genre ? 'bg-primary' : 'text-muted-foreground hover:text-primary hover:bg-primary/5')}
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </div>

            <TabsContent value="archive">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="italic">Softly turning the pages...</p>
                </div>
              ) : filteredNovels.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground italic bg-white/30 rounded-[2rem] border border-dashed border-primary/10">
                  {searchQuery ? "No chronicles match your search criteria." : "No stories have blossomed here yet."}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredNovels.map((novel, idx) => (
                    <div key={novel.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                      <NovelCard novel={novel} />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="for-you">
              <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {/* For You is a mix of following + trending for MVP */}
                  {[...(followingNovels || []), ...(trendingNovels || [])]
                    .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // Unique
                    .map((novel, idx) => (
                      <NovelCard key={novel.id} novel={novel} />
                    ))
                  }
                  {(!followingNovels?.length && !trendingNovels?.length) && (
                    <div className="col-span-full text-center py-20 italic text-muted-foreground">
                      Follow some scribes to see your personalized feed bloom.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="following">
              {followingLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : followingNovels && followingNovels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {followingNovels.map((novel) => (
                    <NovelCard key={novel.id} novel={novel} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 italic text-muted-foreground bg-white/30 rounded-[2rem] border border-dashed border-primary/10">
                  Your followed scribes have not manifested new fragments recently.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Rising Section */}
        {risingNovels && risingNovels.length > 0 && !searchQuery && (
          <div className="space-y-12 animate-fade-in">
            <div className="flex flex-col gap-2">
              <h2 className="font-headline text-4xl font-bold flex items-center gap-3 text-foreground">
                <Zap className="text-accent-foreground w-8 h-8" />
                Rising Stories
              </h2>
              <p className="text-muted-foreground italic text-lg ml-11">Fresh manifestations gaining popularity quickly.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {risingNovels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} badge="rising" />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-24 border-t border-primary/10 bg-white/40 py-16">
        <div className="container mx-auto px-4 text-center space-y-8">
          <div className="space-y-2">
            <p className="font-headline text-3xl text-primary font-bold">Rosaline Bela</p>
            <p className="text-muted-foreground text-sm max-w-md mx-auto italic">
              "Every thought is a seed, and every story is a bloom."
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-10 pt-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Sanctuary</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Ink</Link>
            <Link href="/safety" className="text-sm text-muted-foreground hover:text-primary transition-colors">Guardian Guidelines</Link>
            <Link href="/team" className="text-sm text-muted-foreground hover:text-primary transition-colors">The Archivists</Link>
          </div>
          <p className="text-[10px] text-muted-foreground/40 pt-8 uppercase tracking-[0.2em]">© 2024 Rosaline Bela Sanctuary. Dreamed with care.</p>
        </div>
      </footer>
    </div>
  );
}
