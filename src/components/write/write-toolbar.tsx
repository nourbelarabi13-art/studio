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
    <div className="sticky top-16 z-30 w-full glass-morphism border-b border-primary/10 px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground italic min-w-[140px] sm:min-w-[180px]">
          <Clock className="w-3.5 h-3.5 text-primary/40" />
          <span className="truncate">
            {lastSaved ? (
              `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            ) : (
              'Drafting...'
            )}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 border-l border-primary/10 pl-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <FileText className="w-3 h-3" /> {wordCount.toLocaleString()} words
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:block mr-2">
          {isSaving && (
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-primary animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              Syncing
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleNotes}
          className={cn(
            "rounded-full gap-2 h-10 sm:h-12 px-3 sm:px-5 transition-all",
            isNotesOpen ? "bg-primary text-white shadow-lg" : "text-primary hover:bg-primary/5"
          )}
          title="Toggle Side Notes"
        >
          <StickyNote className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="hidden lg:inline font-bold">Notes</span>
        </Button>

        <div className="hidden sm:block w-px h-6 bg-primary/10 mx-1" />

        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full gap-2 text-primary hover:bg-primary/5 h-10 sm:h-12 px-3 sm:px-5" 
          onClick={onSave} 
          disabled={isSaving}
          title="Save Draft"
        >
          <Save className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline font-bold">Save</span>
        </Button>
        
        <Button 
          onClick={onPublish} 
          disabled={isPublishing} 
          className="rounded-full bg-primary hover:bg-primary/90 px-5 sm:px-8 h-10 sm:h-12 shadow-lg shadow-primary/10 font-bold"
        >
          {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 sm:mr-2" />}
          <span className="hidden sm:inline">Publish</span>
          <span className="sm:hidden">Post</span>
        </Button>
      </div>
    </div>
  );
});