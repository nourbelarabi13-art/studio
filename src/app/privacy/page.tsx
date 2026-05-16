
"use client";

import { Navbar } from "@/components/navbar";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen dark-fantasy-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-24 max-w-4xl space-y-12">
        <header className="space-y-4">
          <h1 className="font-headline text-5xl font-bold italic text-accent">Privacy Sanctuary</h1>
          <p className="text-muted-foreground italic text-xl">How we guard your identity and your secrets.</p>
        </header>
        <article className="prose prose-invert prose-lg max-w-none text-muted-foreground space-y-8 leading-loose">
          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-white">I. Essence Collection</h2>
            <p>We only collect the digital traces necessary for you to traverse the sanctuary: your persona name, your scroll address, and the chronicles you choose to share.</p>
          </section>
          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-white">II. The Protection of Shadows</h2>
            <p>Your data is encrypted behind ethereal barriers. We never sell your soul's work to third-party merchants or data-brokers.</p>
          </section>
          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-white">III. Your Right to Banishment</h2>
            <p>At any time, you may request the total deletion of your identity and chronicles. Once banished, your traces will vanish from the Archive forever.</p>
          </section>
        </article>
      </main>
    </div>
  );
}
