
"use client";

import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser, useFirestore, useCollection, useDoc } from "@/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { Loader2, Send, MessageSquare, Users, Sparkles, Hash } from "lucide-react";
import { ChatRoom, ChatMessage, UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DEFAULT_ROOMS = [
  { id: 'general', name: 'The Grand Library', description: 'General discussions for all scribes.', category: 'General' },
  { id: 'fantasy', name: 'Fantasy Forge', description: 'Crafting worlds and myths.', category: 'Fantasy' },
  { id: 'romance', name: 'Romance Rose', description: 'Soft whispers and heartbeat tales.', category: 'Romance' },
  { id: 'mystery', name: 'Mystery Mist', description: 'Untangling shadows and secrets.', category: 'Mystery' },
];

export default function CommunityPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeRoomId, setActiveRoomId] = useState('general');
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  const { data: profile } = useDoc<UserProfile>(profileRef);

  const activeRoom = DEFAULT_ROOMS.find(r => r.id === activeRoomId) || DEFAULT_ROOMS[0];

  const messagesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "chatRooms", activeRoomId, "messages"),
      orderBy("createdAt", "asc"),
      limit(50)
    );
  }, [db, activeRoomId]);
  
  const { data: messages, loading: messagesLoading } = useCollection<ChatMessage>(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !messageText.trim() || !profile) return;

    const text = messageText;
    setMessageText("");

    try {
      await addDoc(collection(db, "chatRooms", activeRoomId, "messages"), {
        senderId: user.uid,
        senderName: profile.username,
        text,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      toast({ title: "Whisper Lost", description: "Your message failed to reach the room.", variant: "destructive" });
    }
  };

  if (!user || profile?.role !== 'writer') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center dreamy-fantasy-gradient">
        <Sparkles className="w-12 h-12 text-primary mb-6" />
        <h1 className="font-headline text-3xl font-bold mb-4">The Community Awaits</h1>
        <p className="text-muted-foreground italic max-w-md">This sanctuary is reserved for those walking the path of the Scribe. Please manifest your role in settings to enter.</p>
        <Button onClick={() => window.location.href = "/"} className="mt-8 rounded-full px-8">Return to Library</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl flex flex-col md:flex-row gap-8 overflow-hidden">
        {/* Sidebar: Rooms */}
        <aside className="w-full md:w-72 space-y-6">
          <div className="glass-morphism rounded-3xl p-6 border-primary/10">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="font-headline text-xl font-bold">Community Rooms</h2>
            </div>
            <nav className="space-y-2">
              {DEFAULT_ROOMS.map(room => (
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
                  <div className="truncate">
                    <p className="font-bold text-sm">{room.name}</p>
                    <p className={cn("text-[10px] truncate", activeRoomId === room.id ? "text-white/70" : "text-muted-foreground/60")}>
                      {room.category}
                    </p>
                  </div>
                </button>
              ))}
            </nav>
          </div>
          
          <div className="glass-morphism rounded-3xl p-6 border-primary/10 bg-primary/5 hidden md:block">
            <h3 className="font-headline text-lg font-bold mb-2">Scribe Protocol</h3>
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              "Words are seeds. Speak with kindness, collaborate with grace, and keep the sanctuary safe."
            </p>
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col glass-morphism rounded-[2.5rem] border-primary/10 overflow-hidden shadow-xl">
          <CardHeader className="border-b border-primary/5 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="font-headline text-2xl flex items-center gap-3">
                  <Hash className="w-5 h-5 text-primary" />
                  {activeRoom.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground italic">{activeRoom.description}</p>
              </div>
              <Badge variant="outline" className="rounded-full bg-primary/5 border-primary/10 text-primary">
                {activeRoom.category}
              </Badge>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-8 h-[60vh]">
            {messagesLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground italic">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                Manifesting messages...
              </div>
            ) : messages?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground italic opacity-50">
                <MessageSquare className="w-12 h-12" />
                Be the first to break the silence.
              </div>
            ) : (
              <div className="space-y-8">
                {messages?.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex flex-col max-w-[80%]",
                      msg.senderId === user.uid ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {msg.senderName}
                      </span>
                      <span className="text-[9px] text-muted-foreground/40 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={cn(
                      "px-5 py-3 rounded-[1.5rem] shadow-sm",
                      msg.senderId === user.uid 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-white border border-primary/5 rounded-tl-none"
                    )}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            )}
          </ScrollArea>

          <CardContent className="p-8 border-t border-primary/5 bg-white/40">
            <form onSubmit={handleSendMessage} className="flex gap-4">
              <Input
                placeholder={`Speak to the travelers in ${activeRoom.name}...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 bg-white/80 border-primary/10 h-14 rounded-full px-8 focus:bg-white transition-all shadow-sm"
              />
              <Button 
                type="submit" 
                disabled={!messageText.trim()}
                className="rounded-full h-14 px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
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
