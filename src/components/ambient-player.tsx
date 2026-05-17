"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Music, 
  Volume2, 
  Loader2, 
  Settings2, 
  Sparkles, 
  Plus, 
  Play, 
  Pause,
  Trash2,
  Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
}

const INITIAL_PLAYLIST: Song[] = [
  { 
    id: "default-1", 
    title: "Celestial Calm", 
    artist: "Sanctuary Echoes", 
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
  },
  { 
    id: "default-2", 
    title: "Midnight Mist", 
    artist: "The Archivist", 
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" 
  }
];

export function AmbientPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playlist, setPlaylist] = useState<Song[]>(INITIAL_PLAYLIST);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newArtist, setNewArtist] = useState("");
  const [newUrl, setNewUrl] = useState("");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const activeTrack = playlist[activeIndex];

  useEffect(() => {
    // Initialize audio element
    const audio = new Audio(activeTrack.url);
    audio.loop = true;
    audio.volume = 0;
    
    audio.oncanplay = () => setIsLoading(false);
    audio.onwaiting = () => setIsLoading(true);
    
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

  const fadeVolume = (target: number, onComplete?: () => void) => {
    if (!audioRef.current) return;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const step = 0.05;
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
        if (onComplete) onComplete();
      } else {
        const nextVolume = currentVolume + (target > currentVolume ? step : -step);
        audioRef.current.volume = Math.max(0, Math.min(1, nextVolume));
      }
    }, intervalTime);
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      fadeVolume(0, () => {
        audioRef.current?.pause();
        setIsPlaying(false);
      });
    } else {
      setIsLoading(true);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        fadeVolume(0.4);
      } catch (error) {
        console.warn("Audio playback ritual interrupted.");
        setIsLoading(false);
      }
    }
  };

  const switchTrack = (index: number) => {
    if (!audioRef.current || index === activeIndex) return;

    const wasPlaying = isPlaying;
    fadeVolume(0, () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = playlist[index].url;
        audioRef.current.load();
        setActiveIndex(index);
        
        if (wasPlaying) {
          setIsLoading(true);
          audioRef.current.play().then(() => {
            fadeVolume(0.4);
          }).catch(() => {
            setIsPlaying(false);
            setIsLoading(false);
          });
        }
      }
    });
  };

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const newSong: Song = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      artist: newArtist || "Unknown Traveler",
      url: newUrl
    };

    setPlaylist(prev => [...prev, newSong]);
    setNewTitle("");
    setNewArtist("");
    setNewUrl("");
  };

  const removeSong = (id: string, index: number) => {
    if (playlist.length <= 1) return;
    
    setPlaylist(prev => prev.filter(s => s.id !== id));
    
    // If we removed the active track or one before it, adjust index
    if (index === activeIndex) {
      const nextIdx = index === 0 ? 0 : index - 1;
      // We need to wait for state update usually, but for simple index it's fine
      // Actually switchTrack handles the audio change
      setTimeout(() => switchTrack(nextIdx), 0);
    } else if (index < activeIndex) {
      setActiveIndex(prev => prev - 1);
    }
  };

  return (
    <div className="flex items-center gap-1 px-2">
      <div className="flex flex-col items-end mr-3 hidden lg:flex">
         <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/60 truncate max-w-[120px]">
           {activeTrack.title}
         </span>
         <span className="text-[7px] uppercase tracking-widest text-muted-foreground italic">
           {activeTrack.artist}
         </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className={cn(
          "h-10 w-10 rounded-full transition-all duration-500 border border-transparent shadow-sm",
          isPlaying 
            ? "text-primary border-primary/20 bg-primary/5 shadow-[0_0_15px_rgba(219,112,147,0.15)]" 
            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
        )}
        title={isPlaying ? "Silence the Echoes" : "Awaken the Echoes"}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isPlaying ? (
          <Volume2 className="w-5 h-5 animate-pulse" />
        ) : (
          <Music className="w-5 h-5" />
        )}
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5 opacity-60 hover:opacity-100"
          >
            <Settings2 className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[90vw] max-w-sm p-0 rounded-[2rem] border-primary/10 bg-white/95 backdrop-blur-xl shadow-2xl mb-4 overflow-hidden" align="end">
          <div className="p-6 border-b border-primary/5 bg-primary/5 space-y-1">
            <h4 className="font-headline text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Celestial Orchestra
            </h4>
            <p className="text-[10px] text-muted-foreground italic">Manifest your own atmospheric whispers.</p>
          </div>

          <ScrollArea className="max-h-[60vh]">
            <div className="p-6 space-y-8">
              {/* Add Song Form */}
              <form onSubmit={handleAddSong} className="space-y-4 bg-white/50 p-5 rounded-[1.5rem] border border-primary/10 shadow-sm animate-fade-in">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] uppercase tracking-widest font-bold text-primary/70 ml-1">Whisper Title</Label>
                    <Input 
                      placeholder="e.g., Starry Waltz" 
                      value={newTitle} 
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="h-9 text-xs rounded-xl bg-white/80 border-primary/10 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] uppercase tracking-widest font-bold text-primary/70 ml-1">Artist Persona</Label>
                    <Input 
                      placeholder="e.g., Midnight Scribe" 
                      value={newArtist} 
                      onChange={(e) => setNewArtist(e.target.value)}
                      className="h-9 text-xs rounded-xl bg-white/80 border-primary/10 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] uppercase tracking-widest font-bold text-primary/70 ml-1">Audio Source (URL)</Label>
                    <Input 
                      placeholder="Paste direct .mp3 link..." 
                      value={newUrl} 
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="h-9 text-xs rounded-xl bg-white/80 border-primary/10 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={!newTitle.trim() || !newUrl.trim()}
                  className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-[10px] uppercase tracking-widest gap-2 transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Manifest Song
                </Button>
              </form>

              {/* Playlist Display */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                   <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                     <Headphones className="w-3 h-3" /> Manifested Echoes
                   </h5>
                   <span className="text-[9px] font-mono text-primary/40">{playlist.length} tracks</span>
                </div>
                
                <div className="space-y-2">
                  {playlist.map((song, idx) => (
                    <div 
                      key={song.id}
                      className={cn(
                        "group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer",
                        activeIndex === idx 
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                          : "bg-white border-primary/5 hover:border-primary/20 hover:bg-primary/5"
                      )}
                      onClick={() => switchTrack(idx)}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                          activeIndex === idx ? "bg-white/20" : "bg-primary/10 text-primary"
                        )}>
                          {activeIndex === idx && isPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[11px] font-bold truncate leading-tight">{song.title}</p>
                          <p className={cn(
                            "text-[9px] truncate leading-tight opacity-70",
                            activeIndex === idx ? "text-white" : "text-muted-foreground"
                          )}>
                            {song.artist}
                          </p>
                        </div>
                      </div>
                      
                      {playlist.length > 1 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeSong(song.id, idx); }}
                          className={cn(
                            "p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100",
                            activeIndex === idx ? "hover:bg-white/20 text-white" : "hover:bg-destructive/5 text-muted-foreground hover:text-destructive"
                          )}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <div className="p-4 bg-primary/5 text-[8px] text-center italic text-muted-foreground/60 border-t border-primary/5">
            "Direct manifestable links ensure the highest resonance."
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
