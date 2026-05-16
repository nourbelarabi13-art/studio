
"use client";

import { Navbar } from "@/components/navbar";
import { User } from "lucide-react";

export default function TeamPage() {
  const sentinels = [
    { name: "The First Scribe", role: "Archivist of Lore" },
    { name: "Shadow Weaver", role: "Guardian of the Interface" },
    { name: "Velvet Ink", role: "Sentinel of Safety" },
  ];

  return (
    <div className="min-h-screen dark-fantasy-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-24 max-w-4xl space-y-12">
        <header className="space-y-4">
          <h1 className="font-headline text-5xl font-bold italic text-accent">The Archive Sentinels</h1>
          <p className="text-muted-foreground italic text-xl">The souls behind the sanctuary.</p>
        </header>
        <article className="prose prose-invert prose-lg max-w-none text-muted-foreground space-y-8 leading-loose">
          <p>Rosa Novara is maintained by a small circle of creators dedicated to fostering a safe, atmospheric, and inspiring space for the dark fantasy community.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            {sentinels.map((sentinel) => (
              <div key={sentinel.name} className="glass-morphism p-8 rounded-3xl text-center space-y-4 border-white/5">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mx-auto">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold text-white">{sentinel.name}</h3>
                  <p className="text-sm text-accent italic">{sentinel.role}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
