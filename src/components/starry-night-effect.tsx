
'use client';

import React, { useEffect, useState } from 'react';

/**
 * A Starry Night background effect with drifting yellow particles.
 * Mimics a Van Gogh inspired sky with soft, glowing embers.
 */
export function StarryNightEffect() {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    // Generate a fixed set of star positions on the client only to avoid hydration mismatch
    const starCount = 60;
    const newStars = Array.from({ length: starCount }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      delay: `${Math.random() * 8}s`,
      duration: `${Math.random() * 10 + 10}s`,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-100">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-primary/20 blur-[1px] animate-star-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
            boxShadow: '0 0 8px rgba(219, 112, 147, 0.3)', // Using theme primary color for soft glow
          }}
        />
      ))}
      {/* Decorative large glow to mimic Van Gogh's swirls */}
      <div className="absolute top-[20%] right-[15%] w-64 h-64 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[30%] left-[10%] w-48 h-48 bg-primary/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
}
