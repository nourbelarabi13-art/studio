
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PenSquare, Library, User, Search, BookOpen, LogOut, Settings, LayoutDashboard, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUser, useAuth, useDoc } from "@/firebase";
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
import { getFirestore } from "firebase/firestore";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const auth = useAuth();
  
  // Fetch profile from Firestore to get the username
  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(getFirestore(), "users", user.uid);
  }, [user]);
  
  const { data: profile } = useDoc(userProfileRef);

  const navLinks = [
    { name: "Discover", href: "/", icon: Library },
    { name: "Write", href: "/write", icon: PenSquare },
    { name: "My Vault", href: "/vault", icon: BookOpen },
  ];

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: "Departed the Sanctuary",
        description: "Your vault is now sealed. Safe travels.",
      });
      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Banishment Failed",
        description: "The sanctuary will not let you leave yet.",
      });
    }
  };

  const handleSearchClick = () => {
    toast({
      title: "Archive Search",
      description: "The Grand Library search is currently being transcribed.",
    });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg border-white/5">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <span className="font-headline font-bold text-lg">RN</span>
          </div>
          <span className="font-headline text-xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors">
            Rosa Novara
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-accent",
                pathname === link.href ? "text-accent" : "text-muted-foreground"
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
            className="text-muted-foreground hover:text-foreground hover:bg-white/5"
            onClick={handleSearchClick}
          >
            <Search className="w-5 h-5" />
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:bg-white/5">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="hidden sm:inline">{profile?.username || user.email?.split('@')[0] || "Traveler"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-white/5 text-muted-foreground">
                <DropdownMenuLabel className="font-headline text-foreground">Account Repository</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={() => router.push('/vault')} className="gap-2 cursor-pointer focus:bg-white/5 focus:text-accent">
                  <LayoutDashboard className="w-4 h-4" />
                  The Vault
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-white/5 focus:text-accent">
                  <Settings className="w-4 h-4" />
                  Manifestation Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="w-4 h-4" />
                  Close Vault (Logout)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hover:bg-white/5 gap-2">
                  <LogIn className="w-4 h-4" />
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 gap-2">
                  <UserPlus className="w-4 h-4" />
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
