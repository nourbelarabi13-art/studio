
"use client";

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

const GALLERY_IMAGES = PlaceHolderImages.filter(img => img.id.startsWith('gallery-'));

export function PhotoGallery() {
  return (
    <section className="w-full bg-[#0f0c13] overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-4 w-full h-[250px] md:h-[350px]">
        {GALLERY_IMAGES.map((image, index) => (
          <div 
            key={image.id} 
            className="relative h-full w-full overflow-hidden border-r border-white/5 last:border-r-0 group"
          >
            <Image
              src={image.imageUrl}
              alt={image.description}
              fill
              className={cn(
                "object-cover transition-all duration-[1200ms] ease-in-out cursor-pointer",
                "blur-xl opacity-30 grayscale brightness-75",
                "group-hover:blur-none group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-110"
              )}
              data-ai-hint={image.imageHint}
            />
            {/* Subtle light effect on hover */}
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
          </div>
        ))}
      </div>
      {/* Soft shadow transition to the rest of the page */}
      <div className="h-12 w-full bg-gradient-to-b from-[#0f0c13] to-background" />
    </section>
  );
}
