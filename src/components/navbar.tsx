"use client";

import Link from "next/link";
import { BookOpen, Globe, Moon, Sun, User, Settings, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCelestialTheme } from "@/lib/theme-context";
import { useLanguage } from "@/lib/i18n/context";
import { useUser } from "@/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { theme, toggleTheme } = useCelestialTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useUser();

  return (
    <nav className="w-full h-20 flex items-center justify-between px-8 sm:px-12 border-b border-white/5 bg-background/40 backdrop-blur-md sticky top-0 z-50 transition-colors duration-700">
      <Link href="/" className="flex items-center gap-2 group cursor-pointer">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <span className="font-headline text-xl font-bold tracking-tight text-primary">Rosaline Bela</span>
      </Link>

      <div className="hidden sm:flex items-center gap-8">
        <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
          {t.nav.archive}
        </Link>
        <Link href="/vault" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
          {t.nav.vault}
        </Link>
        <Link href="/community" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
          {t.nav.community}
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full h-10 w-10">
              <Globe className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-lg border-primary/10 rounded-xl">
            <DropdownMenuItem onClick={() => setLanguage('en')} className="font-bold text-xs uppercase cursor-pointer">
              English (EN)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('ar')} className="font-bold text-xs font-arabic cursor-pointer">
              العربية (AR)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="text-primary hover:bg-primary/10 rounded-full h-10 w-10 transition-all duration-500"
          title={theme === 'light' ? 'الوضع الليلي (Night Mode)' : 'الوضع النهاري (Day Mode)'}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 h-10 w-10 shadow-inner">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-xl border-primary/10 rounded-2xl p-2 shadow-2xl">
              <DropdownMenuLabel className="font-headline text-lg px-3 py-2">My Persona</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-primary/5" />
              <DropdownMenuItem asChild>
                <Link href={`/profile/${user.uid}`} className="rounded-xl cursor-pointer gap-3 p-3 font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
                  <User className="w-4 h-4" /> View My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/edit" className="rounded-xl cursor-pointer gap-3 p-3 font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
                  <Edit3 className="w-4 h-4" /> Refine Persona
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="rounded-xl cursor-pointer gap-3 p-3 font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
                  <Settings className="w-4 h-4" /> Sanctuary Rituals
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-background font-bold px-6">
              {t.nav.login}
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
