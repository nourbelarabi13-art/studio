
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { NovelCard } from "@/components/novel-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Users, Heart, BookOpen, Star } from "lucide-react";
import { useFirestore, useDoc, useUser, useCollection } from "@/firebase";
import { doc, collection, query, where, orderBy } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { UserProfile, Novel } from "@/lib/types";
import { toggleFollow } from "@/firebase/firestore/social-actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { id } = useParams();
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

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
      orderBy("publishedAt", "desc")
    );
  }, [db, id]);
  const { data: novels, loading: novelsLoading } = useCollection<Novel>(novelsQuery);

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

  return (
    <div className="min-h-screen dreamy-fantasy-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-5xl space-y-16">
        {/* Profile Header */}
        <header className="glass-morphism rounded-[3rem] p-12 flex flex-col md:flex-row items-center gap-12 border-primary/10 shadow-xl">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-inner">
              <User className="w-16 h-16" />
            </div>
            {profile.role === 'writer' && (
              <div className="absolute -bottom-2 -right-2 bg-accent text-accent-foreground p-2 rounded-full shadow-lg">
                <Star className="w-4 h-4 fill-current" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <h1 className="font-headline text-4xl font-bold">{profile.username}</h1>
              <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-primary/20 text-primary rounded-full">
                {profile.role}
              </Badge>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-bold">{profile.followerCount || 0}</span>
                <span className="text-xs text-muted-foreground italic">Followers</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-bold">{profile.followingCount || 0}</span>
                <span className="text-xs text-muted-foreground italic">Following</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="font-bold">{novels?.length || 0}</span>
                <span className="text-xs text-muted-foreground italic">Chronicles</span>
              </div>
            </div>
          </div>

          {!isOwnProfile && (
            <Button 
              size="lg" 
              onClick={handleFollow}
              disabled={isFollowingLoading}
              className={cn(
                "rounded-full px-10 h-14 font-headline text-lg shadow-lg transition-all",
                followStatus ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : "bg-primary text-white hover:bg-primary/90"
              )}
            >
              {isFollowingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : followStatus ? "Unfollow" : "Follow Scribe"}
            </Button>
          )}
        </header>

        {/* User's Work */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b border-primary/5 pb-6">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="font-headline text-3xl font-bold">The Published Archive</h2>
          </div>

          {novelsLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : novels && novels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {novels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 italic text-muted-foreground bg-white/30 rounded-3xl border border-dashed border-primary/10">
              No chronicles have been manifested yet.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
