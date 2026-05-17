"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { UserProfile } from "@/lib/types";
import { Loader2, User, Camera, Save, ArrowLeft, Sparkles, Quote, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function EditProfilePage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [status, setStatus] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const profileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, "users", user.uid);
  }, [user, db]);

  const { data: profile, loading: profileLoading } = useDoc<UserProfile>(profileRef);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setStatus(profile.status || "");
      
      const localAvatar = localStorage.getItem(`rosaline_avatar_${profile.uid}`);
      setAvatar(localAvatar || profile.avatar || null);
    }
  }, [profile]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 512) {
      toast({
        variant: "destructive",
        title: "Fragment Too Heavy",
        description: "Please choose a smaller image (under 512KB) to preserve the Archive's space."
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAvatar(base64);
      if (user) {
        localStorage.setItem(`rosaline_avatar_${user.uid}`, base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!db || !user) return;
    setIsSaving(true);

    const updates = {
      username,
      bio,
      status,
      avatar,
      updatedAt: new Date().toISOString()
    };

    // Use setDoc with merge: true to handle cases where the document doesn't exist yet
    setDoc(doc(db, "users", user.uid), {
      ...updates,
      uid: user.uid,
      email: user.email,
      role: profile?.role || 'reader',
      ageConfirmed: profile?.ageConfirmed || true,
      createdAt: profile?.createdAt || new Date().toISOString()
    }, { merge: true })
      .then(() => {
        if (avatar) localStorage.setItem(`rosaline_avatar_${user.uid}`, avatar);
        if (bio) localStorage.setItem(`rosaline_bio_${user.uid}`, bio);
        
        toast({ title: "Persona Refined", description: "Your changes have been manifested in the Archive." });
        router.push(`/profile/${user.uid}`);
      })
      .catch((err) => {
        console.error("Save error:", err);
        toast({ variant: "destructive", title: "Ritual Interrupted", description: "Could not save your changes to the Archive." });
      })
      .finally(() => setIsSaving(false));
  };

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground italic font-body animate-pulse">Consulting the Archive...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen dreamy-fantasy-gradient pb-20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 sm:py-16 max-w-2xl space-y-10 animate-fade-in">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-white/50 border border-primary/10 shadow-sm" onClick={() => router.back()}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold">Refine Your Persona</h1>
        </div>

        <div className="space-y-10">
          <Card className="glass-morphism border-primary/10 rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-xl">
            <CardHeader className="bg-primary/5 border-b border-primary/5 py-8 sm:py-10 px-6 sm:px-10">
              <CardTitle className="font-headline text-2xl flex items-center gap-3">
                <Camera className="w-6 h-6 text-primary" />
                Visual Identity
              </CardTitle>
              <CardDescription className="text-base italic">Your image travels with you across the sanctuary.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 sm:p-12 flex flex-col items-center gap-10">
              <div className="relative group">
                <div className="w-44 h-44 sm:w-56 sm:h-52 rounded-[2.5rem] sm:rounded-[3.5rem] bg-white flex items-center justify-center text-primary border-4 border-primary/10 shadow-2xl relative overflow-hidden">
                  {avatar ? (
                    <Image src={avatar} alt="Preview" fill className="object-cover transition-transform group-hover:scale-110 duration-1000" />
                  ) : (
                    <User className="w-24 h-24 text-primary/10" />
                  )}
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-primary/20 backdrop-blur-[3px] opacity-0 hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Camera className="w-12 h-12 text-white drop-shadow-2xl" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white mt-3">Change Image</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-3 -right-3 bg-primary text-white h-14 w-14 rounded-[1.5rem] shadow-2xl hover:scale-110 transition-transform active:scale-95 border-4 border-background flex items-center justify-center"
                >
                  <Camera className="w-6 h-6" />
                </button>
                
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-primary/10 rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-xl">
            <CardHeader className="bg-primary/5 border-b border-primary/5 py-8 sm:py-10 px-6 sm:px-10">
              <CardTitle className="font-headline text-2xl flex items-center gap-3">
                <Info className="w-6 h-6 text-primary" />
                Persona Echoes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 sm:p-12 space-y-10">
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-3">
                   <Sparkles className="w-4 h-4" /> Pen Name
                </label>
                <Input 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="rounded-2xl border-primary/10 h-14 px-6 bg-white/60 focus:bg-white transition-all text-lg"
                  placeholder="The name you are known by..."
                />
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-3">
                   <Sparkles className="w-4 h-4" /> Current Spirit (Status)
                </label>
                <Input 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)} 
                  className="rounded-2xl border-primary/10 h-14 px-6 bg-white/60 focus:bg-white transition-all text-lg"
                  placeholder="e.g., Dreaming of velvet shadows..."
                  maxLength={60}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-3">
                   <Quote className="w-4 h-4" /> Manifesto (Bio)
                </label>
                <Textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  className="rounded-[2rem] border-primary/10 min-h-[160px] p-6 bg-white/60 focus:bg-white transition-all leading-loose text-lg italic"
                  placeholder="Tell the Archive about your spirit..."
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full h-20 rounded-full bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 font-headline text-2xl transition-all active:scale-[0.98] mb-10"
          >
            {isSaving ? <Loader2 className="w-7 h-7 animate-spin mr-3" /> : <Save className="w-7 h-7 mr-3" />}
            Manifest Changes
          </Button>
        </div>
      </main>
    </div>
  );
}
