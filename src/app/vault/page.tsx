"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Novel } from "@/lib/types";
import { Book, Edit3, Trash2, Plus, Loader2, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, deleteDoc, doc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function VaultPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const novelsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, "novels"),
      where("authorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [user, db]);

  const { data: novels, loading } = useCollection<Novel>(novelsQuery);

  const handleDelete = async (novelId: string) => {
    if (!confirm("Are you sure you wish to remove this story?")) return;
    deleteDoc(doc(db, "novels", novelId)).then(() => {
      toast({ title: "Removed", description: "The story has been cleared from your vault." });
    }).catch(async () => {
      errorEmitter.emit("permission-error", new FirestorePermissionError({ path: `novels/${novelId}`, operation: "delete" }));
    });
  };

  const publishedCount = novels?.filter(n => !n.isDraft).length || 0;
  const draftCount = novels?.filter(n => n.isDraft).length || 0;

  return (
    <div className="min-h-screen dreamy-fantasy-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-12 space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Heart className="w-6 h-6" />
              </div>
              <h1 className="font-headline text-4xl font-bold">My Personal Vault</h1>
            </div>
            <p className="text-muted-foreground italic">A quiet space for your growing archive of dreams.</p>
          </div>
          <Link href="/write">
            <Button size="lg" className="bg-primary hover:bg-primary/90 h-14 px-8 rounded-full gap-2 shadow-lg shadow-primary/10">
              <Plus className="w-5 h-5" />
              New Story
            </Button>
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="glass-morphism rounded-3xl p-8 space-y-6">
              <h3 className="font-headline text-xl font-bold">Story Insights</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/5 rounded-2xl p-5 text-center border border-primary/10">
                  <span className="block text-3xl font-bold text-primary">{publishedCount}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Published</span>
                </div>
                <div className="bg-accent/5 rounded-2xl p-5 text-center border border-accent/10">
                  <span className="block text-3xl font-bold text-accent-foreground">{draftCount}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Drafts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="italic">Opening the vault doors...</p>
              </div>
            ) : novels?.length === 0 ? (
              <div className="text-center py-20 glass-morphism rounded-3xl border-dashed border-primary/20">
                <p className="text-muted-foreground italic mb-6">Your vault is waiting for your first story.</p>
                <Link href="/write"><Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 rounded-full">Start Writing</Button></Link>
              </div>
            ) : (
              <div className="grid gap-6">
                {novels?.map((novel) => (
                  <Card key={novel.id} className="bg-card/60 border-primary/5 overflow-hidden group hover:border-primary/20 transition-all rounded-3xl">
                    <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                      <div className="relative w-24 h-32 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                        <Image src={novel.coverImage} alt={novel.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-headline text-2xl font-bold group-hover:text-primary transition-colors">{novel.title}</h3>
                          {novel.isDraft ? (
                            <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-none text-[9px] px-2 py-0">DRAFT</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-primary/20 text-primary border-none text-[9px] px-2 py-0">PUBLISHED</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">{novel.genres.map(g => (<span key={g} className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">{g}</span>))}</div>
                        <p className="text-sm text-muted-foreground line-clamp-2 italic opacity-80">{novel.content.substring(0, 150)}...</p>
                      </div>
                      <div className="flex items-center gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-primary/5 pt-4 md:pt-0 md:pl-6">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary"><Edit3 className="w-5 h-5" /></Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(novel.id)}><Trash2 className="w-5 h-5" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}