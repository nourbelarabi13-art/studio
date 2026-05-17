'use client';

import React, { useEffect, useState } from 'react';
import { useCelestialTheme } from '@/lib/theme-context';
import { cn } from '@/lib/utils';

/**
 * A global Starry Night background effect with drifting soft-yellow particles.
 * Activates and becomes fully visible only when Celestial Night Mode is enabled.
 */
export function StarryNightEffect() {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: string; delay: string; duration: string }[]>([]);
  const { theme } = useCelestialTheme();

  useEffect(() => {
    // Generate a fixed set of star positions on the client only to avoid hydration mismatch
    const starCount = 80; // Slightly more stars for celestial mode
    const newStars = Array.from({ length: starCount }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      delay: `${Math.random() * 8}s`,
      duration: `${Math.random() * 12 + 10}s`,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className={cn(
      "fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none transition-opacity duration-1000",
      theme === 'celestial' ? "opacity-100" : "opacity-0"
    )}>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-yellow-100/40 blur-[0.5px] animate-star-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
            boxShadow: '0 0 8px rgba(255, 253, 231, 0.6)', // Soft yellow glow
          }}
        />
      ))}
      
      {/* Dynamic atmospheric swirls that only appear in night mode */}
      <div className="absolute top-[10%] right-[10%] w-[50vw] h-[50vw] bg-yellow-100/5 rounded-full blur-[150px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-accent/5 rounded-full blur-[200px] animate-pulse pointer-events-none" style={{ animationDelay: '5s' }} />
    </div>
  );
}
