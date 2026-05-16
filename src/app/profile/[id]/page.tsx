
"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { NovelCard } from "@/components/novel-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  User, 
  Users, 
  Heart, 
  BookOpen, 
  Star, 
  Eye, 
  Quote, 
  TrendingUp, 
  Zap,
  Award
} from "lucide-react";
import { useFirestore, useDoc, useUser, useCollection } from "@/firebase";
import { doc, collection, query, where, orderBy } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { UserProfile, Novel } from "@/lib/types";
import { toggleFollow } from "@/firebase/firestore/social-actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function ProfilePage() {
  const { id } = useParams();
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'latest' | 'popular'>('latest');

  const profileRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, "users", id as string);
  }, [db, id]);
  const { data: profile, loading: profileLoading } = useDoc<UserProfile>(profileRef);

  const followRef = useMemoFirebase(() => {
    if (!db || !currentUser || !id) return null;
    return doc(db, "follows", `${currentUser.uid}_${id}`);
  }, [db, currentUser, id]);
  const { data: followStatus } = useDoc(followRef);

  const novelsQuery = useMemoFirebase(() => {
    if (!db || !id) return null;
    return query(
      collection(db, "novels"),
      where("authorId", "==", id),
      where("isDraft", "==", false),
      orderBy(sortOrder === 'latest' ? "publishedAt" : "views", "desc")
    );
  }, [db, id, sortOrder]);
  const { data: novels, loading: novelsLoading } = useCollection<Novel>(novelsQuery);

  const popularStory = useMemo(() => {
    if (!novels || novels.length === 0) return null;
    return [...novels].sort((a, b) => (b.views || 0) - (a.views || 0))[0];
  }, [novels]);

  const handleFollow = async () => {
    if (!currentUser) {
      toast({ title: "Identify Yourself", description: "Join our archive to follow travelers.", variant: "destructive" });
      return;
    }
    if (!db || !id) return;

    setIsFollowingLoading(true);
    const followed = await toggleFollow(db, currentUser.uid, id as string);
    setIsFollowingLoading(false);

    toast({
      title: followed ? "Path Joined" : "Path Diverged",
      description: followed ? `You are now following ${profile?.username}.` : `You have stopped following ${profile?.username}.`,
    });
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center italic text-muted-foreground">
        The traveler you seek has vanished into the mist.
      </div>
    );
  }

  const isOwnProfile = currentUser?.uid === profile.uid;
  const isTopWriter = (profile.totalViews || 0) > 1000 || (profile.followerCount || 0) > 100;

  return (
    <div className="min-h-screen dreamy-fantasy-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-6xl space-y-16">
        {/* Profile Header */}
        <header className="glass-morphism rounded-[3rem] p-12 flex flex-col md:flex-row items-center md:items-start gap-12 border-primary/10 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <div className="relative shrink-0">
            <div className="w-40 h-40 rounded-[2.5rem] bg-white flex items-center justify-center text-primary border-4 border-primary/10 shadow-2xl relative overflow-hidden group">
               <User className="w-20 h-20 text-primary/20" />
               <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {isTopWriter && (
              <div className="absolute -bottom-3 -right-3 bg-primary text-white p-2.5 rounded-2xl shadow-xl ring-4 ring-white animate-bounce">
                <Award className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="font-headline text-5xl font-bold">{profile.username}</h1>
                {profile.role === 'writer' && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 rounded-full px-4 py-1 text-[10px] uppercase tracking-widest font-bold">
                    Celestial Scribe
                  </Badge>
                )}
              </div>
              {profile.bio ? (
                <p className="text-muted-foreground italic text-lg leading-relaxed max-w-2xl">
                  <Quote className="inline-block w-4 h-4 mr-2 opacity-20" />
                  {profile.bio}
                </p>
              ) : (
                <p className="text-muted-foreground italic text-sm opacity-50">This dreamer has not yet written their bio into the archive.</p>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-10">
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold">{profile.totalViews || 0}</span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Total Reach</p>
              </div>
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Heart className="w-4 h-4 text-primary fill-primary/10" />
                  <span className="text-2xl font-bold">{profile.totalLikes || 0}</span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Appreciation</p>
              </div>
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold">{profile.followerCount || 0}</span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Travelers Following</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
              {!isOwnProfile && (
                <Button 
                  size="lg" 
                  onClick={handleFollow}
                  disabled={isFollowingLoading}
                  className={cn(
                    "rounded-full px-10 h-14 font-headline text-lg shadow-xl transition-all hover:scale-105",
                    followStatus ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                  )}
                >
                  {isFollowingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : followStatus ? "Unfollow Traveler" : "Join Path"}
                </Button>
              )}
              {isOwnProfile && (
                <Button 
                  variant="outline"
                  className="rounded-full px-10 h-14 border-primary/20 text-primary hover:bg-primary/5 font-headline text-lg"
                  onClick={() => router.push('/settings')}
                >
                  Manifest Changes
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Popular Story Highlight */}
        {popularStory && (
          <section className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3 border-b border-primary/5 pb-6">
              <Zap className="w-6 h-6 text-primary" />
              <h2 className="font-headline text-3xl font-bold">Most Famous Manifestation</h2>
            </div>
            <div className="glass-morphism rounded-[3rem] p-8 border-primary/5 flex flex-col md:flex-row gap-8 items-center bg-white/40">
              <div className="relative w-48 h-64 rounded-3xl overflow-hidden shadow-2xl shrink-0">
                <Image src={popularStory.coverImage} alt={popularStory.title} fill className="object-cover" />
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="space-y-2">
                  <h3 className="font-headline text-4xl font-bold">{popularStory.title}</h3>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {popularStory.genres.map(g => (
                      <Badge key={g} variant="outline" className="rounded-full text-[9px] uppercase tracking-widest border-primary/20 text-primary">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground italic line-clamp-3 text-lg leading-relaxed">
                  {popularStory.content.substring(0, 300)}...
                </p>
                <div className="flex flex-wrap gap-6 pt-2 justify-center md:justify-start">
                   <div className="flex items-center gap-2 text-primary">
                      <Eye className="w-4 h-4" />
                      <span className="font-bold">{popularStory.views} Views</span>
                   </div>
                   <div className="flex items-center gap-2 text-primary">
                      <Heart className="w-4 h-4 fill-primary/10" />
                      <span className="font-bold">{popularStory.likes} Likes</span>
                   </div>
                </div>
                <Button onClick={() => router.push(`/read/${popularStory.id}`)} className="rounded-full px-8 h-12 bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none font-bold uppercase tracking-widest text-[10px]">
                  Read This Chronicle
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Full Archive */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-8">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              <h2 className="font-headline text-3xl font-bold">The Published Archive</h2>
            </div>
            
            <div className="flex gap-2 bg-primary/5 p-1 rounded-full border border-primary/10">
              <Button 
                variant={sortOrder === 'latest' ? 'default' : 'ghost'} 
                size="sm"
                className="rounded-full text-[9px] uppercase tracking-widest h-8"
                onClick={() => setSortOrder('latest')}
              >
                Newest
              </Button>
              <Button 
                variant={sortOrder === 'popular' ? 'default' : 'ghost'} 
                size="sm"
                className="rounded-full text-[9px] uppercase tracking-widest h-8"
                onClick={() => setSortOrder('popular')}
              >
                Most Popular
              </Button>
            </div>
          </div>

          {novelsLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : novels && novels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {novels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 italic text-muted-foreground bg-white/30 rounded-[3rem] border border-dashed border-primary/10 flex flex-col items-center gap-4">
              <BookOpen className="w-12 h-12 opacity-20" />
              <p>No published fragments were found in this traveler's archive.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
