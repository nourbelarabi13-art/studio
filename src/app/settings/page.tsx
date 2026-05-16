
"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Shield, PenTool, BookOpen, Sparkles } from "lucide-react";
import { UserProfile, UserRole } from "@/lib/types";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";

export default function SettingsPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const profileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, "users", user.uid);
  }, [user, db]);

  const { data: profile, loading: profileLoading } = useDoc<UserProfile>(profileRef);

  const handleRoleChange = async (newRole: UserRole) => {
    if (!db || !user || !profile || profile.role === newRole) return;
    
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        role: newRole
      });
      toast({
        title: "Identity Manifested",
        description: `You are now a ${newRole} within the sanctuary.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "The Shift Failed",
        description: "We couldn't change your path at this moment.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <h1 className="font-headline text-2xl mb-4">Identify Yourself</h1>
        <p className="text-muted-foreground mb-6">You must enter the sanctuary to adjust your settings.</p>
        <Button onClick={() => window.location.href = "/login"}>Login</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen dreamy-fantasy-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-3xl space-y-12 animate-fade-in">
        <header className="space-y-2">
          <h1 className="font-headline text-4xl font-bold">Sanctuary Settings</h1>
          <p className="text-muted-foreground italic">Adjust your presence within Rosaline Bela.</p>
        </header>

        <div className="grid gap-8">
          <Card className="glass-morphism border-primary/10 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-primary/5 bg-primary/5">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <CardTitle className="font-headline">Persona Profile</CardTitle>
              </div>
              <CardDescription>Your registered identity traces.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pen Name</p>
                  <p className="text-lg font-medium">{profile.username}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Scroll Address</p>
                  <p className="text-lg font-medium">{profile.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-primary/10 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-primary/5 bg-primary/5">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <CardTitle className="font-headline">Chosen Path</CardTitle>
              </div>
              <CardDescription>Shift your role within the community.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <RadioGroup
                defaultValue={profile.role}
                onValueChange={(val) => handleRoleChange(val as UserRole)}
                disabled={isUpdating}
                className="grid gap-4"
              >
                <div className="flex items-center space-x-3 space-y-0 rounded-2xl border p-5 bg-white hover:bg-primary/5 transition-colors cursor-pointer border-primary/10">
                  <RadioGroupItem value="reader" id="reader" />
                  <Label htmlFor="reader" className="flex items-center gap-4 cursor-pointer w-full font-normal">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Reader</p>
                      <p className="text-sm text-muted-foreground">Focus on discovering and exploring the Archive's fragments.</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 space-y-0 rounded-2xl border p-5 bg-white hover:bg-primary/5 transition-colors cursor-pointer border-primary/10">
                  <RadioGroupItem value="writer" id="writer" />
                  <Label htmlFor="writer" className="flex items-center gap-4 cursor-pointer w-full font-normal">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <PenTool className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Writer</p>
                      <p className="text-sm text-muted-foreground">Manifest your own chronicles and manage your fragments.</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              
              {isUpdating && (
                <div className="flex items-center justify-center gap-2 mt-6 text-primary italic animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Weaving your new identity...
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-destructive/10 rounded-3xl overflow-hidden bg-destructive/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-destructive" />
                <CardTitle className="font-headline text-destructive">Banishment Zone</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-sm text-muted-foreground italic mb-6">
                Removing your presence from the sanctuary is permanent. All scrolls and fragments will vanish.
              </p>
              <Button variant="destructive" className="rounded-full px-8">Banish Persona</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
