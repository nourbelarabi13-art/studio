
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PenSquare, Library, User, Search, BookOpen, LogOut, Settings, LayoutDashboard, Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUser, useAuth, useDoc, useFirestore } from "@/firebase";
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
import { doc } from "firebase/firestore";
import { UserProfile } from "@/lib/types";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  
  const userProfileRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, "users", user.uid);
  }, [user, db]);
  
  const { data: profile } = useDoc<UserProfile>(userProfileRef);

  const navLinks = [
    { name: "Archive", href: "/", icon: Library, roles: ["writer", "reader"] },
    { name: "Forge", href: "/write", icon: PenSquare, roles: ["writer"] },
    { name: "Vault", href: "/vault", icon: BookOpen, roles: ["writer"] },
    { name: "Community", href: "/community", icon: MessageSquare, roles: ["writer"] },
  ];

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: "Goodbye for now",
        description: "Your stories are safe in the vault. Come back soon.",
      });
      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Stay a little longer?",
        description: "We couldn't seal the vault right now.",
      });
    }
  };

  const handleSearchClick = () => {
    if (pathname === '/') {
      const archive = document.querySelector('.scroll-mt-20');
      if (archive) {
        archive.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    router.push('/');
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

        <div className="hidden md:flex items-center gap-8">
          {navLinks.filter(link => !link.roles || (profile?.role && link.roles.includes(profile.role))).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-primary hover:bg-primary/5"
            onClick={handleSearchClick}
          >
            <Search className="w-5 h-5" />
          </Button>
          
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
                <DropdownMenuLabel className="font-headline text-foreground">Your Sanctuary</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/profile/${user.uid}`)} className="gap-2 cursor-pointer focus:bg-primary/5 focus:text-primary">
                  <User className="w-4 h-4" />
                  View Profile
                </DropdownMenuItem>
                {profile?.role === 'writer' && (
                  <DropdownMenuItem onClick={() => router.push('/vault')} className="gap-2 cursor-pointer focus:bg-primary/5 focus:text-primary">
                    <LayoutDashboard className="w-4 h-4" />
                    My Vault
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => router.push('/settings')} className="gap-2 cursor-pointer focus:bg-primary/5 focus:text-primary">
                  <Settings className="w-4 h-4" />
                  Sanctuary Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive">
                  <LogOut className="w-4 h-4" />
                  Leave Sanctuary
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hover:bg-primary/5 gap-2 text-muted-foreground">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 gap-2 rounded-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
