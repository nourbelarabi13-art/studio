'use client';

import { useEffect } from 'react';
import { StarryBackground } from "@/components/starry-background";
import { MysticalQuoteGenerator } from "@/components/mystical-quote-generator";
import { PhotoGallery } from "@/components/photo-gallery";
import { ProfileSection } from "@/components/profile-section";
import { AmbientPlayer } from "@/components/ambient-player";
import { BookOpen, Sparkles, Globe, Zap, ArrowRight, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useLanguage } from "@/lib/i18n/context";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { incrementGlobalViews } from "@/firebase/firestore/stats-actions";

export default function Home() {
  const { t, language } = useLanguage();
  const db = useFirestore();

  // Increment view count on load
  useEffect(() => {
    if (db) {
      incrementGlobalViews(db);
    }
  }, [db]);

  // Fetch live statistics
  const statsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "stats", "site");
  }, [db]);

  const { data: liveStats, loading: statsLoading } = useDoc<{ totalViews: number; totalScribes: number; totalChronicles: number }>(statsRef);

  // Format large numbers (e.g., 1200 -> 1.2k)
  const formatStat = (num: number | undefined, fallback: string) => {
    if (num === undefined || num === null) return fallback;
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center selection:bg-primary/30">
      <StarryBackground />
      <Navbar />

      <main className="w-full relative z-10 flex flex-col items-center">
        
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 sm:py-32 space-y-10 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] border border-primary/20 animate-fade-in backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            {t.hero.welcome}
          </div>
          
          <h1 className="font-headline text-5xl sm:text-7xl md:text-9xl font-bold leading-[1.1] tracking-tight text-balance animate-fade-in [animation-delay:200ms]">
            {t.hero.title} <span className="text-primary italic font-light">{t.hero.titleAccent}</span> Chronicle
          </h1>
          
          <p className="text-muted-foreground text-lg sm:text-2xl max-w-3xl mx-auto italic font-light leading-relaxed animate-fade-in [animation-delay:400ms] opacity-80">
            {t.hero.subtitle}
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 pt-8 animate-fade-in [animation-delay:600ms]">
            <Link href="/write">
              <Button size="lg" className="rounded-full px-12 h-16 bg-primary text-background font-headline text-xl hover:scale-105 transition-transform shadow-2xl shadow-primary/20 group">
                {t.hero.start}
                <ArrowRight className={cn("w-5 h-5 ml-2 transition-transform group-hover:translate-x-1", language === 'ar' && "rotate-180 group-hover:-translate-x-1")} />
              </Button>
            </Link>
            <Link href="/vault">
              <Button size="lg" variant="outline" className="rounded-full px-12 h-16 border-primary/20 text-primary hover:bg-primary/5 font-headline text-xl hover:scale-105 transition-transform backdrop-blur-md">
                {t.hero.explore}
              </Button>
            </Link>
          </div>
        </section>

        {/* Artistic Gallery Section */}
        <section className="w-full animate-fade-in [animation-delay:800ms]">
          <div className="container mx-auto px-6 mb-8 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="font-headline text-2xl font-bold">{t.gallery.title}</h2>
              <p className="text-xs text-muted-foreground italic">{t.gallery.desc}</p>
            </div>
            <div className="hidden sm:block">
              <AmbientPlayer />
            </div>
          </div>
          <PhotoGallery />
        </section>

        {/* Dynamic Interactive Row */}
        <section className="container mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-7xl">
          <div className="lg:col-span-5 space-y-12">
            <MysticalQuoteGenerator />
            
            <div className="glass-morphism rounded-[2.5rem] p-10 space-y-8 border-primary/10 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors" />
              
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                <Globe className="w-4 h-4" /> {t.stats.title}
              </h3>
              
              <div className="grid grid-cols-2 gap-6 relative z-10">
                {[
                  { label: t.stats.scribes, value: formatStat(liveStats?.totalScribes, '2.4k'), icon: Globe, color: 'text-primary' },
                  { label: t.stats.chronicles, value: formatStat(liveStats?.totalChronicles, '8.9k'), icon: Zap, color: 'text-accent' },
                  { label: language === 'ar' ? 'إجمالي المشاهدات' : 'Global Views', value: formatStat(liveStats?.totalViews, '...'), icon: Eye, color: 'text-primary', fullWidth: true },
                ].map((stat) => (
                  <div key={stat.label} className={cn(
                    "bg-white/5 rounded-3xl p-6 border border-white/5 hover:border-primary/20 transition-all hover:-translate-y-1",
                    stat.fullWidth && "col-span-2"
                  )}>
                    <div className="flex items-center justify-between">
                       <div>
                         <p className="text-3xl sm:text-4xl font-headline font-bold mb-1">
                           {statsLoading && stat.value === '...' ? <Loader2 className="w-6 h-6 animate-spin text-primary/40" /> : stat.value}
                         </p>
                         <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{stat.label}</p>
                       </div>
                       <stat.icon className={cn("w-8 h-8 opacity-20", stat.color)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 h-full">
            <ProfileSection />
          </div>
        </section>

        {/* Featured Segment */}
        <section className="container mx-auto px-6 py-24 space-y-12 max-w-7xl">
          <div className="flex items-center justify-between border-b border-primary/10 pb-6">
             <h2 className="font-headline text-3xl sm:text-4xl font-bold flex items-center gap-4">
               <Zap className="w-8 h-8 text-primary animate-pulse" /> {t.whispers.title}
             </h2>
             <Link href="/vault" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-2 group">
               {t.whispers.viewAll}
               <ArrowRight className={cn("w-4 h-4 transition-transform group-hover:translate-x-1", language === 'ar' && "rotate-180 group-hover:-translate-x-1")} />
             </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { title: "The Obsidian Veil", genre: "Fantasy", excerpt: "The stars began to weep ink across the sky of the forgotten kingdom...", author: "Scribe of Shadows" },
              { title: "Velvet Echoes", genre: "Mystery", excerpt: "Every floorboard in the silent manor had a whisper to share with those who listened...", author: "Midnight Weaver" },
              { title: "Amethyst Runes", genre: "Romance", excerpt: "In the heart of the crystal forest, their souls found a cadence only the moon could hear...", author: "Petal Scribe" }
            ].map((story, i) => (
              <div key={i} className="glass-morphism rounded-[2.5rem] overflow-hidden group cursor-pointer hover:-translate-y-2 transition-all duration-500 shadow-lg hover:shadow-primary/5 border-primary/5 hover:border-primary/20">
                <div className="h-56 bg-primary/5 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 grayscale group-hover:grayscale-0 group-hover:opacity-30 transition-all duration-1000 group-hover:scale-110">
                     <BookOpen className="w-20 h-20" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-primary border border-white/10">{story.genre}</span>
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  <h3 className="font-headline text-2xl font-bold group-hover:text-primary transition-colors">{story.title}</h3>
                  <p className="text-sm text-muted-foreground italic line-clamp-3 leading-relaxed opacity-80">"{story.excerpt}"</p>
                  <div className="pt-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-t border-primary/5">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Globe className="w-3 h-3" />
                    </div>
                    {story.author}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="w-full py-20 border-t border-primary/10 mt-24 bg-background/40 backdrop-blur-md relative z-10">
        <div className="container mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <span className="font-headline text-2xl font-bold tracking-tight text-primary">Rosaline Bela</span>
            </Link>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">© 2026 Celestial Sanctuary Archive</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-10">
            {['Terms', 'Privacy', 'Rituals', 'Sentinels'].map(l => (
              <button key={l} className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors relative group">
                {l}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all group-hover:w-full" />
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
