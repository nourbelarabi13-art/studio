
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Novel } from "@/lib/types";
import { User, Eye, Heart, TrendingUp, Zap, Globe, MapPin, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { ReportModal } from "@/components/report-modal";

interface NovelCardProps {
  novel: Novel;
  badge?: 'trending' | 'rising';
}

const LANG_FLAGS: Record<string, string> = {
  en: '🇬🇧',
  ar: '🇸🇦',
  fr: '🇫🇷'
};

export function NovelCard({ novel, badge }: NovelCardProps) {
  const { user } = useUser();
  const [isReportOpen, setIsReportOpen] = useState(false);

  return (
    <div className="group block relative">
      <Card className="overflow-hidden bg-card border-primary/5 group-hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col relative">
        {badge && (
          <div className="absolute top-3 right-3 z-10">
            {badge === 'trending' ? (
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white gap-1 py-1 px-3 border-none shadow-sm animate-pulse">
                <TrendingUp className="w-3 h-3" />
                Trending 🔥
              </Badge>
            ) : (
              <Badge className="bg-primary hover:bg-primary/90 text-white gap-1 py-1 px-3 border-none shadow-sm">
                <Zap className="w-3 h-3" />
                Rising
              </Badge>
            )}
          </div>
        )}

        {user && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsReportOpen(true);
            }}
            className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:text-destructive hover:bg-white/40 shadow-sm"
            title="Summon Guardian"
          >
            <Flag className="w-3 h-3" />
          </button>
        )}

        <Link href={`/read/${novel.id}`} className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={novel.coverImage}
            alt={novel.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-40 transition-opacity" />
          
          <div className="absolute top-3 left-3 flex gap-1">
             <Badge className="bg-white/80 backdrop-blur-md text-primary border-none text-[10px] font-bold px-2 h-6 flex items-center gap-1">
                <span>{LANG_FLAGS[novel.language] || '🌐'}</span>
                {novel.language.toUpperCase()}
             </Badge>
             {novel.country && (
               <Badge className="bg-primary/80 backdrop-blur-md text-white border-none text-[8px] font-bold px-2 h-6 flex items-center gap-1">
                  <MapPin className="w-2 h-2" />
                  {novel.country}
               </Badge>
             )}
          </div>

          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
            {novel.genres.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="secondary" className="bg-white/90 backdrop-blur-sm text-[9px] py-0 px-2 border-none font-bold uppercase tracking-tight text-primary">
                {genre}
              </Badge>
            ))}
          </div>
        </Link>
        
        <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
          <Link href={`/read/${novel.id}`} className="space-y-2">
            <h3 className="font-headline text-xl font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {novel.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2 italic leading-relaxed opacity-80">
              {novel.content.length > 80 ? novel.content.substring(0, 80) + "..." : novel.content}
            </p>
          </Link>
          
          <div className="flex flex-col gap-3 pt-4 border-t border-primary/5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Link href={`/profile/${novel.authorId}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <User className="w-3 h-3 text-primary/60" />
                <span>{novel.authorUsername}</span>
              </Link>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {novel.views || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-primary/40" />
                  {novel.likes || 0}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ReportModal 
        targetId={novel.id} 
        targetType="story" 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
      />
    </div>
  );
}
