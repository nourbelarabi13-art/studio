"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Novel } from "@/lib/types";
import { BookOpen, User } from "lucide-react";

interface NovelCardProps {
  novel: Novel;
}

export function NovelCard({ novel }: NovelCardProps) {
  return (
    <Link href={`/read/${novel.id}`} className="group block">
      <Card className="overflow-hidden bg-card border-primary/5 group-hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={novel.coverImage}
            alt={novel.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-40 transition-opacity" />
          
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {novel.genres.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="secondary" className="bg-white/80 backdrop-blur-sm text-[9px] py-0 px-2 border-none font-bold uppercase tracking-tight text-primary">
                {genre}
              </Badge>
            ))}
          </div>
        </div>
        
        <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-headline text-2xl font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {novel.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2 italic leading-relaxed opacity-80">
              {novel.content.length > 100 ? novel.content.substring(0, 100) + "..." : novel.content}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-muted-foreground text-[10px] font-bold uppercase tracking-widest pt-4 border-t border-primary/5">
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-primary/60" />
              <span className="group-hover:text-foreground transition-colors">{novel.authorUsername}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-3 h-3 text-primary/60" />
              <span>Read</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}