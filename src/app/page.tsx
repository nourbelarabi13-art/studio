
"use client";

import { Navbar } from "@/components/navbar";
import { NovelCard } from "@/components/novel-card";
import { PhotoGallery } from "@/components/photo-gallery";
import { Genre, Novel, ReadingProgress, AppLanguage, Bookmark } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, BookOpen, TrendingUp, Zap, Search, Users, Globe, MessageSquare, Clock, Filter, SlidersHorizontal, ChevronDown, Heart, MapPin } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { DynamicBackground } from "@/components/dynamic-background";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/lib/i18n/context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const GENRES: Genre[] = ['Fantasy', 'Horror', 'Romance', 'Mystery', 'Drama', 'Sci-Fi'];
const LANGUAGES: { code: AppLanguage; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

const COUNTRIES = [
  "Morocco", "France", "United Kingdom", "Egypt", "Saudi Arabia", "United States", "Canada", "Other"
];

type SortOption = 'publishedAt' | 'views' | 'likes';
type DiscoveryTab = 'archive' | 'for-you' | 'following' | 'en' | 'ar' | 'fr';

export default function Home() {
  const db = useFirestore();
  const { user } = useUser();
  const { t } = useLanguage();
  
  // Filtering & Search State
  const [activeTab, setActiveTab] = useState<DiscoveryTab>('archive');
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'All'>('All');
  const [selectedCountry, setSelectedCountry] = useState<string | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('publishedAt');
  
  const [sevenDaysAgo, setSevenDaysAgo] = useState<string | null>(null);
  const archiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    setSevenDaysAgo(date.toISOString());
  }, []);

  // --- Core Data Fetching ---

  // Reading Progress Query
  const progressQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "progress"),
      orderBy("lastReadAt", "desc"),
      limit(4)
    );
  }, [db, user]);
  const { data: progressData } = useCollection<ReadingProgress>(progressQuery);

  // Archive Query (Server-side Filtered where possible)
  const novelsQuery = useMemoFirebase(() => {
    if (!db) return null;
    let q = query(collection(db, "novels"), where("isDraft", "==", false));
    
    // Apply Language Tab Filter
    if (activeTab === 'en' || activeTab === 'ar' || activeTab === 'fr') {
      q = query(q, where("language", "==", activeTab));
    }
    
    if (selectedGenre !== 'All') {
      q = query(q, where("genres", "array-contains", selectedGenre));
    }
    if (selectedCountry !== 'All') {
      q = query(q, where("country", "==", selectedCountry));
    }
    
    q = query(q, orderBy(sortBy, "desc"));
    return q;
  }, [db, selectedGenre, selectedCountry, sortBy, activeTab]);

  const { data: novels, loading } = useCollection<Novel>(novelsQuery);

  // Social Data for Recommendations
  const followsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "follows"), where("followerId", "==", user.uid));
  }, [db, user]);
  const { data: follows } = useCollection(followsQuery);
  const followedIds = useMemo(() => follows?.map(f => f.followingId) || [], [follows]);

  // Bookmark Data for Genre Preference
  const bookmarksQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "users", user.uid, "bookmarks"), limit(20));
  }, [db, user]);
  const { data: bookmarks } = useCollection<Bookmark>(bookmarksQuery);

  // --- Recommendation Logic ---

  const preferredGenres = useMemo(() => {
    const genreMap: Record<string, number> = {};
    bookmarks?.forEach(b => {
      b.genres?.forEach(g => { genreMap[g] = (genreMap[g] || 0) + 2; });
    });
    progressData?.forEach(p => {
      p.genres?.forEach(g => { genreMap[g] = (genreMap[g] || 0) + 1; });
    });
    return Object.entries(genreMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre as Genre);
  }, [bookmarks, progressData]);

  const recommendedGenresQuery = useMemoFirebase(() => {
    if (!db || preferredGenres.length === 0) return null;
    return query(
      collection(db, "novels"),
      where("isDraft", "==", false),
      where("genres", "array-contains-any", preferredGenres),
      limit(10)
    );
  }, [db, preferredGenres]);
  const { data: genreRecommendedNovels } = useCollection<Novel>(recommendedGenresQuery);

  const followingNovelsQuery = useMemoFirebase(() => {
    if (!db || followedIds.length === 0) return null;
    const chunks = followedIds.slice(0, 10); 
    return query(
      collection(db, "novels"),
      where("isDraft", "==", false),
      where("authorId", "in", chunks),
      orderBy("publishedAt", "desc"),
      limit(10)
    );
  }, [db, followedIds]);
  const { data: followingNovels } = useCollection<Novel>(followingNovelsQuery);

  // Trending & Rising
  const trendingQuery = useMemoFirebase(() => {
    if (!db || !sevenDaysAgo) return null;
    return query(
      collection(db, "novels"),
      where("isDraft", "==", false),
      where("publishedAt", ">=", sevenDaysAgo),
      orderBy("publishedAt", "desc"),
      orderBy("views", "desc"),
      limit(8)
    );
  }, [db, sevenDaysAgo]);
  const { data: trendingNovels } = useCollection<Novel>(trendingQuery);

  const risingQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "novels"),
      where("isDraft", "==", false),
      orderBy("publishedAt", "desc"),
      orderBy("views", "desc"),
      limit(8)
    );
  }, [db]);
  const { data: risingNovels } = useCollection<Novel>(risingQuery);

  const personalizedRecommendations = useMemo(() => {
    const combined = [
      ...(followingNovels || []),
      ...(genreRecommendedNovels || []),
      ...(trendingNovels || []).slice(0, 4)
    ];
    return combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  }, [followingNovels, genreRecommendedNovels, trendingNovels]);

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

  const currentSortLabel = useMemo(() => {
    switch(sortBy) {
      case 'views': return t.home.sort_popular;
      case 'likes': return t.home.sort_liked;
      default: return t.home.sort_latest;
    }
  }, [sortBy, t]);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Introductory mysterious gallery */}
      <PhotoGallery />

      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <DynamicBackground />
        
        <div className="container relative z-10 px-4 text-center space-y-8 max-w-4xl animate-fade-in">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-2 border border-primary/20 backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              {t.hero.welcome}
            </div>
            <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tight text-foreground leading-tight text-balance">
              {t.hero.title} <span className="text-primary italic">{t.hero.dream}</span>
            </h1>
            <p className="font-body text-xl md:text-2xl text-muted-foreground/90 leading-relaxed max-w-2xl mx-auto italic">
              {t.hero.subtitle}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
            <Link href="/write">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-xl px-10 py-7 h-auto rounded-full font-headline font-semibold shadow-xl shadow-primary/20 transition-transform hover:scale-105">
                {t.hero.start}
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => archiveRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="border-primary/20 text-primary hover:bg-primary/5 text-xl px-10 py-7 h-auto rounded-full font-headline font-semibold backdrop-blur-md transition-transform hover:scale-105"
            >
              {t.hero.explore}
            </Button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16 space-y-32">
        {/* Continue Reading Section */}
        {user && progressData && progressData.length > 0 && !searchQuery && (
          <div className="space-y-12 animate-fade-in">
            <h2 className="font-headline text-4xl font-bold flex items-center gap-3 text-foreground">
              <Clock className="text-primary w-8 h-8" />
              {t.home.continue_reading}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {progressData.map((prog) => (
                <Link href={`/read/${prog.novelId}`} key={prog.novelId} className="group">
                  <div className="glass-morphism rounded-[2.5rem] p-6 border-primary/20 transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col gap-6 h-full">
                    <div className="relative aspect-[3/2] rounded-[1.8rem] overflow-hidden shadow-sm">
                      <Image src={prog.coverImage} alt={prog.novelTitle} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="space-y-3 flex-1">
                      <h3 className="font-headline text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">{prog.novelTitle}</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold italic">{prog.authorUsername}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                        <span>Progress</span>
                        <span className="text-primary">{prog.percentage}%</span>
                      </div>
                      <Progress value={prog.percentage} className="h-1.5 bg-primary/5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* The Global Discovery Archive */}
        <div ref={archiveRef} className="space-y-12 scroll-mt-20">
          <div className="flex flex-col gap-8 border-b border-primary/10 pb-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="space-y-3">
                <h2 className="font-headline text-4xl font-bold flex items-center gap-3 text-foreground">
                  <Globe className="text-primary w-8 h-8" />
                  {t.home.archive_title}
                </h2>
                <p className="text-muted-foreground italic text-lg">{t.home.archive_desc}</p>
              </div>
              
              <div className="relative group max-w-xl w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder={t.home.search_placeholder} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 bg-white/50 border-primary/10 h-14 rounded-full focus:bg-white transition-all shadow-md text-lg"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-full border-primary/10 gap-2 h-10 px-5 text-muted-foreground hover:text-primary">
                      <MapPin className="w-4 h-4" />
                      {selectedCountry === 'All' ? t.home.country_filter : `${t.home.top_in_country} ${selectedCountry}`}
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-4 rounded-3xl bg-white border-primary/10 shadow-xl">
                    <DropdownMenuItem onClick={() => setSelectedCountry('All')} className="rounded-xl cursor-pointer">
                      {t.home.all_countries}
                    </DropdownMenuItem>
                    {COUNTRIES.map(country => (
                      <DropdownMenuItem key={country} onClick={() => setSelectedCountry(country)} className="rounded-xl cursor-pointer">
                        {country}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-6 w-px bg-primary/10 mx-2 hidden sm:block" />

                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={selectedGenre === 'All' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setSelectedGenre('All')}
                    className={cn("rounded-full transition-all h-9 px-5", selectedGenre === 'All' ? 'bg-primary' : 'text-muted-foreground hover:text-primary hover:bg-primary/5')}
                  >
                    All Genres
                  </Button>
                  {GENRES.map(genre => (
                    <Button 
                      key={genre} 
                      variant={selectedGenre === genre ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedGenre(genre)}
                      className={cn("rounded-full transition-all h-9 px-5", selectedGenre === genre ? 'bg-primary' : 'text-muted-foreground hover:text-primary hover:bg-primary/5')}
                    >
                      {genre}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full gap-2 h-10 px-5 text-primary hover:bg-primary/5">
                      <SlidersHorizontal className="w-4 h-4" />
                      <span className="text-sm font-bold">{currentSortLabel}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 p-2 rounded-2xl bg-white border-primary/10 shadow-xl" align="end">
                    <DropdownMenuItem onClick={() => setSortBy('publishedAt')} className="rounded-xl cursor-pointer">
                      {t.home.sort_latest}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('views')} className="rounded-xl cursor-pointer">
                      {t.home.sort_popular}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('likes')} className="rounded-xl cursor-pointer">
                      {t.home.sort_liked}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as DiscoveryTab)} className="w-full">
            <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 scrollbar-hide">
              <TabsList className="bg-primary/5 rounded-full p-1 h-12 border border-primary/10 shrink-0">
                <TabsTrigger value="archive" className="rounded-full px-8 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Globe className="w-4 h-4" />
                  {t.home.global}
                </TabsTrigger>
                {user && (
                  <>
                    <TabsTrigger value="for-you" className="rounded-full px-8 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                      <Sparkles className="w-4 h-4" />
                      {t.home.for_you}
                    </TabsTrigger>
                    <TabsTrigger value="following" className="rounded-full px-8 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                      <Users className="w-4 h-4" />
                      {t.home.following}
                    </TabsTrigger>
                  </>
                )}
                {LANGUAGES.map(lang => (
                  <TabsTrigger key={lang.code} value={lang.code} className="rounded-full px-8 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                    <span>{lang.flag}</span>
                    {lang.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="archive">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="italic">Gazing into the global Archive...</p>
                </div>
              ) : filteredNovels.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground italic bg-white/30 rounded-[2rem] border border-dashed border-primary/10">
                  {t.home.no_results}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredNovels.map((novel) => (
                    <NovelCard key={novel.id} novel={novel} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="for-you">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {personalizedRecommendations.length > 0 ? (
                  personalizedRecommendations.map((novel) => (
                    <NovelCard key={novel.id} novel={novel} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-20 italic text-muted-foreground">
                    Discover more stories to let the sanctuary learn your soul.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="following">
              {followingNovels && followingNovels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {followingNovels.map((novel) => (
                    <NovelCard key={novel.id} novel={novel} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 italic text-muted-foreground bg-white/30 rounded-[2rem] border border-dashed border-primary/10">
                  Your followed scribes are currently silent.
                </div>
              )}
            </TabsContent>

            {['en', 'ar', 'fr'].map(langCode => (
              <TabsContent key={langCode} value={langCode}>
                {loading ? (
                  <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : filteredNovels.length === 0 ? (
                  <div className="text-center py-20 italic text-muted-foreground">{t.home.no_results}</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredNovels.map((novel) => (
                      <NovelCard key={novel.id} novel={novel} />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Community Promo */}
        <section className="animate-fade-in">
          <div className="glass-morphism rounded-[3rem] p-12 md:p-20 text-center space-y-8 border-primary/10 relative overflow-hidden group">
            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mx-auto shadow-inner">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
                {t.home.community_title}
              </h2>
              <p className="text-muted-foreground text-lg italic leading-relaxed">
                {t.home.community_desc}
              </p>
              <Link href="/community">
                <Button size="lg" className="rounded-full px-12 h-14 bg-primary hover:bg-primary/90 text-lg font-headline shadow-xl shadow-primary/20 gap-3">
                  <Users className="w-5 h-5" />
                  {t.home.community_cta}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
