
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface EditorCoreProps {
  title: string;
  onTitleChange: (val: string) => void;
  chapterTitle: string;
  content: string;
  onContentChange: (val: string) => void;
  isRtl: boolean;
}

/**
 * Isolated editor component to prevent global re-renders while typing.
 * Uses local state for instant feedback and notifies parent via debounced call.
 */
export const EditorCore = React.memo(function EditorCore({
  title,
  onTitleChange,
  chapterTitle,
  content,
  onContentChange,
  isRtl
}: EditorCoreProps) {
  // We keep local content for the textarea to ensure zero typing lag
  const [localContent, setLocalContent] = useState(content);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync when active chapter changes
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleLocalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalContent(val);

    // Debounce the heavy lifting to parent state
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      onContentChange(val);
    }, 1500); 
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 w-full space-y-4">
          <Input 
            value={title} 
            onChange={(e) => onTitleChange(e.target.value)} 
            placeholder="Untethered Dream..." 
            className="bg-transparent border-none text-5xl font-headline font-bold focus-visible:ring-0 px-0 h-auto" 
          />
          <div className="flex items-center gap-4">
            <div className="h-px bg-primary/10 flex-1" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold italic">
              {chapterTitle || "Untitled Fragment"}
            </span>
            <div className="h-px bg-primary/10 flex-1" />
          </div>
        </div>
      </div>

      <Textarea 
        value={localContent} 
        onChange={handleLocalChange} 
        placeholder="Manifest your thoughts..." 
        className={cn(
          "writing-editor min-h-[70vh] bg-transparent border-none resize-none focus-visible:ring-0 p-0 text-xl leading-relaxed font-body",
          isRtl && "text-right"
        )} 
        dir={isRtl ? 'rtl' : 'ltr'} 
      />
    </div>
  );
});
