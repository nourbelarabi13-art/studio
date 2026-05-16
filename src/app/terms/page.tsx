
"use client";

import { Navbar } from "@/components/navbar";

export default function TermsPage() {
  return (
    <div className="min-h-screen dark-fantasy-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-24 max-w-4xl space-y-12">
        <header className="space-y-4">
          <h1 className="font-headline text-5xl font-bold italic text-primary">Terms of Ink</h1>
          <p className="text-muted-foreground italic text-xl">The sacred pact between traveler and sanctuary.</p>
        </header>
        <article className="prose prose-invert prose-lg max-w-none text-muted-foreground space-y-8 leading-loose">
          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-white">1. The Manifestation of Words</h2>
            <p>Travelers retain all spiritual ownership of the chronicles they manifest within Rosa Novara. However, by manifesting, you grant the sanctuary a non-exclusive right to display your fragments to other weary souls.</p>
          </section>
          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-white">2. Conduct within the Archive</h2>
            <p>Every shadow has a story, but no story should harm another. Harassment, toxic rituals, and the spread of unholy hate are strictly forbidden. The Guardian Sentinels maintain the right to banish any soul who violates these peace treaties.</p>
          </section>
          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-white">3. Age of Maturity</h2>
            <p>Entrance to the sanctuary is reserved for those who have weathered at least thirteen seasons. We do not knowingly collect essence from those younger.</p>
          </section>
        </article>
      </main>
    </div>
  );
}
