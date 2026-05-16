"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Quote, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiteraryQuote {
  ar: string;
  en: string;
  author: string;
}

const BILINGUAL_CATALOG: LiteraryQuote[] = [
  { ar: "الجمال سينقذ العالم.", en: "Beauty will save the world.", author: "Fyodor Dostoevsky" },
  { ar: "الخوف لا يمنع الموت، لكنه يمنع الحياة.", en: "Fear does not prevent death, it prevents life.", author: "Naguib Mahfouz" },
  { ar: "لا يرى الإنسان جيدًا إلا بالقلب.", en: "It is only with the heart that one can see rightly.", author: "Antoine de Saint-Exupéry" },
  { ar: "أعظم سعادة في الحياة أن نحب ونُحَب.", en: "The greatest happiness of life is the conviction that we are loved.", author: "Victor Hugo" },
  { ar: "الكتاب يجب أن يكون الفأس التي تكسر البحر المتجمد داخلنا.", en: "A book must be the axe for the frozen sea within us.", author: "Franz Kafka" },
  { ar: "قد تنسى من ضحكت معه، لكنك لن تنسى من بكيت معه.", en: "You may forget with whom you laughed, but you will never forget with whom you wept.", author: "Gibran Khalil Gibran" },
  { ar: "في أعماق الشتاء اكتشفت أن داخلي صيفًا لا يُقهَر.", en: "In the midst of winter, I found there was, within me, an invincible summer.", author: "Albert Camus" },
  { ar: "على هذه الأرض ما يستحق الحياة.", en: "On this earth, there is that which deserves life.", author: "Mahmoud Darwish" },
  { ar: "نحن مصنوعون من المادة نفسها التي تُصنع منها الأحلام.", en: "We are such stuff as dreams are made on.", author: "William Shakespeare" },
  { ar: "التعليم كالماء والهواء.", en: "Education is like water and air.", author: "Taha Hussein" }
];

export function MysticalQuoteGenerator() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const consultOracle = () => {
    if (!isVisible) return;
    setIsVisible(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % BILINGUAL_CATALOG.length);
      setIsVisible(true);
    }, 600);
  };

  const currentQuote = BILINGUAL_CATALOG[index];

  return (
    <section className="py-16 px-4 bg-[#0f0c13]/50 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 opacity-30" />
      <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 opacity-30" />

      <div className="container mx-auto max-w-2xl relative z-10">
        <div className="glass-morphism rounded-[2.5rem] p-8 md:p-12 border-primary/20 shadow-2xl bg-white/[0.02] backdrop-blur-2xl text-center space-y-8 border-t-white/10 transition-all duration-500 hover:border-primary/30">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border border-primary/20">
              <Sparkles className="w-3 h-3" />
              Literary Oracle
            </div>
          </div>

          <div className={cn(
            "transition-all duration-[600ms] ease-in-out min-h-[180px] flex flex-col items-center justify-center gap-4",
            isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-98 translate-y-2"
          )}>
            <div className="space-y-4">
              <p className="font-arabic text-2xl md:text-3xl font-bold text-white/95 leading-relaxed">
                {currentQuote.ar}
              </p>
              <div className="w-12 h-px bg-primary/20 mx-auto" />
              <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed italic">
                "{currentQuote.en}"
              </p>
            </div>
            
            <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mt-2">
              — {currentQuote.author}
            </p>
          </div>

          <div className="pt-4 flex flex-col items-center gap-3">
            <Button 
              onClick={consultOracle}
              className="rounded-full px-8 h-12 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-headline text-sm gap-3 transition-all hover:scale-105 active:scale-95 group"
            >
              <BookOpen className="w-4 h-4 group-hover:rotate-6 transition-transform" />
              Consult the Oracle
            </Button>
            <p className="text-[8px] text-muted-foreground/40 uppercase tracking-[0.3em] font-bold">
              اقتباس جديد
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
