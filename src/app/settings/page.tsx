"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUser, useFirestore, useAuth } from "@/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, Sparkles, Languages, AlertTriangle } from "lucide-react";
import { UserProfile, UserRole, AppLanguage } from "@/lib/types";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { useDoc } from "@/firebase/firestore/use-doc";
import { useLanguage } from "@/lib/i18n/context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBanishLoading, setIsBanishLoading] = useState(false);
  const { language: currentLang, setLanguage: updateAppLanguage, t } = useLanguage();

  const profileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, "users", user.uid);
  }, [user, db]);

  const { data: profile, loading: profileLoading } = useDoc<UserProfile>(profileRef);

  const handleUpdatePreference = async (updates: Partial<UserProfile>) => {
    if (!db || !user || !profile) return;
    
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "users", user.uid), updates);
      if (updates.language) {
        updateAppLanguage(updates.language);
      }
      toast({ title: t.settings.updated, description: t.settings.updated_desc });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "The ritual could not be Manifested." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !auth || !db) return;
    setIsBanishLoading(true);

    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, "users", user.uid));
      
      // 2. Delete from Authentication
      await deleteUser(user);
      
      toast({ 
        title: "Banishment Complete", 
        description: "Your trace has vanished from the sanctuary." 
      });
      
      router.push("/");
    } catch (error: any) {
      console.error("Banishment error:", error);
      if (error.code === 'auth/requires-recent-login') {
        toast({ 
          variant: "destructive", 
          title: "Ritual Failed", 
          description: "This ritual requires a recent entry. Please sign out and sign back in before banishing your persona." 
        });
      } else {
        toast({ 
          variant: "destructive", 
          title: "Ritual Interrupted", 
          description: "The Archive resisted the banishment. Please try again later." 
        });
      }
    } finally {
      setIsBanishLoading(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen dreamy-fantasy-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-3xl space-y-12 animate-fade-in">
        <header className="space-y-2">
          <h1 className="font-headline text-4xl font-bold">{t.settings.title}</h1>
          <p className="text-muted-foreground italic">{t.settings.desc}</p>
        </header>

        <div className="grid gap-8">
          {/* Language Preference */}
          <Card className="glass-morphism border-primary/10 rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="border-b border-primary/5 bg-primary/5">
              <div className="flex items-center gap-3">
                <Languages className="w-5 h-5 text-primary" />
                <CardTitle className="font-headline">{t.settings.language_title}</CardTitle>
              </div>
              <CardDescription>{t.settings.language_desc}</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <RadioGroup
                value={currentLang}
                onValueChange={(val) => handleUpdatePreference({ language: val as AppLanguage })}
                disabled={isUpdating}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {[
                  { id: 'en', name: 'English' },
                  { id: 'ar', name: 'العربية' },
                  { id: 'fr', name: 'Français' },
                ].map((lang) => (
                  <div key={lang.id} className="flex items-center space-x-2 rounded-2xl border p-4 hover:bg-primary/5 transition-all cursor-pointer border-primary/10 bg-white/40">
                    <RadioGroupItem value={lang.id} id={lang.id} />
                    <Label htmlFor={lang.id} className="cursor-pointer font-bold flex-1">{lang.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Role Change */}
          <Card className="glass-morphism border-primary/10 rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="border-b border-primary/5 bg-primary/5">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <CardTitle className="font-headline">{t.settings.role_title}</CardTitle>
              </div>
              <CardDescription>{t.settings.role_desc}</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <RadioGroup
                defaultValue={profile.role}
                onValueChange={(val) => handleUpdatePreference({ role: val as UserRole })}
                disabled={isUpdating}
                className="grid gap-4"
              >
                {[
                  { id: 'reader', label: 'Reader', icon: Languages, desc: 'Explore and discover soft chronicles.' },
                  { id: 'writer', label: 'Writer', icon: Sparkles, desc: 'Forge fragments and manifest stories.' }
                ].map((role) => (
                  <div key={role.id} className="flex items-center space-x-3 space-y-0 rounded-2xl border p-5 bg-white/60 hover:bg-primary/5 transition-all cursor-pointer border-primary/10">
                    <RadioGroupItem value={role.id} id={role.id} />
                    <Label htmlFor={role.id} className="flex items-center gap-4 cursor-pointer w-full font-normal">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <role.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{role.label}</p>
                        <p className="text-xs text-muted-foreground italic">{role.desc}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Account Deletion */}
          <Card className="border-destructive/10 rounded-3xl overflow-hidden bg-destructive/5 shadow-inner">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-destructive" />
                <CardTitle className="font-headline text-destructive">{t.settings.banish_title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-sm text-muted-foreground italic mb-6 leading-relaxed">{t.settings.banish_desc}</p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="rounded-full px-8 h-12 font-bold shadow-lg shadow-destructive/20 hover:scale-105 transition-transform">
                    {isBanishLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
                    Banish Persona
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2.5rem] bg-white/95 backdrop-blur-xl border-destructive/20 shadow-2xl p-8">
                  <AlertDialogHeader className="space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                       <AlertTriangle className="w-8 h-8" />
                    </div>
                    <AlertDialogTitle className="font-headline text-2xl text-center">
                      {t.settings.banish_confirm_title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center italic leading-relaxed">
                      {t.settings.banish_confirm_desc}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-6">
                    <AlertDialogCancel className="rounded-full h-12 flex-1 border-primary/10 hover:bg-primary/5 transition-all">
                      {t.settings.banish_cancel}
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="rounded-full h-12 flex-1 bg-destructive text-white hover:bg-destructive/90 shadow-xl shadow-destructive/20 transition-all font-bold"
                    >
                      {t.settings.banish_action}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
