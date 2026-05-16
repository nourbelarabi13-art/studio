
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

const BG_IMAGES = PlaceHolderImages.filter(img => 
  img.id.startsWith('bg-') || img.id === 'hero-dreamy'
);

export function DynamicBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevIndex(currentIndex);
      setCurrentIndex((prev) => (prev + 1) % BG_IMAGES.length);
      setIsTransitioning(true);
      
      // Reset transition state after animation finishes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 2000); 
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-background">
      {/* Previous Image (Stays until next is fully visible) */}
      <div className="absolute inset-0">
        <Image
          src={BG_IMAGES[prevIndex].imageUrl}
          alt="Sanctuary Background"
          fill
          className="object-cover opacity-20"
          priority
          data-ai-hint={BG_IMAGES[prevIndex].imageHint}
        />
      </div>

      {/* Current Image (Fades In) */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-[2000ms] ease-in-out",
          isTransitioning ? "opacity-100" : "opacity-100"
        )}
      >
        <Image
          src={BG_IMAGES[currentIndex].imageUrl}
          alt="Sanctuary Background"
          fill
          className="object-cover opacity-20"
          priority
          data-ai-hint={BG_IMAGES[currentIndex].imageHint}
        />
      </div>

      {/* Soft Overlays for depth and readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
    </div>
  );
}
