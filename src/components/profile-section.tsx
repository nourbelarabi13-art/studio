
'use client';

import React, { useState } from 'react';
import { User, Edit3, Save, Camera, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function ProfileSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Scribe of Shadows",
    status: "Dreaming of soft whispers...",
    bio: "A traveler across the obsidian fields, gathering fragments of lost chronicles to weave into the Archive."
  });

  const handleSave = () => setIsEditing(false);

  return (
    <div className="glass-morphism rounded-[2.5rem] p-8 space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="relative shrink-0">
          <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-inner relative overflow-hidden group">
            <User className="w-16 h-16 text-primary/40" />
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary text-background p-1.5 rounded-xl shadow-lg">
            <Sparkles className="w-3 h-3" />
          </div>
        </div>

        <div className="flex-1 space-y-6 text-center md:text-left w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              {isEditing ? (
                <Input 
                  value={profile.name} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="bg-white/5 border-primary/10 h-10 rounded-xl"
                />
              ) : (
                <h2 className="font-headline text-3xl font-bold tracking-tight">{profile.name}</h2>
              )}
              {isEditing ? (
                <Input 
                  value={profile.status} 
                  onChange={(e) => setProfile({...profile, status: e.target.value})}
                  className="bg-white/5 border-primary/10 h-8 text-xs rounded-lg mt-2"
                />
              ) : (
                <p className="text-primary/60 text-xs font-bold uppercase tracking-widest italic">{profile.status}</p>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              className="rounded-full gap-2 text-primary hover:bg-primary/10"
            >
              {isEditing ? <><Save className="w-4 h-4" /> Manifest</> : <><Edit3 className="w-4 h-4" /> Refine Persona</>}
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground">My Manifesto</label>
            {isEditing ? (
              <Textarea 
                value={profile.bio} 
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                className="bg-white/5 border-primary/10 min-h-[100px] rounded-2xl text-sm"
              />
            ) : (
              <p className="text-muted-foreground italic text-sm leading-relaxed max-w-xl">
                "{profile.bio}"
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
