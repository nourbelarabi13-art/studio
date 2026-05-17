"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  PenSquare, 
  Library, 
  User, 
  BookOpen, 
  LogOut, 
  Settings, 
  Heart, 
  MessageSquare, 
  Bookmark as BookmarkIcon, 
  Bell,
  Globe,
  ChevronDown,
  Sparkles,
  Menu,
  Sun,
  Moon
} from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { UserProfile, Notification, AppLanguage } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/context";
import { AmbientPlayer } from "@/components/ambient-player";
import { useCelestialTheme } from "@/lib/theme-context";
import { useState, useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useCelestialTheme();
  
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, "users", user.uid);
  }, [user, db]);
  
  const { data: profile } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`rosaline_avatar_${user.uid}`);
      if (stored) setLocalAvatar(stored);
    } else {
      setLocalAvatar(null);
    }
  }, [user, profile?.avatar]);

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
      toast({ title: "Goodbye for now" });
      router.push("/");
    } catch (error) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  const displayAvatar = localAvatar || profile?.avatar;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg border-primary/10 transition-colors duration-700">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary h-12 w-12 rounded-full">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-sm rounded-r-[2rem] border-primary/10 bg-background/95 backdrop-blur-xl">
              <SheetHeader className="border-b border-primary/5 pb-6 mb-6">
                <SheetTitle className="font-headline text-2xl font-bold flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                    <Heart className="w-4 h-4" />
                  </div>
                  Rosaline Bela
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2">
                {navLinks.filter(link => !link.roles || (profile?.role && link.roles.includes(profile.role))).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-headline text-lg",
                      pathname === link.href ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Heart className="w-4 h-4" />
          </div>
          <span className="font-headline text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
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

        <div className="flex items-center gap-1 sm:gap-4">
          <div className="hidden sm:block">
            <AmbientPlayer />
          </div>

          {user && (
            <Link href="/notifications" className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full h-10 w-10 sm:h-12 sm:w-12",
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
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:bg-primary/5 rounded-full px-2 pr-4 h-10 sm:h-12">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary relative overflow-hidden">
                    {displayAvatar ? (
                      <Image src={displayAvatar} alt={profile?.username || "Avatar"} fill className="object-cover" />
                    ) : (
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </div>
                  <span className="hidden md:inline font-medium">{profile?.username || "Dreamer"}</span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-card border-primary/10 text-muted-foreground rounded-2xl p-2 shadow-2xl">
                <DropdownMenuLabel className="font-headline py-4 px-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-foreground text-lg">{profile?.username}</span>
                    {profile?.status && (
                      <span className="text-[10px] text-primary italic font-bold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        {profile.status}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/5" />
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.uid}`} className="gap-3 cursor-pointer rounded-xl py-3 hover:bg-primary/5 hover:text-primary w-full flex items-center text-base">
                    <User className="w-5 h-5" />
                    {t.nav.profile}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/edit" className="gap-3 cursor-pointer rounded-xl py-3 hover:bg-primary/5 hover:text-primary font-bold w-full flex items-center text-base">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Refine Persona
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="gap-3 cursor-pointer rounded-xl py-3 hover:bg-primary/5 hover:text-primary w-full flex items-center text-base">
                    <Settings className="w-5 h-5" />
                    {t.nav.settings}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-primary/5" />
                <DropdownMenuItem onClick={handleLogout} className="gap-3 cursor-pointer text-destructive rounded-xl py-3 hover:bg-destructive/5 text-base">
                  <LogOut className="w-5 h-5" />
                  {t.nav.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hover:bg-primary/5 gap-2 text-muted-foreground rounded-full px-4 h-10 sm:h-12">
                  {t.nav.login}
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 gap-2 rounded-full px-6 h-10 sm:h-12 hidden sm:flex">
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
