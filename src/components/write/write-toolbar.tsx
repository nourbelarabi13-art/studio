
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Clock, FileText, Loader2, Save, Send, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

interface WriteToolbarProps {
  lastSaved: Date | null;
  isSaving: boolean;
  isPublishing: boolean;
  wordCount: number;
  onSave: () => void;
  onPublish: () => void;
  isNotesOpen: boolean;
  onToggleNotes: () => void;
}

export const WriteToolbar = React.memo(function WriteToolbar({
  lastSaved,
  isSaving,
  isPublishing,
  wordCount,
  onSave,
  onPublish,
  isNotesOpen,
  onToggleNotes
}: WriteToolbarProps) {
  return (
    <div className="sticky top-16 z-30 w-full glass-morphism border-b border-primary/10 px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground italic min-w-[180px]">
          <Clock className="w-3.5 h-3.5 text-primary/40" />
          {lastSaved ? (
            `Saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
          ) : (
            'Drafting...'
          )}
        </div>
        <div className="hidden sm:flex items-center gap-4 border-l border-primary/10 pl-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <FileText className="w-3 h-3" /> {wordCount.toLocaleString()} words
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="mr-2">
          {isSaving && (
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-primary animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              Syncing Archive
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleNotes}
          className={cn(
            "rounded-full gap-2 h-9 px-4 transition-all",
            isNotesOpen ? "bg-primary text-white shadow-lg" : "text-primary hover:bg-primary/5"
          )}
        >
          <StickyNote className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-bold">Notes</span>
        </Button>

        <div className="w-px h-4 bg-primary/10 mx-1 hidden sm:block" />

        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full gap-2 text-primary hover:bg-primary/5 h-9" 
          onClick={onSave} 
          disabled={isSaving}
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Save Draft</span>
        </Button>
        
        <Button 
          onClick={onPublish} 
          disabled={isPublishing} 
          className="rounded-full bg-primary hover:bg-primary/90 px-8 h-9 shadow-lg shadow-primary/10 font-bold"
        >
          {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Publish
        </Button>
      </div>
    </div>
  );
});
