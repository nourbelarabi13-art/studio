"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

/**
 * A rotating artistic gallery showcasing two high-quality literary photos.
 * Images alternate positions every 3 minutes with a smooth cross-fade.
 * Features a mystery-to-clarity hover effect.
 */
export function PhotoGallery() {
  const [isSwapped, setIsSwapped] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSwapped((prev) => !prev);
    }, 180000); // 3 minutes rotation
    return () => clearInterval(interval);
  }, []);

  const img1 = PlaceHolderImages.find(img => img.id === 'gallery-rotating-1');
  const img2 = PlaceHolderImages.find(img => img.id === 'gallery-rotating-2');

  if (!img1 || !img2) return null;

  return (
    <section className="w-full bg-[#1a0f21] overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full h-[300px] md:h-[450px]">
        {/* Slot 1 */}
        <div className="relative h-full w-full overflow-hidden border-r border-white/5 group">
          <div className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out" style={{ opacity: isSwapped ? 0 : 1 }}>
             <GalleryItem image={img1} />
          </div>
          <div className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out" style={{ opacity: isSwapped ? 1 : 0 }}>
             <GalleryItem image={img2} />
          </div>
        </div>

        {/* Slot 2 */}
        <div className="relative h-full w-full overflow-hidden group hidden md:block">
          <div className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out" style={{ opacity: isSwapped ? 1 : 0 }}>
             <GalleryItem image={img1} />
          </div>
          <div className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out" style={{ opacity: isSwapped ? 0 : 1 }}>
             <GalleryItem image={img2} />
          </div>
        </div>
      </div>
      {/* Soft shadow transition to the rest of the page using the midnight plum hue */}
      <div className="h-12 w-full bg-gradient-to-b from-[#1a0f21] to-background" />
    </section>
  );
}

function GalleryItem({ image }: { image: any }) {
  return (
    <div className="relative h-full w-full">
      <Image
        src={image.imageUrl}
        alt={image.description}
        fill
        className={cn(
          "object-cover transition-all duration-[1500ms] ease-in-out cursor-pointer",
          "blur-2xl opacity-20 grayscale brightness-50 scale-110",
          "group-hover:blur-none group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-100"
        )}
        data-ai-hint={image.imageHint}
        priority
      />
      {/* Subtle light effect on hover */}
      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
    </div>
  );
}
