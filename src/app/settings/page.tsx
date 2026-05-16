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
import { Loader2, User, Shield, PenTool, BookOpen, Sparkles, Languages } from "lucide-react";
import { UserProfile, UserRole, AppLanguage } from "@/lib/types";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { useLanguage } from "@/lib/i18n/context";

export default function SettingsPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
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
      toast({ title: "Updated", description: "Your manifestation has been updated." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error" });
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
          <Card className="glass-morphism border-primary/10 rounded-3xl overflow-hidden">
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
                  <div key={lang.id} className="flex items-center space-x-2 rounded-2xl border p-4 hover:bg-primary/5 transition-colors cursor-pointer border-primary/10">
                    <RadioGroupItem value={lang.id} id={lang.id} />
                    <Label htmlFor={lang.id} className="cursor-pointer font-bold">{lang.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Role Change */}
          <Card className="glass-morphism border-primary/10 rounded-3xl overflow-hidden">
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
                <div className="flex items-center space-x-3 space-y-0 rounded-2xl border p-5 bg-white hover:bg-primary/5 transition-colors cursor-pointer border-primary/10">
                  <RadioGroupItem value="reader" id="reader" />
                  <Label htmlFor="reader" className="flex items-center gap-4 cursor-pointer w-full font-normal">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Reader</p>
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
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="border-destructive/10 rounded-3xl overflow-hidden bg-destructive/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-destructive" />
                <CardTitle className="font-headline text-destructive">{t.settings.banish_title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-sm text-muted-foreground italic mb-6">{t.settings.banish_desc}</p>
              <Button variant="destructive" className="rounded-full px-8">Banish Persona</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
