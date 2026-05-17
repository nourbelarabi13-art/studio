
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  Trash2, 
  Ghost,
  Camera,
  Smile,
  X,
  Flag,
  Menu
} from "lucide-react";
import { ChatMessage, UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ReportModal } from "@/components/report-modal";

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

const DREAMY_EMOJIS = ['✨', '🌸', '📚', '🕯️', '🌙', '🕊️', '📜', '🖋️', '🧚', '🥀', '🦋', '⭐', '🌑', '🔮', '🌿', '☁️'];

export default function CommunityPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeRoomId, setActiveRoomId] = useState('library-lounge');
  const [messageText, setMessageText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [roomMessages, setRoomMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MOCK_MESSAGES);
  const [reportingMsgId, setReportingMsgId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);
  const { data: profile } = useDoc<UserProfile>(profileRef);

  const filteredRooms = useMemo(() => {
    if (!profile) return COMMUNITY_ROOMS.filter(r => r.category === 'Reader');
    return COMMUNITY_ROOMS.filter(r => r.roles.includes(profile.role));
  }, [profile]);

  const activeRoom = useMemo(() => {
    return COMMUNITY_ROOMS.find(r => r.id === activeRoomId) || COMMUNITY_ROOMS[0];
  }, [activeRoomId]);

  // Ensure active room is allowed for current role if profile exists
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
  }, [currentMessages, activeRoomId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const trimmedText = messageText.trim();
    if (!trimmedText && !selectedImage) return;

    const textToSend = trimmedText;
    const imageToSend = selectedImage || undefined;
    const nameToUse = profile?.username || user.displayName || "Traveler";
    
    setMessageText("");
    setSelectedImage(null);

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: user.uid,
      senderName: nameToUse,
      text: textToSend,
      imageUrl: imageToSend,
      createdAt: new Date().toISOString(),
    };

    setRoomMessages(prev => {
      const currentRoomMessages = prev[activeRoomId] || [];
      return {
        ...prev,
        [activeRoomId]: [...currentRoomMessages, newMessage]
      };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Image too large",
        description: "Please choose a smaller image (under 1MB) for this local demonstration."
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteMessage = (msgId: string) => {
    setRoomMessages(prev => ({
      ...prev,
      [activeRoomId]: prev[activeRoomId].filter(m => m.id !== msgId)
    }));
    toast({
      title: "Whisper Banished",
      description: "The fragment has vanished from the sanctuary.",
    });
  };

  const addEmoji = (emoji: string) => {
    setMessageText(prev => prev + emoji);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center dreamy-fantasy-gradient">
        <MessageSquare className="w-16 h-16 text-primary mb-6" />
        <h1 className="font-headline text-4xl font-bold mb-4">The Community Awaits</h1>
        <p className="text-muted-foreground italic max-w-md text-lg leading-relaxed">This sanctuary is reserved for registered dreamers. Please manifest your presence to enter.</p>
        <Button onClick={() => router.push("/login")} className="mt-10 rounded-full px-12 h-16 bg-primary text-white shadow-2xl shadow-primary/20 text-lg">Sign in to the Sanctuary</Button>
      </div>
    );
  }

  const SidebarContentEl = (
    <div className="space-y-10">
      {/* Reader Space */}
      <div>
        <div className="flex items-center gap-3 mb-6 px-2">
          <BookOpen className="w-5 h-5 text-primary/60" />
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Reader Space</h3>
        </div>
        <div className="space-y-2">
          {filteredRooms.filter(r => r.category === 'Reader').map(room => (
            <button
              key={room.id}
              onClick={() => { setActiveRoomId(room.id); setIsSidebarOpen(false); }}
              className={cn(
                "w-full text-left px-5 py-4 rounded-2xl transition-all flex items-center gap-4",
                activeRoomId === room.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              )}
            >
              <Hash className="w-5 h-5 shrink-0" />
              <p className="font-bold text-sm truncate">{room.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Writer Space */}
      {(profile?.role === 'writer' || !profile) && (
        <div>
          <div className="flex items-center gap-3 mb-6 px-2">
            <PenTool className="w-5 h-5 text-primary/60" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Writer Space</h3>
          </div>
          <div className="space-y-2">
            {filteredRooms.filter(r => r.category === 'Writer').map(room => (
              <button
                key={room.id}
                onClick={() => { setActiveRoomId(room.id); setIsSidebarOpen(false); }}
                className={cn(
                  "w-full text-left px-5 py-4 rounded-2xl transition-all flex items-center gap-4",
                  activeRoomId === room.id 
                    ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" 
                    : "text-muted-foreground hover:bg-accent/5 hover:text-accent-foreground"
                )}
              >
                <Ghost className="w-5 h-5 shrink-0" />
                <p className="font-bold text-sm truncate">{room.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="glass-morphism rounded-[2rem] p-6 border-primary/10 bg-primary/5">
        <h3 className="font-headline text-lg font-bold mb-3">Instant Whispers</h3>
        <p className="text-xs text-muted-foreground italic leading-relaxed">
          "Your words manifest instantly through local magic in this demonstration hall."
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10 max-w-6xl flex flex-col md:flex-row gap-6 md:gap-10 overflow-hidden h-[calc(100vh-64px)]">
        
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden flex items-center justify-between bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-primary/10 mb-2">
           <div className="flex items-center gap-3">
              <Badge className={cn("rounded-full", activeRoom.category === 'Writer' ? "bg-accent/20 text-accent-foreground" : "bg-primary/20 text-primary")}>
                {activeRoom.category}
              </Badge>
              <h2 className="font-bold text-sm">{activeRoom.name}</h2>
           </div>
           <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
             <SheetTrigger asChild>
               <Button variant="ghost" size="icon" className="text-primary h-10 w-10">
                 <Menu className="w-6 h-6" />
               </Button>
             </SheetTrigger>
             <SheetContent className="rounded-l-[2rem] border-primary/10 pt-16">
                <SheetHeader className="mb-8">
                  <SheetTitle className="font-headline text-2xl">Community Spaces</SheetTitle>
                </SheetHeader>
                {SidebarContentEl}
             </SheetContent>
           </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-80 shrink-0 h-full overflow-y-auto pr-2 scrollbar-hide">
          <div className="glass-morphism rounded-[2.5rem] p-8 border-primary/10 shadow-sm h-full">
            {SidebarContentEl}
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col glass-morphism rounded-[2.5rem] border-primary/10 overflow-hidden shadow-2xl relative bg-white/30">
          <CardHeader className="border-b border-primary/5 py-4 sm:py-6 bg-white/60">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="font-headline text-xl sm:text-2xl flex items-center gap-3">
                  {activeRoom.category === 'Writer' ? <Ghost className="w-6 h-6 text-accent" /> : <Hash className="w-6 h-6 text-primary" />}
                  {activeRoom.name}
                </CardTitle>
                <p className="text-[10px] sm:text-xs text-muted-foreground italic line-clamp-1">{activeRoom.description}</p>
              </div>
              <Badge variant="outline" className={cn(
                "hidden sm:flex rounded-full px-4 h-7 border-none text-[9px] uppercase tracking-widest font-bold",
                activeRoom.category === 'Writer' ? "bg-accent/10 text-accent-foreground" : "bg-primary/10 text-primary"
              )}>
                {activeRoom.category} Sanctuary
              </Badge>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-4 sm:p-8">
            <div className="space-y-10 pb-20">
              {currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 text-muted-foreground italic opacity-40">
                  <MessageSquare className="w-16 h-16" />
                  <p className="text-lg">Be the first to break the silence.</p>
                </div>
              ) : (
                currentMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex flex-col max-w-[90%] sm:max-w-[80%] animate-fade-in",
                      msg.senderId === user.uid ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2 px-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {msg.senderName}
                      </span>
                      <span className="text-[9px] text-muted-foreground/30 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="group relative">
                      <div className={cn(
                        "px-5 py-4 rounded-[2rem] shadow-sm overflow-hidden",
                        msg.senderId === user.uid 
                          ? (activeRoom.category === 'Writer' ? "bg-accent text-accent-foreground rounded-tr-none" : "bg-primary text-white rounded-tr-none")
                          : "bg-white border border-primary/5 rounded-tl-none"
                      )}>
                        {msg.imageUrl && (
                          <div className="mb-4 relative w-full aspect-video rounded-2xl overflow-hidden shadow-md">
                             <Image src={msg.imageUrl} alt="Shared" fill className="object-cover" />
                          </div>
                        )}
                        {msg.text && <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                      </div>
                      
                      <div className={cn(
                        "absolute top-1/2 -translate-y-1/2 flex items-center gap-2 transition-all duration-300",
                        msg.senderId === user.uid 
                          ? "-left-10 md:-left-20 opacity-0 group-hover:opacity-100" 
                          : "-right-10 md:-right-20 opacity-0 group-hover:opacity-100"
                      )}>
                        <button 
                          onClick={() => setReportingMsgId(msg.id)}
                          className="p-3 bg-white/80 rounded-full text-muted-foreground hover:text-destructive shadow-sm"
                          title="Report whisper"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                        {msg.senderId === user.uid && (
                          <button 
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-3 bg-white/80 rounded-full text-muted-foreground hover:text-destructive shadow-sm"
                            title="Vanish fragment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Fixed Input Bottom Bar */}
          <div className="p-4 sm:p-8 border-t border-primary/5 bg-white/80 backdrop-blur-xl">
            {selectedImage && (
              <div className="mb-4 relative w-32 h-24 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl group animate-fade-in">
                 <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                 <button 
                   onClick={() => setSelectedImage(null)}
                   className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 shadow-lg"
                 >
                   <X className="w-4 h-4" />
                 </button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex gap-3 sm:gap-4 items-end">
              <div className="flex-1 relative flex items-center">
                <Input
                  placeholder={`Speak to the ${activeRoom.category.toLowerCase()}s...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="bg-white/90 border-primary/10 h-14 sm:h-16 rounded-[2rem] pl-6 pr-24 sm:pr-32 focus:ring-primary/20 focus:border-primary/30 transition-all shadow-inner text-base"
                />
                <div className="absolute right-3 flex items-center gap-1 sm:gap-2">
                   <Popover>
                      <PopoverTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full text-primary hover:bg-primary/5">
                            <Smile className="w-6 h-6" />
                         </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[80vw] max-w-[320px] p-4 rounded-[2rem] border-primary/10 bg-white/95 backdrop-blur-xl shadow-2xl mb-4">
                         <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                            {DREAMY_EMOJIS.map(emoji => (
                              <button 
                                key={emoji} 
                                type="button"
                                onClick={() => addEmoji(emoji)}
                                className="text-2xl p-2 hover:bg-primary/5 rounded-2xl transition-transform active:scale-90"
                              >
                                {emoji}
                              </button>
                            ))}
                         </div>
                      </PopoverContent>
                   </Popover>

                   <Button 
                     type="button" 
                     variant="ghost" 
                     size="icon" 
                     className="h-10 w-10 sm:h-12 sm:w-12 rounded-full text-primary hover:bg-primary/5"
                     onClick={() => fileInputRef.current?.click()}
                   >
                     <Camera className="w-6 h-6" />
                   </Button>
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     className="hidden" 
                     accept="image/*" 
                     onChange={handleImageUpload} 
                   />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={!messageText.trim() && !selectedImage}
                className={cn(
                  "rounded-full h-14 sm:h-16 w-14 sm:w-24 shadow-xl transition-all active:scale-95",
                  activeRoom.category === 'Writer' 
                    ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent/20" 
                    : "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                )}
              >
                <Send className="w-6 h-6" />
              </Button>
            </form>
          </div>
        </div>
      </main>

      <ReportModal 
        targetId={reportingMsgId || ''} 
        targetType="chat" 
        isOpen={!!reportingMsgId} 
        onClose={() => setReportingMsgId(null)} 
      />
    </div>
  );
}
