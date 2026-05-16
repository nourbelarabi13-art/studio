"use client";

import { useState, useRef, useEffect } from "react";
import { Music, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Reliable direct MP3 link for ambient atmosphere
const AMBIENT_TRACK_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export function AmbientPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create audio element on mount
    const audio = new Audio(AMBIENT_TRACK_URL);
    audio.loop = true;
    audio.volume = 0;
    
    // Graceful error handling - log to console only, no user-facing alerts
    audio.onerror = () => {
      console.warn("The sanctuary's melody failed to manifest. The source link might be unstable.");
      setIsLoading(false);
      setIsPlaying(false);
    };

    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  const fadeVolume = (target: number) => {
    if (!audioRef.current) return;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const step = 0.02;
    const intervalTime = 50; // ms for a smoother fade

    fadeIntervalRef.current = setInterval(() => {
      if (!audioRef.current) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        return;
      }

      const currentVolume = audioRef.current.volume;
      
      if (Math.abs(currentVolume - target) < step) {
        audioRef.current.volume = target;
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        if (target === 0) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      } else {
        const nextVolume = currentVolume + (target > currentVolume ? step : -step);
        audioRef.current.volume = Math.max(0, Math.min(1, nextVolume));
      }
    }, intervalTime);
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      fadeVolume(0);
    } else {
      setIsLoading(true);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        fadeVolume(0.3); // Comfortable target volume
      } catch (error) {
        // Silent error handling for the user experience
        console.warn("Audio playback ritual interrupted by the environment.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 px-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className={cn(
          "h-9 w-9 rounded-full transition-all duration-500 border border-transparent",
          isPlaying 
            ? "text-primary border-primary/20 bg-primary/5 shadow-[0_0_10px_rgba(219,112,147,0.2)]" 
            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
        )}
        title={isPlaying ? "Silence the Echoes" : "Awaken the Echoes"}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Volume2 className="w-4 h-4 animate-pulse" />
        ) : (
          <Music className="w-4 h-4" />
        )}
      </Button>
      
      {isPlaying && (
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/60 animate-fade-in hidden sm:block">
          Dreaming...
        </span>
      )}
    </div>
  );
}
