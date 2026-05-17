"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  MessageSquare, 
  Hash, 
  Trash2, 
  Camera,
  Smile,
  X,
  Menu
} from "lucide-react";
import { ChatMessage } from "@/lib/types";
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
import { useLanguage } from "@/lib/i18n/context";

const COMMUNITY_ROOMS = [
  { id: 'library-lounge', name: 'The Library Lounge', description: 'Public book discussions and recommendations.', category: 'Reader' },
  { id: 'genre-garden', name: 'Genre Garden', description: 'Discussing the essence of various story types.', category: 'Reader' },
  { id: 'scribes-circle', name: 'The Scribes\' Circle', description: 'Exclusive retreat for writers to share progress and craft.', category: 'Writer' },
];

const DREAMY_EMOJIS = ['✨', '🌸', '📚', '🕯️', '🌙', '🕊️', '📜', '🖋️'];

export default function CommunityPage() {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  const INITIAL_MOCK_MESSAGES: Record<string, ChatMessage[]> = useMemo(() => ({
    'library-lounge': [
      { 
        id: 'm1', 
        senderId: 'system', 
        senderName: language === 'ar' ? 'أرشيف' : 'Archivist', 
        text: language === 'ar' ? 'مرحبًا بكم في القاعة. ما هي القصص التي تستكشفونها اليوم؟' : 'Welcome to the Lounge. What chronicles are you exploring today?', 
        createdAt: '2024-01-01T12:00:00.000Z' 
      },
    ]
  }), [language]);

  const [activeRoomId, setActiveRoomId] = useState('library-lounge');
  const [messageText, setMessageText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [roomMessages, setRoomMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MOCK_MESSAGES);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeRoom = useMemo(() => {
    return COMMUNITY_ROOMS.find(r => r.id === activeRoomId) || COMMUNITY_ROOMS[0];
  }, [activeRoomId]);

  const currentMessages = roomMessages[activeRoomId] || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages, activeRoomId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = messageText.trim();
    if (!trimmedText && !selectedImage) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'local-user',
      senderName: language === 'ar' ? 'مسافر' : 'Traveler',
      text: trimmedText,
      imageUrl: selectedImage || undefined,
      createdAt: new Date().toISOString(),
    };

    setRoomMessages(prev => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMessage]
    }));
    setMessageText("");
    setSelectedImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDeleteMessage = (msgId: string) => {
    setRoomMessages(prev => ({
      ...prev,
      [activeRoomId]: prev[activeRoomId].filter(m => m.id !== msgId)
    }));
  };

  const SidebarContentEl = (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-3 mb-6 px-2">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {t.community.readerSpace}
          </h3>
        </div>
        <div className="space-y-2">
          {COMMUNITY_ROOMS.filter(r => r.category === 'Reader').map(room => (
            <button
              key={room.id}
              onClick={() => { setActiveRoomId(room.id); setIsSidebarOpen(false); }}
              className={cn(
                "w-full text-start px-5 py-4 rounded-2xl transition-all flex items-center gap-4",
                activeRoomId === room.id 
                  ? "bg-primary text-white shadow-lg" 
                  : "text-muted-foreground hover:bg-primary/5"
              )}
            >
              <Hash className="w-5 h-5 shrink-0" />
              <p className="font-bold text-sm truncate">{room.name}</p>
            </button>
          ))}
        </div>
      </div>
      
      <div className="glass-morphism rounded-[2rem] p-6 border-primary/10 bg-primary/5">
        <h3 className="font-headline text-lg font-bold mb-3">{t.community.instantTitle}</h3>
        <p className="text-xs text-muted-foreground italic leading-relaxed">
          {t.community.instantDesc}
        </p>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen flex flex-col bg-background transition-colors duration-700"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10 max-w-6xl flex flex-col md:flex-row gap-6 md:gap-10 overflow-hidden h-[calc(100vh-80px)]">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-80 shrink-0 h-full overflow-y-auto">
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
                  <Hash className="w-6 h-6 text-primary" />
                  {activeRoom.name}
                </CardTitle>
              </div>
              <Badge variant="outline" className="hidden sm:flex rounded-full px-4 h-7 border-none text-[9px] uppercase tracking-widest font-bold bg-primary/10 text-primary">
                {activeRoom.category}
              </Badge>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-4 sm:p-8">
            <div className="space-y-10 pb-20">
              {currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 text-muted-foreground italic opacity-40">
                  <MessageSquare className="w-16 h-16" />
                  <p className="text-lg">{t.community.empty}</p>
                </div>
              ) : (
                currentMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex flex-col max-w-[90%] sm:max-w-[80%] animate-fade-in",
                      msg.senderId === 'local-user' 
                        ? (language === 'ar' ? "mr-auto ml-0 items-start" : "ml-auto mr-0 items-end") 
                        : (language === 'ar' ? "ml-auto mr-0 items-end" : "mr-auto ml-0 items-start")
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2 px-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {msg.senderName}
                      </span>
                    </div>
                    <div className="group relative">
                      <div className={cn(
                        "px-5 py-4 rounded-[2rem] shadow-sm overflow-hidden",
                        msg.senderId === 'local-user' 
                          ? cn("bg-primary text-white", language === 'ar' ? "rounded-tl-none" : "rounded-tr-none")
                          : cn("bg-white border border-primary/5", language === 'ar' ? "rounded-tr-none" : "rounded-tl-none")
                      )}>
                        {msg.imageUrl && (
                          <div className="mb-4 relative w-full aspect-video rounded-2xl overflow-hidden shadow-md">
                             <Image src={msg.imageUrl} alt="Shared" fill className="object-cover" />
                          </div>
                        )}
                        {msg.text && <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-start">{msg.text}</p>}
                      </div>
                      
                      {msg.senderId === 'local-user' && (
                        <button 
                          onClick={() => handleDeleteMessage(msg.id)}
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all p-3 bg-white/80 rounded-full text-muted-foreground hover:text-destructive shadow-sm",
                            language === 'ar' ? "-right-10" : "-left-10"
                          )}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
                  placeholder={t.community.placeholder}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="bg-white/90 border-primary/10 h-14 sm:h-16 rounded-[2rem] pl-6 pr-24 sm:pr-32 focus:ring-primary/20 focus:border-primary/30 transition-all shadow-inner text-base"
                />
                <div className={cn(
                  "absolute flex items-center gap-1 sm:gap-2",
                  language === 'ar' ? "left-3" : "right-3"
                )}>
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
                                onClick={() => setMessageText(prev => prev + emoji)}
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
                className="rounded-full h-14 sm:h-16 w-14 sm:w-24 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                <Send className={cn("w-6 h-6", language === 'ar' && "rotate-180")} />
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
