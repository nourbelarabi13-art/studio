
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const QUOTES = [
  { ar: "ما نحن إلا من مادة الأحلام.", en: "We are such stuff as dreams are made on.", author: "Shakespeare" },
  { ar: "كل شيء جميل له نهاية، إلا الخيال.", en: "Everything beautiful has an end, except imagination.", author: "Traveler" },
  { ar: "جمال القلب هو الجمال الحقيقي.", en: "The beauty of the heart is the only true beauty.", author: "Rumi" },
  { ar: "الكتاب نافذة تطل على الروح.", en: "A book is a window into the soul.", author: "Ancient Whisper" },
];

export function QuotesWidget() {
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const rotate = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % QUOTES.length);
      setIsFading(false);
    }, 500);
  }, []);

  useEffect(() => {
    const timer = setInterval(rotate, 180000); // 3 minutes
    return () => clearInterval(timer);
  }, [rotate]);

  return (
    <div 
      onMouseEnter={rotate}
      className="glass-morphism rounded-3xl p-6 group cursor-help transition-all hover:border-primary/30"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Bilingual Oracle</span>
        </div>
        <RefreshCcw className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity animate-spin-slow" />
      </div>

      <div className={cn("space-y-4 transition-opacity duration-500", isFading ? "opacity-0" : "opacity-100")}>
        <p className="font-arabic text-xl font-bold leading-relaxed text-primary">
          {QUOTES[index].ar}
        </p>
        <div className="h-px bg-white/10 w-8" />
        <p className="text-sm italic text-muted-foreground leading-relaxed">
          "{QUOTES[index].en}"
        </p>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40 text-right">
          — {QUOTES[index].author}
        </p>
      </div>
    </div>
  );
}
