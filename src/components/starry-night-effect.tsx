'use client';

import React, { useEffect, useState } from 'react';

/**
 * A subtle global Starry Night background effect with drifting soft-yellow particles.
 * Provides a gentle, Van Gogh-inspired atmosphere across the entire sanctuary.
 */
export function StarryNightEffect() {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    // Generate a fixed set of star positions on the client only to avoid hydration mismatch
    const starCount = 50;
    const newStars = Array.from({ length: starCount }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 1.5 + 1}px`,
      delay: `${Math.random() * 8}s`,
      duration: `${Math.random() * 12 + 10}s`,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-100 select-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-yellow-100/20 blur-[0.5px] animate-star-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
            boxShadow: '0 0 6px rgba(255, 253, 231, 0.4)', // Soft yellow glow
          }}
        />
      ))}
      {/* Subtle broad glows to mimic Van Gogh's swirls */}
      <div className="absolute top-[10%] right-[10%] w-[40vw] h-[40vw] bg-yellow-100/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-[30vw] h-[30vw] bg-primary/5 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '3s' }} />
    </div>
  );
}
