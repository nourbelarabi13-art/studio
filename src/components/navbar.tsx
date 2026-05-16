
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PenSquare, Library, User, Search, BookOpen, LogOut, Settings, Heart, MessageSquare, Bookmark as BookmarkIcon, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUser, useAuth, useDoc, useFirestore, useCollection } from "@/firebase";
import { signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { UserProfile, Notification } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/context";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { t } = useLanguage();
  
  const userProfileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, "users", user.uid);
  }, [user, db]);
  
  const { data: profile } = useDoc<UserProfile>(userProfileRef);

  const notificationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "users", user.uid, "notifications"), where("read", "==", false));
  }, [db, user]);
  const { data: unreadNotifications } = useCollection<Notification>(notificationsQuery);

  const navLinks = [
    { name: t.nav.archive, href: "/", icon: Library, roles: ["writer", "reader"] },
    { name: "My Library", href: "/library", icon: BookmarkIcon, roles: ["writer", "reader"] },
    { name: t.nav.community, href: "/community", icon: MessageSquare, roles: ["writer", "reader"] },
    { name: t.nav.forge, href: "/write", icon: PenSquare, roles: ["writer"] },
    { name: t.nav.vault, href: "/vault", icon: BookOpen, roles: ["writer"] },
  ];

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: "Goodbye for now",
      });
      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
      });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg border-primary/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Heart className="w-4 h-4" />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            Rosaline Bela
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.filter(link => !link.roles || (profile?.role && link.roles.includes(profile.role))).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary font-bold" : "text-muted-foreground"
              )}
            >
              <link.icon className={cn("w-4 h-4", pathname === link.href ? "text-primary" : "text-muted-foreground/60")} />
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-primary hover:bg-primary/5"
            onClick={() => router.push("/")}
          >
            <Search className="w-5 h-5" />
          </Button>

          {user && (
            <Link href="/notifications" className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "text-muted-foreground hover:text-primary hover:bg-primary/5",
                  pathname === '/notifications' && "text-primary bg-primary/5"
                )}
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications && unreadNotifications.length > 0 && (
                  <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white ring-2 ring-white">
                    {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
                  </span>
                )}
              </Button>
            </Link>
          )}
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:bg-primary/5">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="hidden sm:inline font-medium">{profile?.username || "Dreamer"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-primary/10 text-muted-foreground">
                <DropdownMenuLabel className="font-headline text-foreground">{profile?.username}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/profile/${user.uid}`)} className="gap-2 cursor-pointer focus:bg-primary/5 focus:text-primary">
                  <User className="w-4 h-4" />
                  {t.nav.profile}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')} className="gap-2 cursor-pointer focus:bg-primary/5 focus:text-primary">
                  <Settings className="w-4 h-4" />
                  {t.nav.settings}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive">
                  <LogOut className="w-4 h-4" />
                  {t.nav.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hover:bg-primary/5 gap-2 text-muted-foreground">
                  {t.nav.login}
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 gap-2 rounded-full">
                  {t.nav.signup}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
