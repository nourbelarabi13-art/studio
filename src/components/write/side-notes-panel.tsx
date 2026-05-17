
"use client";

import React, { useState } from "react";
import { SideNote } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  StickyNote, 
  Plus, 
  Trash2, 
  X, 
  Loader2, 
  Sparkles,
  Clock
} from "lucide-react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { addSideNote, deleteSideNote } from "@/firebase/firestore/note-actions";
import { cn } from "@/lib/utils";

interface SideNotesPanelProps {
  novelId: string | null;
  chapterId: string;
  onClose: () => void;
}

export const SideNotesPanel = React.memo(function SideNotesPanel({
  novelId,
  chapterId,
  onClose
}: SideNotesPanelProps) {
  const db = useFirestore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const notesQuery = useMemoFirebase(() => {
    if (!db || !novelId) return null;
    return query(
      collection(db, "novels", novelId, "notes"),
      where("chapterId", "==", chapterId),
      orderBy("createdAt", "desc")
    );
  }, [db, novelId, chapterId]);

  const { data: notes, loading } = useCollection<SideNote>(notesQuery);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !novelId || !newContent.trim()) return;

    addSideNote(db, novelId, {
      novelId,
      chapterId,
      title: newTitle.trim() || undefined,
      content: newContent.trim()
    });

    setNewTitle("");
    setNewContent("");
    setIsAdding(false);
  };

  const handleDelete = (noteId: string) => {
    if (!db || !novelId) return;
    deleteSideNote(db, novelId, noteId);
  };

  return (
    <div className="glass-morphism rounded-[2rem] border-primary/10 h-full flex flex-col overflow-hidden animate-fade-in shadow-xl">
      <div className="p-6 border-b border-primary/5 flex items-center justify-between bg-primary/5">
        <div className="flex items-center gap-3">
          <StickyNote className="w-5 h-5 text-primary" />
          <h3 className="font-headline text-lg font-bold">Side Notes</h3>
          {notes && notes.length > 0 && (
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
              {notes.length}
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {!isAdding ? (
          <Button 
            onClick={() => setIsAdding(true)}
            className="w-full h-12 rounded-2xl border-dashed border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 gap-2 font-bold"
          >
            <Plus className="w-4 h-4" />
            Add Scribe Whisper
          </Button>
        ) : (
          <form onSubmit={handleAdd} className="space-y-4 bg-white/50 p-5 rounded-[1.8rem] border border-primary/10 shadow-sm animate-fade-in">
            <Input 
              placeholder="Whisper Title (Optional)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-white border-primary/5 h-10 text-xs rounded-xl"
            />
            <Textarea 
              placeholder="Manifest your fleeting thought..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="bg-white border-primary/5 min-h-[100px] text-xs rounded-xl resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1 rounded-xl bg-primary h-9 font-bold text-[10px] uppercase">
                Save Fragment
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="rounded-xl h-9 font-bold text-[10px] uppercase">
                Cancel
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground italic">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-[10px]">Recalling whispers...</p>
          </div>
        ) : !notes || notes.length === 0 ? (
          <div className="text-center py-20 opacity-40 flex flex-col items-center gap-4">
            <Sparkles className="w-10 h-10 text-primary" />
            <p className="text-[11px] italic">No side notes have manifested for this fragment yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div 
                key={note.id}
                className="group relative bg-white/60 border border-primary/5 p-5 rounded-[1.8rem] hover:border-primary/20 transition-all hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    {note.title && (
                      <h4 className="font-bold text-xs text-primary leading-tight">{note.title}</h4>
                    )}
                    <button 
                      onClick={() => handleDelete(note.id!)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground/90 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="flex items-center gap-1.5 pt-2 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(note.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-primary/5 text-[9px] text-center italic text-muted-foreground/60">
        "Notes are only visible to the scribe's eye."
      </div>
    </div>
  );
});
