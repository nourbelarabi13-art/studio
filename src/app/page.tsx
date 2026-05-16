
"use client";

import { Navbar } from "@/components/navbar";
import { NovelCard } from "@/components/novel-card";
import { MOCK_NOVELS } from "@/lib/mock-data";
import { Genre } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Compass, Flame, Clock } from "lucide-react";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

const GENRES: Genre[] = ['Fantasy', 'Horror', 'Romance', 'Mystery', 'Drama', 'Sci-Fi'];

export default function Home() {
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'All'>('All');
  const archiveRef = useRef<HTMLDivElement>(null);
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-fantasy');

  const filteredNovels = selectedGenre === 'All' 
    ? MOCK_NOVELS 
    : MOCK_NOVELS.filter(n => n.genres.includes(selectedGenre as Genre));

  const scrollToArchive = () => {
    archiveRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen dark-fantasy-gradient">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {heroImage && (
          <Image 
            src={heroImage.imageUrl} 
            alt={heroImage.description}
            fill
            className="object-cover opacity-40 transition-opacity duration-1000"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        
        <div className="container relative z-10 px-4 text-center space-y-8 max-w-4xl animate-fade-in">
          <div className="space-y-4">
            <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tight text-white leading-tight text-balance">
              Unveil Your <span className="text-primary italic">Soul</span>
            </h1>
            <p className="font-body text-2xl md:text-3xl text-muted-foreground/80 leading-relaxed italic max-w-2xl mx-auto">
              A gothic sanctuary where every whisper is a world, and every shadow tells a story.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
            <Link href="/write">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-xl px-10 py-8 h-auto rounded-full font-headline font-semibold shadow-2xl shadow-primary/30 transition-transform hover:scale-105 active:scale-95">
                Start Writing
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={scrollToArchive}
              className="border-accent text-accent hover:bg-accent/10 text-xl px-10 py-8 h-auto rounded-full font-headline font-semibold backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
            >
              Explore Stories
            </Button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16 space-y-24">
        {/* Categories Section */}
        <div ref={archiveRef} className="space-y-12 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
            <div className="space-y-3">
              <h2 className="font-headline text-4xl font-bold flex items-center gap-3">
                <Compass className="text-accent w-8 h-8" />
                The Archive Grimoire
              </h2>
              <p className="text-muted-foreground italic text-lg">Filter through the collective consciousness</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={selectedGenre === 'All' ? 'default' : 'ghost'} 
                onClick={() => setSelectedGenre('All')}
                className={cn("rounded-full transition-all", selectedGenre === 'All' ? 'bg-primary' : 'text-muted-foreground hover:text-accent')}
              >
                All Volumes
              </Button>
              {GENRES.map(genre => (
                <Button 
                  key={genre} 
                  variant={selectedGenre === genre ? 'default' : 'ghost'}
                  onClick={() => setSelectedGenre(genre)}
                  className={cn("rounded-full transition-all", selectedGenre === genre ? 'bg-primary' : 'text-muted-foreground hover:text-accent')}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredNovels.map((novel, idx) => (
              <div 
                key={novel.id} 
                className="animate-fade-in" 
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <NovelCard novel={novel} />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
          <div className="glass-morphism rounded-3xl p-10 space-y-8 border-primary/20 hover:border-primary/40 transition-colors group">
            <div className="space-y-2">
              <h3 className="font-headline text-3xl font-bold flex items-center gap-3">
                <Flame className="text-primary w-6 h-6 group-hover:animate-pulse" />
                Incandescent Embers
              </h3>
              <p className="text-muted-foreground italic">Evocative tales trending in the sanctuary.</p>
            </div>
            <div className="space-y-6">
              {MOCK_NOVELS.slice(0, 3).map(novel => (
                <Link key={novel.id} href={`/read/${novel.id}`} className="flex items-center gap-6 group/item cursor-pointer">
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0 shadow-lg group-hover/item:shadow-primary/20 transition-all">
                    <Image src={novel.coverImage} alt={novel.title} fill className="object-cover group-hover/item:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <h4 className="font-headline text-lg font-semibold group-hover/item:text-accent transition-colors mb-0.5">{novel.title}</h4>
                    <p className="text-xs text-muted-foreground italic mb-1">by {novel.authorUsername}</p>
                    <div className="flex gap-2">
                      {novel.genres.slice(0, 1).map(g => (
                        <span key={g} className="text-[9px] uppercase tracking-widest font-bold text-accent">{g}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="glass-morphism rounded-3xl p-10 space-y-8 border-accent/20 hover:border-accent/40 transition-colors group">
            <div className="space-y-2">
              <h3 className="font-headline text-3xl font-bold flex items-center gap-3">
                <Clock className="text-accent w-6 h-6 group-hover:rotate-12 transition-transform" />
                Fresh Ink
              </h3>
              <p className="text-muted-foreground italic">Newly manifested fragments waiting for a reader.</p>
            </div>
            <div className="space-y-6">
              {MOCK_NOVELS.slice(3, 6).map(novel => (
                <Link key={novel.id} href={`/read/${novel.id}`} className="flex items-center gap-6 group/item cursor-pointer">
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0 shadow-lg group-hover/item:shadow-accent/20 transition-all">
                    <Image src={novel.coverImage} alt={novel.title} fill className="object-cover group-hover/item:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <h4 className="font-headline text-lg font-semibold group-hover/item:text-accent transition-colors mb-0.5">{novel.title}</h4>
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

      <footer className="mt-24 border-t border-white/5 bg-card/20 py-16">
        <div className="container mx-auto px-4 text-center space-y-8">
          <div className="space-y-2">
            <p className="font-headline text-3xl text-primary font-bold">Rosa Novara</p>
            <p className="text-muted-foreground text-sm max-w-md mx-auto italic opacity-80">
              "Every shadow has a story, and every whisper is a world."
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-12 pt-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Sanctuary</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Ink</Link>
            <Link href="/safety" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Community Guardian</Link>
            <Link href="/team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">The Archive Sentinels</Link>
          </div>
          <p className="text-[10px] text-muted-foreground/30 pt-8 uppercase tracking-[0.2em]">© 2024 Rosa Novara Sanctuary. Crafted in shadows.</p>
        </div>
      </footer>
    </div>
  );
}
