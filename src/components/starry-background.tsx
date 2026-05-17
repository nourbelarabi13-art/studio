
'use client';

import React, { useEffect, useState } from 'react';

export function StarryBackground() {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: string; delay: string }[]>([]);

  useEffect(() => {
    // Generate stars on mount to avoid hydration mismatch
    const newStars = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      delay: `${Math.random() * 5}s`,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-background">
      {/* Deep gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-background" />
      
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-primary/40 star-pulse"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
          }}
        />
      ))}
      
      {/* Mystical glow blobs */}
      <div className="absolute top-1/4 -right-20 w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute -bottom-20 -left-20 w-[30vw] h-[30vw] bg-accent/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
}
