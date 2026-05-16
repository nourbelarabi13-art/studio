
"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { Notification } from "@/lib/types";
import { Navbar } from "@/components/navbar";
import { 
  Loader2, 
  Bell, 
  Heart, 
  BookOpen, 
  MessageSquare, 
  Trash2, 
  Ghost,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { markNotificationAsRead, deleteNotification } from "@/firebase/firestore/notification-actions";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function NotificationsPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  const notificationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
  }, [db, user]);

  const { data: notifications, loading } = useCollection<Notification>(notificationsQuery);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center dreamy-fantasy-gradient">
        <Bell className="w-12 h-12 text-primary mb-6" />
        <h1 className="font-headline text-3xl font-bold mb-4">Whispers of the Sanctuary</h1>
        <p className="text-muted-foreground italic max-w-md">Join our archive to receive personal whispers from the community.</p>
        <Link href="/login">
          <Button className="mt-8 rounded-full px-12 h-14 bg-primary text-white shadow-xl shadow-primary/20">Sign in to hear the Whispers</Button>
        </Link>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 text-primary fill-primary/20" />;
      case 'story': return <BookOpen className="w-5 h-5 text-primary" />;
      case 'comment': return <MessageSquare className="w-5 h-5 text-accent" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="min-h-screen dreamy-fantasy-gradient">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-3xl space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Bell className="w-6 h-6" />
              </div>
              <h1 className="font-headline text-4xl font-bold">Sanctuary Whispers</h1>
            </div>
            <p className="text-muted-foreground italic">Community fragments and creative echoes sent just for you.</p>
          </div>
          {unreadCount > 0 && (
            <p className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
              {unreadCount} Unread Whispers
            </p>
          )}
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="italic text-muted-foreground">Gathering the echoes...</p>
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="text-center py-32 glass-morphism rounded-[3rem] border-dashed border-primary/20 flex flex-col items-center gap-6">
            <Ghost className="w-16 h-16 text-primary/20" />
            <div className="space-y-2">
              <p className="text-muted-foreground italic text-lg">The mists are currently silent.</p>
              <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">Wander the community to spark new connections</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                className={cn(
                  "glass-morphism rounded-[2rem] p-6 border-primary/10 flex items-center gap-6 transition-all group",
                  !notif.read ? "bg-white/90 shadow-md border-primary/20 ring-1 ring-primary/5" : "bg-white/40 opacity-80"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                  !notif.read ? "bg-primary/10" : "bg-muted"
                )}>
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <p className={cn("text-sm leading-relaxed", !notif.read ? "font-bold" : "text-muted-foreground")}>
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                    {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!notif.read && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-full text-primary hover:bg-primary/5"
                      onClick={() => markNotificationAsRead(db!, user.uid, notif.id!)}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                    onClick={() => deleteNotification(db!, user.uid, notif.id!)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  
                  {notif.targetId && (
                    <Link href={notif.type === 'story' ? `/read/${notif.targetId}` : `/read/${notif.targetId}`}>
                      <Button size="sm" variant="outline" className="rounded-full px-4 h-9 text-[10px] font-bold uppercase tracking-widest border-primary/10 text-primary hover:bg-primary/5">
                        View
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
