"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
  Camera,
  Moon,
  PenTool,
  Library,
  MessageSquare,
  ArrowLeft
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

const SANCTUARY_BADGES = [
  {
    id: 'dream-reader',
    name: 'Dream Reader',
    arabicName: 'قارئ حالم',
    icon: Moon,
    color: 'from-purple-500/20 to-indigo-500/20',
    iconColor: 'text-indigo-400',
    glow: 'shadow-indigo-500/20'
  },
  {
    id: 'mystic-writer',
    name: 'Mystic Writer',
    arabicName: 'كاتب غامض',
    icon: PenTool,
    color: 'from-primary/20 to-rose-500/20',
    iconColor: 'text-primary',
    glow: 'shadow-primary/20'
  },
  {
    id: 'archive-explorer',
    name: 'Archive Explorer',
    arabicName: 'مستكشف الأرشيف',
    icon: Library,
    color: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-500',
    glow: 'shadow-amber-500/20'
  }
];

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'latest' | 'popular'>('latest');
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [localBanner, setLocalBanner] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [localBio, setLocalBio] = useState("");
  const [isSavingBio, setIsSavingBio] = useState(false);

  // Robust check for ID
  const validId = useMemo(() => {
    if (!id || id === 'undefined' || id === 'null') return null;
    return id as string;
  }, [id]);

  const profileRef = useMemoFirebase(() => {
    if (!db || !validId) return null;
    return doc(db, "users", validId);
  }, [db, validId]);
  
  const { data: profile, loading: profileLoading } = useDoc<UserProfile>(profileRef);

  useEffect(() => {
    if (validId) {
      const storedAvatar = localStorage.getItem(`rosaline_avatar_${validId}`);
      if (storedAvatar) setLocalAvatar(storedAvatar);
      const storedBio = localStorage.getItem(`rosaline_bio_${validId}`);
      if (storedBio) setLocalBio(storedBio);
      const storedBanner = localStorage.getItem(`rosaline_banner_${validId}`);
      if (storedBanner) setLocalBanner(storedBanner);
    }
  }, [validId]);

  useEffect(() => {
    if (profile) {
      const storedBio = localStorage.getItem(`rosaline_bio_${profile.uid}`);
      setLocalBio(storedBio || profile.bio || "");
    }
  }, [profile]);

  const followRef = useMemoFirebase(() => {
    if (!db || !currentUser || !validId) return null;
    return doc(db, "follows", `${currentUser.uid}_${validId}`);
  }, [db, currentUser, validId]);
  const { data: followStatus } = useDoc(followRef);

  const novelsQuery = useMemoFirebase(() => {
    if (!db || !validId) return null;
    return query(
      collection(db, "novels"),
      where("authorId", "==", validId),
      where("isDraft", "==", false),
      orderBy(sortOrder === 'latest' ? "publishedAt" : "views", "desc")
    );
  }, [db, validId, sortOrder]);
  const { data: novels, loading: novelsLoading } = useCollection<Novel>(novelsQuery);

  const readingProgressQuery = useMemoFirebase(() => {
    if (!db || !validId) return null;
    return query(collection(db, "users", validId, "progress"));
  }, [db, validId]);
  const { data: readingProgress } = useCollection(readingProgressQuery);

  const handleFollow = async () => {
    if (!currentUser) {
      toast({ title: "Identification Required", description: "Please sign in to follow this traveler.", variant: "destructive" });
      return;
    }
    if (!db || !validId) return;

    setIsFollowingLoading(true);
    const followed = await toggleFollow(db, currentUser.uid, validId);
    setIsFollowingLoading(false);

    toast({
      title: followed ? "Followed" : "Unfollowed",
      description: followed ? `You are now following ${profile?.username}.` : `You have stopped following ${profile?.username}.`,
    });
  };

  const handleSaveBio = async () => {
    if (!db || !validId || !profile) return;
    setIsSavingBio(true);

    try {
      localStorage.setItem(`rosaline_bio_${profile.uid}`, localBio);
      await updateDoc(doc(db, "users", profile.uid), {
        bio: localBio,
        updatedAt: new Date().toISOString()
      });

      toast({ title: "Manifesto Updated", description: "Your bio has been woven into your persona." });
      setIsEditingBio(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Ritual Interrupted" });
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast({ variant: "destructive", title: "Fragment Too Heavy", description: "Banner must be under 1MB." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLocalBanner(base64);
      if (validId) localStorage.setItem(`rosaline_banner_${validId}`, base64);
      toast({ title: "Sanctuary Gilded" });
    };
    reader.readAsDataURL(file);
  };

  if (!validId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-6 dreamy-fantasy-gradient">
        <AlertCircle className="w-16 h-16 text-destructive opacity-40" />
        <h1 className="text-3xl font-headline font-bold">Invalid Identification</h1>
        <p className="text-muted-foreground italic">The traveler's path is obscured in the mists.</p>
        <Button onClick={() => router.push("/")} className="rounded-full px-8 h-14 text-lg">Return to Archive</Button>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground italic font-body animate-pulse">Consulting the Archive...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-6 dreamy-fantasy-gradient">
        <Library className="w-16 h-16 text-muted-foreground opacity-30" />
        <h1 className="text-4xl font-headline font-bold">Traveler Not Found</h1>
        <p className="text-muted-foreground italic max-w-md">This dreamer has not yet manifested their presence in the global Archive.</p>
        <Button onClick={() => router.push("/")} className="rounded-full px-8 h-14 bg-primary text-white shadow-xl shadow-primary/20">Wander Home</Button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.uid === profile.uid;
  const displayAvatar = (isOwnProfile && localAvatar) ? localAvatar : (profile.avatar || localAvatar);
  const isGrandArchivist = (profile.achievements?.length || 0) >= ACHIEVEMENTS.length - 1;

  const statsForAchievements = {
    publishedCount: profile.publishedCount || 0,
    totalViews: profile.totalViews || 0,
    totalLikes: profile.totalLikes || 0,
    readingCount: readingProgress?.length || 0,
    maxViews: novels?.reduce((max, n) => Math.max(max, n.views || 0), 0) || 0
  };

  return (
    <div className="min-h-screen dreamy-fantasy-gradient pb-20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 sm:py-16 max-w-6xl space-y-12 sm:space-y-20">
        
        <div className="md:hidden flex items-center gap-4 mb-4">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-full bg-white/50 border border-primary/10">
              <ArrowLeft className="w-6 h-6" />
           </Button>
           <h2 className="font-headline text-xl font-bold">Traveler Profile</h2>
        </div>

        <header className="glass-morphism rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-14 flex flex-col items-center md:items-start gap-10 sm:gap-14 border-primary/10 shadow-2xl relative overflow-hidden group/header">
          {(localBanner || profile.avatar) && (
            <div className="absolute inset-0 z-0">
               <Image src={localBanner || profile.avatar || ""} alt="Banner" fill className="object-cover opacity-20 blur-[3px]" />
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
            </div>
          )}
          
          {isOwnProfile && (
            <div className="absolute top-6 right-6 z-30">
               <Button 
                 variant="ghost" 
                 size="icon" 
                 onClick={() => bannerInputRef.current?.click()}
                 className="bg-white/30 backdrop-blur-md border border-white/40 text-white rounded-full h-12 w-12 hover:bg-white/50 transition-all md:opacity-0 group-header/header:opacity-100"
               >
                 <Camera className="w-5 h-5" />
               </Button>
               <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleBannerUpload} />
            </div>
          )}

          <div className="relative shrink-0 z-20">
            <div className="w-36 h-36 sm:w-52 sm:h-52 rounded-[2rem] sm:rounded-[3rem] bg-white flex items-center justify-center text-primary border-4 border-primary/10 shadow-2xl relative overflow-hidden group/avatar">
               {displayAvatar ? (
                 <Image src={displayAvatar} alt={profile.username} fill className="object-cover transition-transform duration-1000 group-hover/avatar:scale-110" />
               ) : (
                 <User className="w-20 h-20 text-primary/20" />
               )}
               {isOwnProfile && (
                 <Link href="/profile/edit" className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] opacity-0 group-hover/avatar:opacity-100 transition-all flex flex-col items-center justify-center text-white">
                   <Camera className="w-10 h-10" />
                   <span className="text-[10px] font-bold uppercase mt-2">Refine</span>
                 </Link>
               )}
            </div>
            {isGrandArchivist && (
              <div className="absolute -bottom-3 -right-3 bg-primary text-white p-3 rounded-2xl shadow-2xl ring-4 ring-white">
                <Trophy className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-8 text-center md:text-left w-full relative z-20">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <h1 className="font-headline text-4xl sm:text-6xl font-bold tracking-tight">{profile.username}</h1>
                {isGrandArchivist && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-5 py-1.5 text-[10px] uppercase font-bold">
                    Grand Archivist
                  </Badge>
                )}
              </div>
              
              {profile.status && (
                <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-5 py-2 rounded-full text-sm font-bold border border-primary/10 backdrop-blur-sm">
                   <Sparkles className="w-4 h-4" />
                   {profile.status}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 pt-4 w-full">
                {[
                  { label: "Chronicles Read", arabic: "القصص المقروءة", value: readingProgress?.length || 0, icon: BookOpen },
                  { label: "Whispers Sent", arabic: "الرسائل المرسلة", value: profile.publishedCount ? profile.publishedCount * 3 : 0, icon: MessageSquare },
                  { label: "Sanctuary Likes", arabic: "الإعجابات", value: profile.totalLikes || 0, icon: Heart }
                ].map((stat, i) => (
                  <div key={i} className="bg-primary/10 backdrop-blur-md rounded-[1.5rem] p-5 border border-primary/20 flex items-center md:items-start justify-between md:flex-col gap-2 shadow-sm transition-all hover:scale-[1.02] hover:bg-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                         <stat.icon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/70 leading-tight">{stat.label}</p>
                        <p className="font-arabic text-[10px] text-white font-bold">{stat.arabic}</p>
                      </div>
                    </div>
                    <span className="text-3xl sm:text-4xl font-headline font-bold text-white drop-shadow-md">{stat.value}</span>
                  </div>
                ))}
              </div>

              <div className="relative group/bio min-h-[60px] space-y-4 py-4">
                {isEditingBio ? (
                  <div className="space-y-4 animate-fade-in w-full max-w-2xl">
                    <Textarea 
                      value={localBio}
                      onChange={(e) => setLocalBio(e.target.value)}
                      placeholder="Tell the sanctuary about your spirit..."
                      className="bg-white border-primary/10 min-h-[160px] rounded-3xl italic leading-relaxed text-lg p-6 focus-visible:ring-primary/20 shadow-inner"
                    />
                    <div className="flex justify-center md:justify-start gap-3">
                      <Button size="lg" onClick={handleSaveBio} disabled={isSavingBio} className="rounded-full bg-primary h-14 px-10 text-sm uppercase font-bold">
                        {isSavingBio ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                        Save
                      </Button>
                      <Button size="lg" variant="ghost" onClick={() => { setLocalBio(profile.bio || ""); setIsEditingBio(false); }} className="rounded-full h-14 px-8 text-sm font-bold text-muted-foreground">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="flex-1 max-w-2xl">
                      {localBio ? (
                        <p className="text-muted-foreground italic text-lg sm:text-xl leading-loose text-center md:text-left">
                          <Quote className="inline-block w-6 h-6 mr-3 opacity-20 align-top" />
                          {localBio}
                        </p>
                      ) : isOwnProfile ? (
                        <button onClick={() => setIsEditingBio(true)} className="text-muted-foreground/50 italic text-lg hover:text-primary transition-colors flex items-center gap-3 py-6 border-2 border-dashed border-primary/10 w-full justify-center rounded-3xl">
                          <Edit3 className="w-6 h-6" /> Write your spirit's manifesto...
                        </button>
                      ) : null}
                    </div>
                    {isOwnProfile && localBio && (
                      <Button variant="ghost" size="icon" onClick={() => setIsEditingBio(true)} className="h-12 w-12 rounded-full text-primary/40 hover:text-primary hover:bg-primary/5 shrink-0">
                        <Edit3 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-12 pt-4">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start text-3xl font-bold text-foreground">
                  <Eye className="w-5 h-5 text-primary" />
                  {profile.totalViews || 0}
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Total Views</p>
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start text-3xl font-bold text-foreground">
                  <Users className="w-5 h-5 text-primary" />
                  {profile.followerCount || 0}
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Followers</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-8 justify-center md:justify-start">
              {!isOwnProfile && (
                <Button 
                  size="lg" 
                  onClick={handleFollow}
                  disabled={isFollowingLoading}
                  className={cn(
                    "rounded-full px-12 h-16 font-headline text-xl shadow-2xl transition-all w-full sm:w-auto",
                    followStatus ? "bg-secondary text-secondary-foreground" : "bg-primary text-white shadow-primary/20"
                  )}
                >
                  {isFollowingLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : followStatus ? "Unfollow" : "Follow Scribe"}
                </Button>
              )}
              {isOwnProfile && (
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Link href="/profile/edit" className="w-full">
                    <Button className="rounded-full px-12 h-16 bg-primary text-white hover:bg-primary/90 font-headline text-xl shadow-2xl shadow-primary/20 w-full">
                      Refine Persona
                    </Button>
                  </Link>
                  <Button 
                    variant="outline"
                    className="rounded-full px-10 h-16 border-primary/20 text-primary hover:bg-primary/5 font-headline text-xl w-full"
                    onClick={() => router.push('/settings')}
                  >
                    <Settings className="w-6 h-6 mr-3" />
                    Settings
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="space-y-10 px-2">
          <div className="flex items-center gap-4 border-b border-primary/5 pb-8">
            <Trophy className="w-8 h-8 text-primary" />
            <h2 className="font-headline text-3xl sm:text-4xl font-bold">Sanctuary Milestones</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {ACHIEVEMENTS.map((def) => {
              const isUnlocked = profile.achievements?.includes(def.id);
              const currentVal = statsForAchievements[def.metric];
              const progress = Math.min(100, (currentVal / def.threshold) * 100);
              
              return (
                <div 
                  key={def.id} 
                  className={cn(
                    "glass-morphism rounded-[2.5rem] p-8 border-primary/5 space-y-6 transition-all duration-500",
                    isUnlocked ? "bg-white shadow-xl ring-1 ring-primary/10" : "opacity-50 grayscale-[0.5]"
                  )}
                >
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0",
                      isUnlocked ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}>
                      <def.icon className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-lg leading-tight">{def.name}</p>
                      <p className="text-xs text-muted-foreground italic leading-relaxed">{def.description}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <span>{isUnlocked ? "Manifested" : "Progress"}</span>
                      <span className="text-primary">{Math.min(currentVal, def.threshold)} / {def.threshold}</span>
                    </div>
                    <Progress value={progress} className={cn("h-1.5", isUnlocked ? "bg-primary/20" : "bg-muted")} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-10 px-2">
            <div className="flex items-center gap-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <h2 className="font-headline text-3xl sm:text-4xl font-bold">Published Archive</h2>
            </div>
            
            <div className="flex gap-2 bg-white/50 p-1.5 rounded-full border border-primary/10 backdrop-blur-md">
              <Button 
                variant={sortOrder === 'latest' ? 'default' : 'ghost'} 
                size="sm"
                className="rounded-full text-[10px] uppercase font-bold tracking-widest h-10 px-6"
                onClick={() => setSortOrder('latest')}
              >
                Newest
              </Button>
              <Button 
                variant={sortOrder === 'popular' ? 'default' : 'ghost'} 
                size="sm"
                className="rounded-full text-[10px] uppercase font-bold tracking-widest h-10 px-6"
                onClick={() => setSortOrder('popular')}
              >
                Popular
              </Button>
            </div>
          </div>

          {novelsLoading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : novels && novels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-10">
              {novels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 italic text-muted-foreground bg-white/40 rounded-[3rem] border border-dashed border-primary/10 flex flex-col items-center gap-6">
              <BookOpen className="w-20 h-20 opacity-10" />
              <p className="text-xl">The archive is currently silent.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
