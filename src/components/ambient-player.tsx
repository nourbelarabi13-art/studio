"use client";

import { useState, useRef, useEffect } from "react";
import { Music, Volume2, Loader2, Settings2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Reliable default MP3 link for ambient atmosphere
const DEFAULT_AMBIENT_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export function AmbientPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [trackUrl, setTrackUrl] = useState(DEFAULT_AMBIENT_URL);
  const [inputUrl, setInputUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create audio element on mount
    const audio = new Audio(trackUrl);
    audio.loop = true;
    audio.volume = 0;
    
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
    const intervalTime = 50;

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
        fadeVolume(0.3);
      } catch (error) {
        console.warn("Audio playback ritual interrupted by the environment.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const loadCustomTrack = () => {
    if (!inputUrl.trim() || !audioRef.current) return;

    const wasPlaying = isPlaying;
    
    // Pause and reset
    audioRef.current.pause();
    audioRef.current.src = inputUrl;
    audioRef.current.load();
    setTrackUrl(inputUrl);
    
    if (wasPlaying) {
      setIsLoading(true);
      audioRef.current.play().then(() => {
        fadeVolume(0.3);
      }).catch(() => {
        setIsPlaying(false);
      }).finally(() => {
        setIsLoading(false);
      });
    }
  };

  return (
    <div className="flex items-center gap-1 px-2">
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

      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5 opacity-60 hover:opacity-100"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-5 rounded-[1.8rem] border-primary/10 bg-white/95 backdrop-blur-xl shadow-2xl mb-2">
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-headline text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-primary" />
                Tune the Atmosphere
              </h4>
              <p className="text-[10px] text-muted-foreground italic">Manifest your own echoes from the mists.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Paste your MP3 link here..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="bg-primary/5 border-primary/10 h-10 rounded-xl text-xs focus:ring-primary/20 focus:border-primary/30"
              />
              <Button 
                onClick={loadCustomTrack} 
                disabled={!inputUrl.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-9 text-[10px] font-bold uppercase tracking-widest"
              >
                Load Custom Track
              </Button>
            </div>
            {trackUrl !== DEFAULT_AMBIENT_URL && (
              <button 
                onClick={() => { setInputUrl(""); setTrackUrl(DEFAULT_AMBIENT_URL); if (audioRef.current) { audioRef.current.src = DEFAULT_AMBIENT_URL; if (isPlaying) audioRef.current.play(); } }}
                className="text-[9px] text-muted-foreground hover:text-primary block mx-auto underline transition-colors"
              >
                Restore Default Melody
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {isPlaying && (
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/60 animate-fade-in hidden sm:block ml-1">
          Dreaming...
        </span>
      )}
    </div>
  );
}
