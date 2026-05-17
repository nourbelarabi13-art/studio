
"use client";

import Link from "next/link";
import { BookOpen, Globe, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCelestialTheme } from "@/lib/theme-context";
import { useLanguage } from "@/lib/i18n/context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { theme, toggleTheme } = useCelestialTheme();
  const { language, setLanguage, t } = useLanguage();

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
        
        <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-background font-bold px-6">
          {t.nav.login}
        </Button>
      </div>
    </nav>
  );
}
