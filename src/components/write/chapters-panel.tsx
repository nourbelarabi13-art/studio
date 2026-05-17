
"use client";

import React from "react";
import { Chapter } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Layout, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ChaptersPanelProps {
  chapters: Chapter[];
  activeId: string;
  isPending: boolean;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onTitleChange: (id: string, title: string) => void;
}

export const ChaptersPanel = React.memo(function ChaptersPanel({
  chapters,
  activeId,
  isPending,
  onSelect,
  onAdd,
  onTitleChange
}: ChaptersPanelProps) {
  return (
    <div className="glass-morphism rounded-[2rem] p-6 border-primary/10 sticky top-36">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline text-lg font-bold flex items-center gap-2">
          <Layout className="w-4 h-4 text-primary" /> Fragments
        </h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full text-primary hover:bg-primary/5" 
          onClick={onAdd}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
        {chapters.map((chap) => (
          <div 
            key={chap.id} 
            className={cn(
              "group p-3 rounded-2xl border cursor-pointer transition-all", 
              activeId === chap.id 
                ? "bg-primary/5 border-primary/20 shadow-sm" 
                : "border-transparent hover:bg-primary/5"
            )} 
            onClick={() => onSelect(chap.id)}
          >
            {activeId === chap.id ? (
              <Input 
                value={chap.title} 
                onChange={(e) => onTitleChange(chap.id, e.target.value)}
                className="bg-transparent border-none h-6 p-0 text-sm font-bold text-primary focus-visible:ring-0"
                autoFocus
              />
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold truncate text-muted-foreground">
                  {chap.title || "Untitled"}
                </p>
                {isPending && activeId === chap.id && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});
