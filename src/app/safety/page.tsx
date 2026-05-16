
"use client";

import { Navbar } from "@/components/navbar";

export default function SafetyPage() {
  return (
    <div className="min-h-screen dark-fantasy-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-24 max-w-4xl space-y-12">
        <header className="space-y-4">
          <h1 className="font-headline text-5xl font-bold italic text-primary">Community Guardian</h1>
          <p className="text-muted-foreground italic text-xl">Guidelines for a safe and creative sanctuary.</p>
        </header>
        <article className="prose prose-invert prose-lg max-w-none text-muted-foreground space-y-8 leading-loose">
          <section className="space-y-4">
            <h2 className="font-headline text-2xl text-white">The Sentinel's Creed</h2>
            <p>Rosa Novara is a sanctuary for dark fantasy and ethereal expression, but it must remain safe for all travelers aged 13 and above. We foster a community of mutual respect and creative freedom.</p>
          </section>
          <ul className="list-disc pl-6 space-y-4">
            <li><strong>No Toxicity:</strong> Attacks on other writers are not tolerated.</li>
            <li><strong>Content Safety:</strong> All published works must pass through our safety ritual (AI Content Check).</li>
            <li><strong>Identity:</strong> Use a pseudonym (persona name) to protect your real-world identity.</li>
            <li><strong>Reporting:</strong> If you find a chronicle that violates the sanctuary's peace, summon a Guardian immediately using the report flag.</li>
          </ul>
        </article>
      </main>
    </div>
  );
}
