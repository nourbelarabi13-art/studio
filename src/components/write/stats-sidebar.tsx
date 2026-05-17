
"use client";

import React from "react";
import { Genre, AppLanguage } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Globe, Sparkles, MapPin, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface StatsSidebarProps {
  language: AppLanguage;
  setLanguage: (val: AppLanguage) => void;
  genres: Genre[];
  onGenreToggle: (g: Genre) => void;
  country: string;
  setCountry: (val: string) => void;
  coverImage: string;
  setCoverImage: (val: string) => void;
}

const AVAILABLE_GENRES: Genre[] = [
  'Fantasy', 'Horror', 'Romance', 'Mystery', 'Drama', 'Sci-Fi', 
  'Historical', 'Psychological', 'Adventure', 'Poetry & Prose', 'Thriller'
];

const COUNTRIES = [
  "Morocco", "France", "United Kingdom", "Egypt", "Saudi Arabia", "United States", "Canada", "Other"
];

export const StatsSidebar = React.memo(function StatsSidebar({
  language,
  setLanguage,
  genres,
  onGenreToggle,
  country,
  setCountry,
  coverImage,
  setCoverImage
}: StatsSidebarProps) {
  return (
    <div className="space-y-8 sticky top-36">
      <div className="glass-morphism rounded-[2rem] p-7 space-y-6 border-primary/10 shadow-sm">
        <h3 className="font-headline text-xl font-bold flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" /> Context
        </h3>
        
        <div className="space-y-6">
          {/* Cover Image Selection */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
               <ImageIcon className="w-3 h-3" /> Cover Illustration
            </label>
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-primary/10 bg-primary/5 group">
              {coverImage ? (
                <Image src={coverImage} alt="Cover Preview" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-primary/20">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
            </div>
            <Input 
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Paste image URL..."
              className="h-10 text-xs rounded-xl border-primary/10 bg-white/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
               Language
            </label>
            <Select value={language} onValueChange={(val) => setLanguage(val as AppLanguage)}>
              <SelectTrigger className="rounded-2xl border-primary/10 h-10 bg-white/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-2xl">
                <SelectItem value="en">English 🇬🇧</SelectItem>
                <SelectItem value="ar">العربية 🇸🇦</SelectItem>
                <SelectItem value="fr">Français 🇫🇷</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
               <MapPin className="w-2 h-2" /> Origin
            </label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="rounded-2xl border-primary/10 h-10 bg-white/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-2xl">
                {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Genres (Select up to 3)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_GENRES.map(genre => {
                const isActive = genres.includes(genre);
                return (
                  <Badge 
                    key={genre} 
                    variant={isActive ? "default" : "outline"} 
                    className={cn(
                      "cursor-pointer rounded-full text-[9px] transition-all",
                      isActive ? "bg-primary" : "text-muted-foreground hover:border-primary/30"
                    )} 
                    onClick={() => onGenreToggle(genre)}
                  >
                    {genre}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-morphism rounded-[2rem] p-6 bg-primary/5 border-primary/10">
        <h4 className="font-headline text-sm font-bold mb-3 flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-primary" /> Scribe's Tip
        </h4>
        <p className="text-[10px] text-muted-foreground italic leading-relaxed">
          "A visual soul (Cover) speaks volumes before a single word is read. Choose an illustration that reflects the cadence of your heart."
        </p>
      </div>
    </div>
  );
});
