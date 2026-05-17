'use client';

import { StarryBackground } from "@/components/starry-background";
import { QuotesWidget } from "@/components/quotes-widget";
import { ProfileSection } from "@/components/profile-section";
import { BookOpen, Sparkles, Globe, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useLanguage } from "@/lib/i18n/context";
import Link from "next/link";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen relative flex flex-col items-center">
      <StarryBackground />
      <Navbar />

      <main className="container mx-auto px-6 py-12 sm:py-20 space-y-12 sm:space-y-20 relative z-10 max-w-5xl">
        
        {/* Hero Section */}
        <section className="text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-primary/20">
            <Sparkles className="w-3 h-3" />
            {t.hero.welcome}
          </div>
          <h1 className="font-headline text-5xl sm:text-7xl md:text-8xl font-bold leading-tight tracking-tight text-balance">
            {t.hero.title} <span className="text-primary italic">{t.hero.titleAccent}</span> Chronicle
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto italic font-light leading-relaxed">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            <Link href="/write">
              <Button size="lg" className="rounded-full px-10 h-14 bg-primary text-background font-headline text-lg hover:scale-105 transition-transform shadow-xl shadow-primary/20">
                {t.hero.start}
              </Button>
            </Link>
            <Link href="/vault">
              <Button size="lg" variant="outline" className="rounded-full px-10 h-14 border-primary/20 text-primary hover:bg-primary/5 font-headline text-lg hover:scale-105 transition-transform">
                {t.hero.explore}
              </Button>
            </Link>
          </div>
        </section>

        {/* Dynamic Components Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-8">
            <QuotesWidget />
            <div className="glass-morphism rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Globe className="w-3 h-3" /> {t.stats.title}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: t.stats.scribes, value: '1.2k', icon: Globe },
                  { label: t.stats.chronicles, value: '4.8k', icon: Zap },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-8">
            <ProfileSection />
          </div>
        </div>

        {/* Featured Segment */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
             <h2 className="font-headline text-2xl font-bold flex items-center gap-3">
               <Zap className="w-5 h-5 text-primary" /> {t.whispers.title}
             </h2>
             <Link href="/vault" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
               {t.whispers.viewAll}
             </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-morphism rounded-[2rem] overflow-hidden group cursor-pointer hover:-translate-y-1 transition-all">
                <div className="h-48 bg-primary/5 relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all">
                     <BookOpen className="w-12 h-12" />
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <div className="flex gap-2">
                    <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary">Fantasy</span>
                  </div>
                  <h3 className="font-headline text-xl font-bold group-hover:text-primary transition-colors">The Obsidian Veil</h3>
                  <p className="text-xs text-muted-foreground italic line-clamp-2">"The stars began to weep ink across the sky of the forgotten kingdom..."</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="w-full py-12 border-t border-white/5 mt-12 bg-background/80">
        <div className="container mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">© 2026 Rosaline Bela Sanctuary</p>
          <div className="flex gap-8">
            {['Terms', 'Privacy', 'Rituals'].map(l => (
              <button key={l} className="text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-primary transition-colors">{l}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
