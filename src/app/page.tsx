
"use client";

import { Navbar } from "@/components/navbar";
import { NovelCard } from "@/components/novel-card";
import { MOCK_NOVELS } from "@/lib/mock-data";
import { Genre } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Sparkles, Compass, Flame, Clock } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const GENRES: Genre[] = ['Fantasy', 'Horror', 'Romance', 'Mystery', 'Drama', 'Sci-Fi'];

export default function Home() {
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'All'>('All');

  const filteredNovels = selectedGenre === 'All' 
    ? MOCK_NOVELS 
    : MOCK_NOVELS.filter(n => n.genres.includes(selectedGenre as Genre));

  return (
    <div className="min-h-screen dark-fantasy-gradient">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/dark-library/1920/1080')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/60 to-background" />
        
        <div className="container relative z-10 px-4 text-center space-y-6 max-w-4xl animate-fade-in">
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-white">
            Where Your <span className="text-primary italic">Soul</span> Finds Its <span className="text-accent italic">Voice</span>
          </h1>
          <p className="font-body text-xl md:text-2xl text-muted-foreground leading-relaxed">
            Enter Rosa Novara, a safe sanctuary for dark fantasy, gothic romance, and ethereal storytelling.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/write">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto rounded-full font-headline font-semibold shadow-xl shadow-primary/20">
                Start Writing
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10 text-lg px-8 py-6 h-auto rounded-full font-headline font-semibold">
              Explore Stories
            </Button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16 space-y-16">
        {/* Categories Section */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-bold flex items-center gap-2">
                <Compass className="text-accent" />
                The Archive Grimoire
              </h2>
              <p className="text-muted-foreground italic">Filter stories by their elemental genre</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={selectedGenre === 'All' ? 'default' : 'ghost'} 
                onClick={() => setSelectedGenre('All')}
                className={selectedGenre === 'All' ? 'bg-primary' : 'text-muted-foreground'}
              >
                All Volumes
              </Button>
              {GENRES.map(genre => (
                <Button 
                  key={genre} 
                  variant={selectedGenre === genre ? 'default' : 'ghost'}
                  onClick={() => setSelectedGenre(genre)}
                  className={selectedGenre === genre ? 'bg-primary' : 'text-muted-foreground hover:text-accent'}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>

          {/* Masonry-style Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredNovels.map((novel, idx) => (
              <div 
                key={novel.id} 
                className="animate-fade-in" 
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <NovelCard novel={novel} />
              </div>
            ))}
          </div>
        </div>

        {/* Featured Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
          <div className="glass-morphism rounded-3xl p-8 space-y-6 border-primary/20">
            <h3 className="font-headline text-2xl font-bold flex items-center gap-2">
              <Flame className="text-primary" />
              Incandescent Embers
            </h3>
            <p className="text-muted-foreground">The most evocative stories trending in the sanctuary this week.</p>
            <div className="space-y-4">
              {MOCK_NOVELS.slice(0, 3).map(novel => (
                <div key={novel.id} className="flex items-center gap-4 group cursor-pointer">
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0">
                    <Image src={novel.coverImage} alt={novel.title} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-headline font-semibold group-hover:text-accent transition-colors">{novel.title}</h4>
                    <p className="text-xs text-muted-foreground">by {novel.authorUsername}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-morphism rounded-3xl p-8 space-y-6 border-accent/20">
            <h3 className="font-headline text-2xl font-bold flex items-center gap-2">
              <Clock className="text-accent" />
              Fresh Ink
            </h3>
            <p className="text-muted-foreground">Newly penned chapters waiting to be discovered by weary travelers.</p>
            <div className="space-y-4">
              {MOCK_NOVELS.slice(3, 6).map(novel => (
                <div key={novel.id} className="flex items-center gap-4 group cursor-pointer">
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0">
                    <Image src={novel.coverImage} alt={novel.title} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-headline font-semibold group-hover:text-accent transition-colors">{novel.title}</h4>
                    <p className="text-xs text-muted-foreground">by {novel.authorUsername}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-white/5 bg-card/20 py-12">
        <div className="container mx-auto px-4 text-center space-y-4">
          <p className="font-headline text-xl text-primary font-bold">Rosa Novara</p>
          <p className="text-muted-foreground text-sm max-w-md mx-auto italic">
            "Every shadow has a story, and every whisper is a world."
          </p>
          <div className="flex justify-center gap-8 pt-4">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">Privacy Sanctuary</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">Terms of Ink</Link>
            <Link href="/safety" className="text-xs text-muted-foreground hover:text-foreground">Community Guardian</Link>
          </div>
          <p className="text-[10px] text-muted-foreground/50 pt-8 italic">© 2024 Rosa Novara Sanctuary. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
