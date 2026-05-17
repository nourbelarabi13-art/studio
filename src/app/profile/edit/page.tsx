
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { UserProfile } from "@/lib/types";
import { Loader2, User, Camera, Save, ArrowLeft, Sparkles, Quote, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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

  // Redirection ritual: ensure we only redirect after checking auth status in useEffect
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

    updateDoc(doc(db, "users", user.uid), updates)
      .then(() => {
        if (avatar) localStorage.setItem(`rosaline_avatar_${user.uid}`, avatar);
        if (bio) localStorage.setItem(`rosaline_bio_${user.uid}`, bio);
        
        toast({ title: "Persona Refined", description: "Your changes have been manifested in the Archive." });
        router.push(`/profile/${user.uid}`);
      })
      .catch(() => {
        toast({ variant: "destructive", title: "Ritual Interrupted", description: "Could not save your changes to the Archive." });
      })
      .finally(() => setIsSaving(false));
  };

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground italic font-body animate-pulse">Consulting the Archive...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen dreamy-fantasy-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-2xl space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-headline text-3xl font-bold">Refine Your Persona</h1>
        </div>

        <div className="space-y-8">
          <Card className="glass-morphism border-primary/10 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/5 py-8">
              <CardTitle className="font-headline flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Visual Identity
              </CardTitle>
              <CardDescription>Your image travels with you across the sanctuary.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 flex flex-col items-center gap-8">
              <div className="relative group">
                <div className="w-44 h-44 rounded-[2.5rem] bg-white flex items-center justify-center text-primary border-4 border-primary/10 shadow-2xl relative overflow-hidden group">
                  {avatar ? (
                    <Image src={avatar} alt="Preview" fill className="object-cover transition-transform group-hover:scale-110 duration-700" />
                  ) : (
                    <User className="w-20 h-20 text-primary/10" />
                  )}
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Camera className="w-10 h-10 text-white drop-shadow-lg" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white mt-2">Change Image</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-primary text-white p-3.5 rounded-2xl shadow-xl hover:scale-110 transition-transform active:scale-95 border-4 border-background"
                >
                  <Camera className="w-5 h-5" />
                </button>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-primary/10 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/5 py-8">
              <CardTitle className="font-headline flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Persona Echoes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                   <Sparkles className="w-3 h-3" /> Pen Name
                </label>
                <Input 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="rounded-2xl border-primary/10 h-12 bg-white/50 focus:bg-white transition-all"
                  placeholder="The name you are known by..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                   <Sparkles className="w-3 h-3" /> Current Spirit (Status)
                </label>
                <Input 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)} 
                  className="rounded-2xl border-primary/10 h-12 bg-white/50 focus:bg-white transition-all"
                  placeholder="e.g., Dreaming of velvet shadows..."
                  maxLength={60}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                   <Quote className="w-3 h-3" /> Manifesto (Bio)
                </label>
                <Textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  className="rounded-3xl border-primary/10 min-h-[120px] bg-white/50 focus:bg-white transition-all leading-relaxed"
                  placeholder="Tell the Archive about your spirit..."
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full h-16 rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 font-headline text-xl transition-all hover:scale-[1.01]"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            Refine Persona
          </Button>
        </div>
      </main>
    </div>
  );
}
