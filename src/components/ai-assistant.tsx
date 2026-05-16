
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Loader2, User, Ghost, X, MessageSquare, Wand2, BookOpen, AlertCircle } from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';
import { AiChatMessage } from '@/lib/types';
import { askOracle } from '@/ai/flows/ai-assistant-flow';
import { useLanguage } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function AiAssistant() {
  const { user } = useUser();
  const db = useFirestore();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'aiChats'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );
  }, [db, user]);

  const { data: messages } = useCollection<AiChatMessage>(chatQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isProcessing]);

  const handleSendMessage = async (text?: string) => {
    const messageToSend = text || inputMessage;
    if (!messageToSend.trim() || !user || !db || isProcessing) return;

    setInputMessage('');
    setIsProcessing(true);

    const userMsg: Omit<AiChatMessage, 'id'> = {
      role: 'user',
      content: messageToSend,
      createdAt: new Date().toISOString()
    };

    addDoc(collection(db, 'users', user.uid, 'aiChats'), userMsg).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `users/${user.uid}/aiChats`,
        operation: 'create',
        requestResourceData: userMsg
      }));
    });

    try {
      const history = messages?.map(m => ({ role: m.role, content: m.content })) || [];
      const oracleResponse = await askOracle({
        uid: user.uid,
        language,
        message: messageToSend,
        history
      });

      const aiMsg: Omit<AiChatMessage, 'id'> = {
        role: 'model',
        content: oracleResponse.response,
        createdAt: new Date().toISOString()
      };

      addDoc(collection(db, 'users', user.uid, 'aiChats'), aiMsg).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `users/${user.uid}/aiChats`,
          operation: 'create',
          requestResourceData: aiMsg
        }));
      });

    } catch (error: any) {
      console.error("Oracle manifest failed:", error);
      
      let errorTitle = "Celestial Link Error";
      let errorDesc = "The Oracle is currently silent. Please check your connection.";

      if (error.message?.includes("API key not valid") || error.message?.includes("INVALID_ARGUMENT")) {
        errorTitle = "Invalid API Key";
        errorDesc = "The Oracle's Gemini API key is missing or invalid. Please update the .env file.";
      } else if (error.message?.includes("fetch failed")) {
        errorTitle = "Connection Failed";
        errorDesc = "The link to the celestial realm was lost. Please try your whisper again.";
      }

      toast({ 
        title: errorTitle, 
        description: errorDesc,
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="icon" 
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 z-50 animate-bounce group"
        >
          <Sparkles className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[85vh] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-primary/10 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]">
        <DialogHeader className="p-8 border-b border-primary/5 bg-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="font-headline text-2xl font-bold">The Celestial Oracle</DialogTitle>
              <p className="text-xs text-muted-foreground italic">Your guide to the Archive and the Forge.</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-full overflow-hidden">
          <ScrollArea className="flex-1 p-8">
            <div className="space-y-8 pb-8">
              {(!messages || messages.length === 0) && !isProcessing && (
                <div className="text-center py-20 space-y-6">
                  <Ghost className="w-16 h-16 text-primary/10 mx-auto" />
                  <div className="space-y-2">
                    <h3 className="font-headline text-xl font-bold">The Oracle Awaits</h3>
                    <p className="text-sm text-muted-foreground italic max-w-xs mx-auto">
                      "Ask me to forge a story, recommend a dream, or refine your manifestations."
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSendMessage("Recommend a dreamy story")}
                      className="rounded-full text-[10px] uppercase font-bold tracking-widest border-primary/10 hover:bg-primary/5"
                    >
                      <BookOpen className="w-3 h-3 mr-2" /> Recommend
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSendMessage("Help me write a fantasy opening")}
                      className="rounded-full text-[10px] uppercase font-bold tracking-widest border-primary/10 hover:bg-primary/5"
                    >
                      <Wand2 className="w-3 h-3 mr-2" /> Forge
                    </Button>
                  </div>
                </div>
              )}

              {messages?.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex gap-4 max-w-[85%] group animate-in fade-in slide-in-from-bottom-2 duration-300",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    msg.role === 'user' ? "bg-primary/10 text-primary" : "bg-primary text-white"
                  )}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "px-5 py-3 rounded-[1.8rem] shadow-sm text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-white border border-primary/5 rounded-tl-none text-foreground"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className="flex gap-4 mr-auto animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="px-5 py-3 rounded-[1.8rem] bg-white border border-primary/5 rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary/20 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-primary/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-primary/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="p-8 border-t border-primary/5 bg-white/40">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
              className="flex gap-3"
            >
              <Input
                placeholder="Whisper to the Oracle..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isProcessing}
                className="flex-1 bg-white/80 border-primary/10 h-14 rounded-full px-8 focus:bg-white transition-all shadow-sm"
              />
              <Button 
                type="submit" 
                disabled={!inputMessage.trim() || isProcessing}
                className="rounded-full h-14 w-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
