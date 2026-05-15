
"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_NOVELS } from "@/lib/mock-data";
import { Book, Edit3, Trash2, Plus, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function VaultPage() {
  const publishedCount = 4;
  const draftCount = 2;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                <Book className="w-6 h-6" />
              </div>
              <h1 className="font-headline text-4xl font-bold">The Personal Vault</h1>
            </div>
            <p className="text-muted-foreground italic">A secure sanctuary for your unmanifested thoughts and published chronicles.</p>
          </div>
          
          <Link href="/write">
            <Button size="lg" className="bg-primary hover:bg-primary/90 h-14 px-8 rounded-full gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5" />
              New Chronicle
            </Button>
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass-morphism rounded-3xl p-8 space-y-6">
              <h3 className="font-headline text-xl font-bold">Vault Analytics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/40 rounded-2xl p-4 text-center border border-white/5">
                  <span className="block text-3xl font-bold text-primary">{publishedCount}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Published</span>
                </div>
                <div className="bg-background/40 rounded-2xl p-4 text-center border border-white/5">
                  <span className="block text-3xl font-bold text-accent">{draftCount}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Drafts</span>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Soul Affinity Score</span>
                  <span className="text-accent font-bold">88%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: '88%' }} />
                </div>
              </div>
            </div>

            <div className="glass-morphism rounded-3xl p-8 space-y-4">
              <h3 className="font-headline text-xl font-bold">Recent Apparitions</h3>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                "Your stories are spirits waiting for a host."
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 text-sm group cursor-pointer">
                  <Clock className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-muted-foreground group-hover:text-foreground">2 hours ago: Draft "Silent Moon" updated</span>
                </div>
                <div className="flex items-center gap-3 text-sm group cursor-pointer">
                  <Eye className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                  <span className="text-muted-foreground group-hover:text-foreground">New reader discovered "The Velvet Shadow"</span>
                </div>
              </div>
            </div>
          </div>

          {/* Novels List */}
          <div className="md:col-span-2 space-y-8">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <button className="text-primary font-headline text-lg font-bold border-b-2 border-primary pb-4 -mb-[18px]">All Works</button>
              <button className="text-muted-foreground hover:text-foreground font-headline text-lg transition-colors pb-4 -mb-[18px]">Published</button>
              <button className="text-muted-foreground hover:text-foreground font-headline text-lg transition-colors pb-4 -mb-[18px]">Drafts</button>
            </div>

            <div className="grid gap-6">
              {MOCK_NOVELS.slice(0, 4).map((novel, idx) => (
                <Card key={novel.id} className="bg-card/40 border-white/5 overflow-hidden group hover:border-primary/30 transition-all">
                  <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="relative w-24 h-32 rounded-lg overflow-hidden shrink-0 shadow-lg">
                      <img src={novel.coverImage} alt={novel.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-headline text-2xl font-bold group-hover:text-accent transition-colors">
                          {novel.title}
                        </h3>
                        {idx > 2 ? (
                          <Badge variant="secondary" className="bg-accent/20 text-accent border-none text-[10px] px-2 py-0">DRAFT</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-primary/20 text-primary border-none text-[10px] px-2 py-0">PUBLISHED</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {novel.genres.map(g => (
                          <span key={g} className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{g}</span>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 italic">
                        "The moon bled garnet across the obsidian fields, casting long, twisted shadows that seemed to whisper of forgotten pacts..."
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-accent">
                        <Edit3 className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
