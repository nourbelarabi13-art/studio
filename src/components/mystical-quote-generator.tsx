"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const MYSTICAL_QUOTES = [
  "The mists of time hold the ink of our souls.",
  "الكلمات طاقة تتجسد في الغموض",
  "القصص تولد من رحم الظلام",
  "In every shadow, a story waits to be told.",
  "الأحلام هي المسودات الحقيقية للحياة",
  "Secrets are the skeletons of the sanctuary.",
  "الكتابة هي فعل الإيمان في وجه النسيان",
  "Every book is a mirror reflecting a different soul.",
  "الغموض هو أجمل ما يمكن أن نختبره",
  "Dreams are the whispers of the ink.",
  "الصمت هو لغة الأرواح التي لم تجد كلماتها بعد.",
  "A library is a cemetery of thoughts, waiting for a necromancer to wake them."
];

export function MysticalQuoteGenerator() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const consultOracle = () => {
    if (!isVisible) return; // Prevent spamming during transition
    setIsVisible(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % MYSTICAL_QUOTES.length);
      setIsVisible(true);
    }, 600);
  };

  return (
    <section className="py-24 px-4 bg-[#0f0c13] relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 opacity-50" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 opacity-50" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="glass-morphism rounded-[3.5rem] p-12 md:p-20 border-primary/20 shadow-2xl bg-white/[0.02] backdrop-blur-2xl text-center space-y-12 border-t-white/10 transition-all duration-500 hover:border-primary/30">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              Manifestation of Thought
            </div>
            <h2 className="font-headline text-3xl font-bold text-primary/80 italic tracking-tight">The Oracle Whispers...</h2>
          </div>

          <div className={cn(
            "transition-all duration-[800ms] ease-in-out min-h-[160px] flex flex-col items-center justify-center gap-6",
            isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
          )}>
            <Quote className="w-8 h-8 text-primary/20 rotate-180" />
            <p className="font-headline text-2xl md:text-4xl font-bold text-white/90 leading-snug italic max-w-2xl mx-auto">
              "{MYSTICAL_QUOTES[index]}"
            </p>
            <Quote className="w-8 h-8 text-primary/20" />
          </div>

          <div className="pt-8">
            <Button 
              onClick={consultOracle}
              className="rounded-full px-12 h-16 bg-primary text-white hover:bg-primary/90 font-headline text-xl gap-4 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 group"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-500" />
              Consult the Oracle
            </Button>
            <p className="mt-4 text-[10px] text-muted-foreground uppercase tracking-widest opacity-40 font-bold">
              اقتباس جديد
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
