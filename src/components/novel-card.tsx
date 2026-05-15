
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
      <Card className="overflow-hidden bg-card/40 border-white/5 group-hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={novel.coverImage}
            alt={novel.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
            {novel.genres.map((genre) => (
              <Badge key={genre} variant="secondary" className="bg-black/60 backdrop-blur-sm text-[10px] py-0 px-2 border-white/10">
                {genre}
              </Badge>
            ))}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-headline text-xl font-bold mb-1 line-clamp-1 group-hover:text-accent transition-colors">
            {novel.title}
          </h3>
          <div className="flex items-center justify-between text-muted-foreground text-xs italic">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{novel.authorUsername}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>Read Story</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
