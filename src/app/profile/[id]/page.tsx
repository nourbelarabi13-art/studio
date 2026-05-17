
"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { NovelCard } from "@/components/novel-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, 
  User, 
  Users, 
  Heart, 
  BookOpen, 
  Eye, 
  Quote, 
  Zap,
  Trophy,
  AlertCircle,
  Sparkles,
  Settings,
  Edit3,
  Save,
  X,
  Camera
} from "lucide-react";
import { useFirestore, useDoc, useUser, useCollection } from "@/firebase";
import { doc, collection, query, where, orderBy, updateDoc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { UserProfile, Novel } from "@/lib/types";
import { toggleFollow } from "@/firebase/firestore/social-actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ACHIEVEMENTS } from "@/lib/achievements";
import Link from "next/link";

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'latest' | 'popular'>('latest');
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  
  // Inline Bio State
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [localBio, setLocalBio] = useState("");
  const [isSavingBio, setIsSavingBio] = useState(false);

  const profileRef = useMemoFirebase(() => {
    if (!db || !id || id === 'undefined' || id === 'null') return null;
    return doc(db, "users", id as string);
  }, [db, id]);
  const { data: profile, loading: profileLoading } = useDoc<UserProfile>(profileRef);

  useEffect(() => {
    if (id) {
      // Load Avatar from localStorage
      const storedAvatar = localStorage.getItem(`rosaline_avatar_${id}`);
      if (storedAvatar) setLocalAvatar(storedAvatar);
      
      // Load Bio from localStorage
      const storedBio = localStorage.getItem(`rosaline_bio_${id}`);
      if (storedBio) setLocalBio(storedBio);
    }
  }, [id]);

  // Sync state with profile data when it arrives
  useEffect(() => {
    if (profile) {
      const storedBio = localStorage.getItem(`rosaline_bio_${profile.uid}`);
      setLocalBio(storedBio || profile.bio || "");
    }
  }, [profile]);

  const followRef = useMemoFirebase(() => {
    if (!db || !currentUser || !id || id === 'undefined' || id === 'null') return null;
    return doc(db, "follows", `${currentUser.uid}_${id}`);
  }, [db, currentUser, id]);
  const { data: followStatus } = useDoc(followRef);

  const novelsQuery = useMemoFirebase(() => {
    if (!db || !id || id === 'undefined' || id === 'null') return null;
    return query(
      collection(db, "novels"),
      where("authorId", "==", id),
      where("isDraft", "==", false),
      orderBy(sortOrder === 'latest' ? "publishedAt" : "views", "desc")
    );
  }, [db, id, sortOrder]);
  const { data: novels, loading: novelsLoading } = useCollection<Novel>(novelsQuery);

  const readingProgressQuery = useMemoFirebase(() => {
    if (!db || !id || id === 'undefined' || id === 'null') return null;
    return query(collection(db, "users", id as string, "progress"));
  }, [db, id]);
  const { data: readingProgress } = useCollection(readingProgressQuery);

  const handleFollow = async () => {
    if (!currentUser) {
      toast({ title: "Identification Required", description: "Please sign in to follow this traveler.", variant: "destructive" });
      return;
    }
    if (!db || !id) return;

    setIsFollowingLoading(true);
    const followed = await toggleFollow(db, currentUser.uid, id as string);
    setIsFollowingLoading(false);

    toast({
      title: followed ? "Followed" : "Unfollowed",
      description: followed ? `You are now following ${profile?.username}.` : `You have stopped following ${profile?.username}.`,
    });
  };

  const handleSaveBio = async () => {
    if (!db || !id || !profile) return;
    setIsSavingBio(true);

    try {
      // 1. Save to local storage instantly
      localStorage.setItem(`rosaline_bio_${profile.uid}`, localBio);

      // 2. Persist to Firestore Archive
      await updateDoc(doc(db, "users", profile.uid), {
        bio: localBio,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Manifesto Updated",
        description: "Your new bio has been woven into your persona scroll.",
      });
      setIsEditingBio(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ritual Interrupted",
        description: "The Archive could not record your new bio.",
      });
    } finally {
      setIsSavingBio(false);
    }
  };

  if (id === 'undefined' || id === 'null') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-4">
        <AlertCircle className="w-12 h-12 text-destructive opacity-50" />
        <h1 className="text-2xl font-bold">Invalid Profile Path</h1>
        <p className="text-muted-foreground">The traveler identification provided is invalid.</p>
        <Button onClick={() => router.push("/")}>Return to Home</Button>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-4">
        <AlertCircle className="w-12 h-12 text-destructive opacity-50" />
        <h1 className="text-2xl font-bold">Traveler Not Found</h1>
        <p className="text-muted-foreground">The profile you are looking for does not exist in our archive.</p>
        <Button onClick={() => router.push("/")}>Return to Home</Button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.uid === profile.uid;
  const isGrandArchivist = (profile.achievements?.length || 0) >= ACHIEVEMENTS.length - 1;

  const statsForAchievements = {
    publishedCount: profile.publishedCount || 0,
    totalViews: profile.totalViews || 0,
    totalLikes: profile.totalLikes || 0,
    readingCount: readingProgress?.length || 0,
    maxViews: novels?.reduce((max, n) => Math.max(max, n.views || 0), 0) || 0
  };

  const displayAvatar = (isOwnProfile && localAvatar) ? localAvatar : (profile.avatar || localAvatar);

  return (
    <div className="min-h-screen dreamy-fantasy-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-6xl space-y-16">
        <header className="glass-morphism rounded-[3rem] p-12 flex flex-col md:flex-row items-center md:items-start gap-12 border-primary/10 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <div className="relative shrink-0">
            <div className="w-44 h-44 rounded-[2.5rem] bg-white flex items-center justify-center text-primary border-4 border-primary/10 shadow-2xl relative overflow-hidden group/avatar">
               {displayAvatar ? (
                 <Image src={displayAvatar} alt={profile.username} fill className="object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
               ) : (
                 <User className="w-20 h-20 text-primary/20" />
               )}
               {isOwnProfile && (
                 <Link 
                   href="/profile/edit"
                   className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] opacity-0 group-hover/avatar:opacity-100 transition-all flex flex-col items-center justify-center text-white"
                 >
                   <Camera className="w-10 h-10 drop-shadow-md" />
                   <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Refine Avatar</span>
                 </Link>
               )}
            </div>
            {isGrandArchivist && (
              <div className="absolute -bottom-3 -right-3 bg-primary text-white p-2.5 rounded-2xl shadow-xl ring-4 ring-white">
                <Trophy className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-6 text-center md:text-left w-full">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="font-headline text-5xl font-bold">{profile.username}</h1>
                {isGrandArchivist && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-4 py-1 text-[10px] uppercase tracking-widest font-bold">
                    Grand Archivist
                  </Badge>
                )}
              </div>
              
              {profile.status && (
                <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-1.5 rounded-full text-xs font-bold border border-primary/10">
                   <Sparkles className="w-3 h-3" />
                   {profile.status}
                </div>
              )}

              {/* Editable Bio Section */}
              <div className="relative group/bio min-h-[60px] space-y-2">
                {isEditingBio ? (
                  <div className="space-y-3 animate-fade-in">
                    <Textarea 
                      value={localBio}
                      onChange={(e) => setLocalBio(e.target.value)}
                      placeholder="Tell the sanctuary about your spirit..."
                      className="bg-primary/5 border-primary/10 min-h-[120px] rounded-2xl italic leading-relaxed text-lg focus-visible:ring-primary/20"
                    />
                    <div className="flex justify-center md:justify-start gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleSaveBio} 
                        disabled={isSavingBio}
                        className="rounded-full bg-primary hover:bg-primary/90 gap-2 h-9 px-6 text-[10px] uppercase font-bold tracking-widest"
                      >
                        {isSavingBio ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          setLocalBio(profile.bio || "");
                          setIsEditingBio(false);
                        }}
                        className="rounded-full gap-2 h-9 px-6 text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:bg-primary/5"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {localBio ? (
                      <div className="group/text flex flex-col md:flex-row items-start gap-4">
                        <p className="text-muted-foreground italic text-lg leading-relaxed max-w-2xl flex-1">
                          <Quote className="inline-block w-4 h-4 mr-2 opacity-20" />
                          {localBio}
                        </p>
                        {isOwnProfile && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setIsEditingBio(true)}
                            className="rounded-full h-8 w-8 text-primary/40 hover:text-primary hover:bg-primary/5 opacity-0 group-hover/bio:opacity-100 transition-opacity"
                            title="Refine Manifesto"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ) : isOwnProfile ? (
                      <button 
                        onClick={() => setIsEditingBio(true)}
                        className="text-muted-foreground/60 italic text-sm hover:text-primary transition-colors flex items-center gap-2 py-4"
                      >
                        <Edit3 className="w-4 h-4" />
                        Write your spirit's manifesto...
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold">{profile.totalViews || 0}</span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Total Views</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Heart className="w-4 h-4 text-primary fill-primary/10" />
                  <span className="text-2xl font-bold">{profile.totalLikes || 0}</span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Appreciation</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold">{profile.followerCount || 0}</span>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Followers</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
              {!isOwnProfile && (
                <Button 
                  size="lg" 
                  onClick={handleFollow}
                  disabled={isFollowingLoading}
                  className={cn(
                    "rounded-full px-10 h-14 font-headline text-lg shadow-xl transition-all",
                    followStatus ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                  )}
                >
                  {isFollowingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : followStatus ? "Unfollow" : "Follow"}
                </Button>
              )}
              {isOwnProfile && (
                <div className="flex gap-4">
                  <Link href="/profile/edit">
                    <Button 
                      className="rounded-full px-10 h-14 bg-primary text-white hover:bg-primary/90 font-headline text-lg shadow-xl shadow-primary/20"
                    >
                      Refine Persona
                    </Button>
                  </Link>
                  <Button 
                    variant="outline"
                    className="rounded-full px-10 h-14 border-primary/20 text-primary hover:bg-primary/5 font-headline text-lg"
                    onClick={() => router.push('/settings')}
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Settings
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b border-primary/5 pb-6">
            <Trophy className="w-6 h-6 text-primary" />
            <h2 className="font-headline text-3xl font-bold">Achievements</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACHIEVEMENTS.map((def) => {
              const isUnlocked = profile.achievements?.includes(def.id);
              const currentVal = statsForAchievements[def.metric];
              const progress = Math.min(100, (currentVal / def.threshold) * 100);
              
              return (
                <div 
                  key={def.id} 
                  className={cn(
                    "glass-morphism rounded-3xl p-6 border-primary/5 space-y-4 transition-all",
                    isUnlocked ? "bg-white/90 shadow-md ring-1 ring-primary/10" : "opacity-60 grayscale-[0.5]"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                      isUnlocked ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}>
                      <def.icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">{def.name}</p>
                      <p className="text-[10px] text-muted-foreground italic leading-tight">{def.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                      <span>{isUnlocked ? "Manifested" : "Progress"}</span>
                      <span>{Math.min(currentVal, def.threshold)} / {def.threshold}</span>
                    </div>
                    <Progress value={progress} className={cn("h-1", isUnlocked ? "bg-primary/20" : "bg-muted")} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-8">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              <h2 className="font-headline text-3xl font-bold">Published Archive</h2>
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
            <div className="text-center py-20 italic text-muted-foreground bg-white/30 rounded-[3rem] border border-dashed border-primary/10 flex flex-col items-center gap-4">
              <BookOpen className="w-12 h-12 opacity-20" />
              <p>No published works were found in this traveler's archive.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
