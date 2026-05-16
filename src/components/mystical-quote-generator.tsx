
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
        <div className="rounded-[2.5rem] p-10 md:p-12 border-primary/10 shadow-2xl bg-[#ffd1dc] text-center space-y-8 transition-all duration-700 hover:shadow-pink-200/50 group">
          
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 bg-white/30 text-[#8b5cf6] px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] border border-white/20 backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              Bilingual Oracle
            </div>
          </div>

          <div className={cn(
            "transition-all duration-1000 ease-in-out min-h-[160px] flex flex-col items-center justify-center gap-6",
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 blur-sm"
          )}>
            <div className="space-y-5">
              <p className="font-arabic text-2xl md:text-3xl font-bold text-[#8b5cf6] leading-relaxed">
                {currentQuote.ar}
              </p>
              <div className="w-12 h-px bg-white/40 mx-auto" />
              <p className="font-body text-lg md:text-xl text-[#8b5cf6] leading-relaxed italic">
                "{currentQuote.en}"
              </p>
            </div>
            
            <p className="text-[11px] text-white font-bold uppercase tracking-widest mt-4 flex items-center gap-3 drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
              <span className="h-px w-6 bg-white/30" />
              {currentQuote.author}
              <span className="h-px w-6 bg-white/30" />
            </p>
          </div>

          <div className="pt-6 flex flex-col items-center gap-3">
            <button 
              onClick={rotateQuote}
              className="text-[10px] text-[#8b5cf6]/70 hover:text-[#8b5cf6] transition-colors flex items-center gap-2 uppercase tracking-widest font-bold group/btn"
            >
              <BookOpen className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
              Consult the Oracle
            </button>
            <div className="flex gap-1.5">
               {BILINGUAL_CATALOG.map((_, i) => (
                 <div 
                   key={i} 
                   className={cn(
                     "w-1.5 h-1.5 rounded-full transition-all duration-500",
                     index === i ? "bg-[#8b5cf6] w-4" : "bg-white/40"
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
