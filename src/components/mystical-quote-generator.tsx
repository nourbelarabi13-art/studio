"use client";

import { useState, useEffect, useCallback } from "react";
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

const ROTATION_INTERVAL = 180000; // 3 minutes in milliseconds

export function MysticalQuoteGenerator() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const rotateQuote = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % BILINGUAL_CATALOG.length);
      setIsVisible(true);
    }, 800); // Wait for fade out to finish
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      rotateQuote();
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [rotateQuote]);

  const currentQuote = BILINGUAL_CATALOG[index];

  return (
    <section className="py-12 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-xl relative z-10">
        <div className="glass-morphism rounded-[2rem] p-8 md:p-10 border-primary/20 shadow-2xl bg-black/40 backdrop-blur-3xl text-center space-y-6 border-t-white/5 transition-all duration-700 hover:shadow-primary/5 group">
          
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-[0.3em] border border-primary/20">
              <Sparkles className="w-2.5 h-2.5" />
              Bilingual Oracle
            </div>
          </div>

          <div className={cn(
            "transition-all duration-1000 ease-in-out min-h-[140px] flex flex-col items-center justify-center gap-4",
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 blur-sm"
          )}>
            <div className="space-y-4">
              <p className="font-arabic text-xl md:text-2xl font-bold text-white/90 leading-relaxed">
                {currentQuote.ar}
              </p>
              <div className="w-8 h-px bg-primary/20 mx-auto opacity-40" />
              <p className="font-body text-base md:text-lg text-muted-foreground leading-relaxed italic opacity-80">
                "{currentQuote.en}"
              </p>
            </div>
            
            <p className="text-[9px] text-primary/50 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="h-px w-4 bg-primary/20" />
              {currentQuote.author}
              <span className="h-px w-4 bg-primary/20" />
            </p>
          </div>

          <div className="pt-4 flex flex-col items-center gap-2">
            <button 
              onClick={rotateQuote}
              className="text-[9px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-widest font-bold group/btn"
            >
              <BookOpen className="w-3 h-3 group-hover/btn:rotate-12 transition-transform" />
              Manually Consult
            </button>
            <div className="flex gap-1">
               {BILINGUAL_CATALOG.map((_, i) => (
                 <div 
                   key={i} 
                   className={cn(
                     "w-1 h-1 rounded-full transition-all duration-500",
                     index === i ? "bg-primary w-3" : "bg-primary/20"
                   )} 
                 />
               ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
