
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { 
  Loader2, 
  Send, 
  MessageSquare, 
  Hash, 
  PenTool, 
  BookOpen, 
  ShieldAlert,
  Ghost
} from "lucide-react";
import { ChatMessage, UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const COMMUNITY_ROOMS = [
  { id: 'library-lounge', name: 'The Library Lounge', description: 'Public book discussions and recommendations.', category: 'Reader', roles: ['writer', 'reader'] },
  { id: 'genre-garden', name: 'Genre Garden', description: 'Discussing the essence of various story types.', category: 'Reader', roles: ['writer', 'reader'] },
  { id: 'scribes-circle', name: 'The Scribes\' Circle', description: 'Exclusive retreat for writers to share progress and craft.', category: 'Writer', roles: ['writer'] },
  { id: 'creative-mists', name: 'Creative Mists', description: 'Overcoming blocks and seeking inspiration.', category: 'Writer', roles: ['writer'] },
];

const INITIAL_MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  'library-lounge': [
    { id: 'm1', senderId: 'system', senderName: 'Archivist', text: 'Welcome to the Lounge. What chronicles are you exploring today?', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'm2', senderId: 'user-a', senderName: 'VelvetWriter', text: 'I just finished "The Obsidian Gate". The ending was purely ethereal!', createdAt: new Date(Date.now() - 1800000).toISOString() },
  ],
  'genre-garden': [
    { id: 'm3', senderId: 'system', senderName: 'Sentinel', text: 'The soil here is rich with various story types. Which genre calls to your spirit?', createdAt: new Date(Date.now() - 3600000).toISOString() },
  ]
};

export default function CommunityPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeRoomId, setActiveRoomId] = useState('library-lounge');
  const [messageText, setMessageText] = useState("");
  const [roomMessages, setRoomMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MOCK_MESSAGES);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  const { data: profile, loading: profileLoading } = useDoc<UserProfile>(profileRef);

  const filteredRooms = useMemo(() => {
    if (!profile) return COMMUNITY_ROOMS.filter(r => r.category === 'Reader');
    return COMMUNITY_ROOMS.filter(r => r.roles.includes(profile.role));
  }, [profile]);

  const activeRoom = useMemo(() => {
    return COMMUNITY_ROOMS.find(r => r.id === activeRoomId) || COMMUNITY_ROOMS[0];
  }, [activeRoomId]);

  // Ensure active room is allowed for current role
  useEffect(() => {
    if (profile && !activeRoom.roles.includes(profile.role)) {
      setActiveRoomId('library-lounge');
    }
  }, [profile, activeRoom]);

  const currentMessages = roomMessages[activeRoomId] || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !messageText.trim() || !profile) return;

    const text = messageText;
    setMessageText("");

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.uid,
      senderName: profile.username,
      text,
      createdAt: new Date().toISOString(),
    };

    setRoomMessages(prev => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMessage]
    }));
  };

  const handleReport = (msgId: string) => {
    toast({
      title: "Guardian Summoned",
      description: "Our sentinels will review this fragment locally.",
    });
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffcfc]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center dreamy-fantasy-gradient">
        <MessageSquare className="w-12 h-12 text-primary mb-6" />
        <h1 className="font-headline text-3xl font-bold mb-4">The Community Awaits</h1>
        <p className="text-muted-foreground italic max-w-md">This sanctuary is reserved for registered dreamers. Please manifest your presence to enter.</p>
        <Button onClick={() => router.push("/login")} className="mt-8 rounded-full px-12 h-14 bg-primary text-white shadow-xl shadow-primary/20">Sign in to the Sanctuary</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl flex flex-col md:flex-row gap-8 overflow-hidden">
        {/* Sidebar: Spaces */}
        <aside className="w-full md:w-80 space-y-6">
          <div className="glass-morphism rounded-[2rem] p-6 border-primary/10">
            <div className="space-y-8">
              {/* Reader Space */}
              <div>
                <div className="flex items-center gap-2 mb-4 px-2">
                  <BookOpen className="w-4 h-4 text-primary/60" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Reader Space</h3>
                </div>
                <div className="space-y-1">
                  {filteredRooms.filter(r => r.category === 'Reader').map(room => (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center gap-3",
                        activeRoomId === room.id 
                          ? "bg-primary text-white shadow-lg shadow-primary/20" 
                          : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                      )}
                    >
                      <Hash className="w-4 h-4 shrink-0" />
                      <p className="font-bold text-sm truncate">{room.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Writer Space */}
              {profile?.role === 'writer' && (
                <div>
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <PenTool className="w-4 h-4 text-primary/60" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Writer Space</h3>
                  </div>
                  <div className="space-y-1">
                    {filteredRooms.filter(r => r.category === 'Writer').map(room => (
                      <button
                        key={room.id}
                        onClick={() => setActiveRoomId(room.id)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center gap-3",
                          activeRoomId === room.id 
                            ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" 
                            : "text-muted-foreground hover:bg-accent/5 hover:text-accent-foreground"
                        )}
                      >
                        <Ghost className="w-4 h-4 shrink-0" />
                        <p className="font-bold text-sm truncate">{room.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="glass-morphism rounded-[2rem] p-6 border-primary/10 bg-primary/5 hidden md:block">
            <h3 className="font-headline text-lg font-bold mb-2">Instant Whispers</h3>
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              "In this demonstration hall, your words manifest instantly through local magic. No waiting for the celestial mists to clear."
            </p>
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col glass-morphism rounded-[2.5rem] border-primary/10 overflow-hidden shadow-xl">
          <CardHeader className="border-b border-primary/5 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="font-headline text-2xl flex items-center gap-3">
                  {activeRoom.category === 'Writer' ? <Ghost className="w-5 h-5 text-accent" /> : <Hash className="w-5 h-5 text-primary" />}
                  {activeRoom.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground italic">{activeRoom.description}</p>
              </div>
              <Badge variant="outline" className={cn(
                "rounded-full px-4 h-6 border-none text-[9px] uppercase tracking-widest font-bold",
                activeRoom.category === 'Writer' ? "bg-accent/10 text-accent-foreground" : "bg-primary/10 text-primary"
              )}>
                {activeRoom.category} Sanctuary
              </Badge>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-8 h-[60vh]">
            <div className="space-y-8">
              {currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground italic py-20 opacity-50">
                  <MessageSquare className="w-12 h-12" />
                  Be the first to break the silence.
                </div>
              ) : (
                currentMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex flex-col max-w-[85%] animate-fade-in",
                      msg.senderId === user.uid ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {msg.senderName}
                      </span>
                      <span className="text-[9px] text-muted-foreground/30 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="group relative">
                      <div className={cn(
                        "px-5 py-3 rounded-[1.8rem] shadow-sm",
                        msg.senderId === user.uid 
                          ? (activeRoom.category === 'Writer' ? "bg-accent text-accent-foreground rounded-tr-none" : "bg-primary text-white rounded-tr-none")
                          : "bg-white border border-primary/5 rounded-tl-none"
                      )}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                      
                      {msg.senderId !== user.uid && (
                        <button 
                          onClick={() => handleReport(msg.id)}
                          className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <CardContent className="p-8 border-t border-primary/5 bg-white/40">
            <form onSubmit={handleSendMessage} className="flex gap-4">
              <Input
                placeholder={`Speak to the ${activeRoom.category.toLowerCase()}s in ${activeRoom.name}...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 bg-white/80 border-primary/10 h-14 rounded-full px-8 focus:bg-white transition-all shadow-sm"
              />
              <Button 
                type="submit" 
                disabled={!messageText.trim()}
                className={cn(
                  "rounded-full h-14 px-8 shadow-lg transition-all",
                  activeRoom.category === 'Writer' 
                    ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent/20" 
                    : "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                )}
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </CardContent>
        </div>
      </main>
    </div>
  );
}
