"use client";

import { Navbar } from "@/components/navbar";
import { NovelCard } from "@/components/novel-card";
import { Genre, Novel } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Coffee, Loader2, BookOpen } from "lucide-react";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";

const GENRES: Genre[] = ['Fantasy', 'Horror', 'Romance', 'Mystery', 'Drama', 'Sci-Fi'];

export default function Home() {
  const db = useFirestore();
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'All'>('All');
  const archiveRef = useRef<HTMLDivElement>(null);
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-dreamy');

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

  const trendingQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "novels"),
      where("isDraft", "==", false),
      orderBy("publishedAt", "desc"),
      limit(3)
    );
  }, [db]);
  const { data: trendingNovels } = useCollection<Novel>(trendingQuery);

  const scrollToArchive = () => {
    archiveRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen dreamy-fantasy-gradient">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {heroImage && (
          <Image 
            src={heroImage.imageUrl} 
            alt={heroImage.description}
            fill
            className="object-cover opacity-20"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        
        <div className="container relative z-10 px-4 text-center space-y-8 max-w-4xl animate-fade-in">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-2">
              <Sparkles className="w-4 h-4" />
              Welcome to the Sanctuary
            </div>
            <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tight text-foreground leading-tight text-balance">
              Find Your <span className="text-primary italic">Dream</span>
            </h1>
            <p className="font-body text-xl md:text-2xl text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto italic">
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
              className="border-primary/20 text-primary hover:bg-primary/5 text-xl px-10 py-7 h-auto rounded-full font-headline font-semibold backdrop-blur-sm transition-transform hover:scale-105"
            >
              Explore Library
            </Button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16 space-y-24">
        {/* Categories Section */}
        <div ref={archiveRef} className="space-y-12 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-primary/10 pb-8">
            <div className="space-y-3">
              <h2 className="font-headline text-4xl font-bold flex items-center gap-3 text-foreground">
                <BookOpen className="text-primary w-8 h-8" />
                The Archive
              </h2>
              <p className="text-muted-foreground italic text-lg">Gently curated for your wandering mind</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={selectedGenre === 'All' ? 'default' : 'ghost'} 
                onClick={() => setSelectedGenre('All')}
                className={cn("rounded-full transition-all", selectedGenre === 'All' ? 'bg-primary' : 'text-muted-foreground hover:text-primary')}
              >
                All Stories
              </Button>
              {GENRES.map(genre => (
                <Button 
                  key={genre} 
                  variant={selectedGenre === genre ? 'default' : 'ghost'}
                  onClick={() => setSelectedGenre(genre)}
                  className={cn("rounded-full transition-all", selectedGenre === genre ? 'bg-primary' : 'text-muted-foreground hover:text-primary')}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="italic">Softly turning the pages...</p>
            </div>
          ) : novels?.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground italic">
              No stories have blossomed in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {novels?.map((novel, idx) => (
                <div 
                  key={novel.id} 
                  className="animate-fade-in" 
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <NovelCard novel={novel} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
          <div className="glass-morphism rounded-3xl p-10 space-y-8 border-primary/10 hover:border-primary/30 transition-all group">
            <div className="space-y-2">
              <h3 className="font-headline text-3xl font-bold flex items-center gap-3 text-foreground">
                <Heart className="text-primary w-6 h-6 group-hover:scale-110 transition-transform" />
                Beloved Tales
              </h3>
              <p className="text-muted-foreground italic">Warmly received in our sanctuary.</p>
            </div>
            <div className="space-y-6">
              {trendingNovels?.map(novel => (
                <Link key={novel.id} href={`/read/${novel.id}`} className="flex items-center gap-6 group/item cursor-pointer">
                  <div className="relative w-16 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm transition-all group-hover/item:shadow-md">
                    <Image src={novel.coverImage} alt={novel.title} fill className="object-cover group-hover/item:scale-105 transition-transform" />
                  </div>
                  <div>
                    <h4 className="font-headline text-lg font-semibold group-hover/item:text-primary transition-colors mb-0.5">{novel.title}</h4>
                    <p className="text-xs text-muted-foreground italic mb-1">by {novel.authorUsername}</p>
                    <div className="flex gap-2">
                      {novel.genres.slice(0, 1).map(g => (
                        <span key={g} className="text-[9px] uppercase tracking-widest font-bold text-primary">{g}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="glass-morphism rounded-3xl p-10 space-y-8 border-accent/20 hover:border-accent/40 transition-all group">
            <div className="space-y-2">
              <h3 className="font-headline text-3xl font-bold flex items-center gap-3 text-foreground">
                <Coffee className="text-accent w-6 h-6" />
                Freshly Brewed
              </h3>
              <p className="text-muted-foreground italic">New fragments freshly emerged from the mind.</p>
            </div>
            <div className="space-y-6">
              {novels?.slice(0, 3).map(novel => (
                <Link key={novel.id} href={`/read/${novel.id}`} className="flex items-center gap-6 group/item cursor-pointer">
                  <div className="relative w-16 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm transition-all group-hover/item:shadow-md">
                    <Image src={novel.coverImage} alt={novel.title} fill className="object-cover group-hover/item:scale-105 transition-transform" />
                  </div>
                  <div>
                    <h4 className="font-headline text-lg font-semibold group-hover/item:text-primary transition-colors mb-0.5">{novel.title}</h4>
                    <p className="text-xs text-muted-foreground italic mb-1">by {novel.authorUsername}</p>
                    <div className="flex gap-2">
                      {novel.genres.slice(0, 1).map(g => (
                        <span key={g} className="text-[9px] uppercase tracking-widest font-bold text-primary">{g}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
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