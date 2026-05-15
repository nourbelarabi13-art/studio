
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenSquare, Library, User, Search, BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const isLoggedIn = true; // Placeholder for auth logic

  const navLinks = [
    { name: "Discover", href: "/", icon: Library },
    { name: "Write", href: "/write", icon: PenSquare },
    { name: "My Vault", href: "/vault", icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
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
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Search className="w-5 h-5" />
          </Button>
          
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link href="/vault">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Raven_Writer</span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
