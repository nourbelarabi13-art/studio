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
  Headphones,
  PlusCircle
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
    
    if (index === activeIndex) {
      const nextIdx = index === 0 ? 0 : index - 1;
      setTimeout(() => switchTrack(nextIdx), 0);
    } else if (index < activeIndex) {
      setActiveIndex(prev => prev - 1);
    }
  };

  return (
    <div className="flex items-center gap-3 px-2">
      {/* Current Track Info (Desktop) */}
      <div className="flex flex-col items-end mr-2 hidden xl:flex">
         <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary truncate max-w-[150px]">
           {activeTrack.title}
         </span>
         <span className="text-[8px] uppercase tracking-widest text-muted-foreground italic">
           {activeTrack.artist}
         </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          className={cn(
            "h-11 w-11 rounded-full transition-all duration-500 border border-transparent shadow-sm",
            isPlaying 
              ? "text-primary border-primary/20 bg-primary/5 shadow-[0_0_20px_rgba(219,112,147,0.2)]" 
              : "text-muted-foreground hover:text-primary hover:bg-primary/5"
          )}
          title={isPlaying ? "Silence the Echoes" : "Awaken the Echoes"}
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isPlaying ? (
            <Volume2 className="w-6 h-6 animate-pulse" />
          ) : (
            <Music className="w-6 h-6" />
          )}
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline"
              className="hidden sm:flex rounded-full h-11 px-6 border-primary/20 text-primary hover:bg-primary/5 font-bold text-[11px] uppercase tracking-[0.15em] gap-2 transition-all shadow-md active:scale-95 group"
            >
              <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90" />
              Add Your Favorite Song
            </Button>
          </PopoverTrigger>
          {/* Mobile version of the trigger */}
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="sm:hidden h-10 w-10 rounded-full text-primary hover:bg-primary/5 border border-primary/10"
            >
              <PlusCircle className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-[90vw] max-w-md p-0 rounded-[2.5rem] border-primary/20 bg-white/95 backdrop-blur-xl shadow-2xl mb-4 overflow-hidden" align="end">
            <div className="p-8 border-b border-primary/5 bg-primary/5 space-y-2">
              <h4 className="font-headline text-2xl font-bold flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                Celestial Orchestra
              </h4>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                Add your own atmospheric whispers to the sanctuary's global archive.
              </p>
            </div>

            <ScrollArea className="max-h-[65vh]">
              <div className="p-8 space-y-10">
                {/* Add Song Form */}
                <form onSubmit={handleAddSong} className="space-y-5 bg-white/60 p-7 rounded-[2rem] border border-primary/10 shadow-xl animate-fade-in ring-1 ring-primary/5">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-primary ml-1">Song Title</Label>
                      <Input 
                        placeholder="e.g., The Moon's Lament" 
                        value={newTitle} 
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="h-11 text-sm rounded-xl bg-white border-primary/10 focus:ring-primary/20 shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-primary ml-1">Artist Persona</Label>
                      <Input 
                        placeholder="e.g., Midnight Weaver" 
                        value={newArtist} 
                        onChange={(e) => setNewArtist(e.target.value)}
                        className="h-11 text-sm rounded-xl bg-white border-primary/10 focus:ring-primary/20 shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-primary ml-1">Audio Source URL</Label>
                      <Input 
                        placeholder="Paste direct .mp3 link here..." 
                        value={newUrl} 
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="h-11 text-sm rounded-xl bg-white border-primary/10 focus:ring-primary/20 shadow-inner"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!newTitle.trim() || !newUrl.trim()}
                    className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-[12px] uppercase tracking-[0.2em] gap-3 transition-all shadow-lg active:scale-95 shadow-primary/10"
                  >
                    <Plus className="w-5 h-5" /> Manifest Whisper
                  </Button>
                </form>

                {/* Playlist Display */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between px-2">
                     <h5 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                       <Headphones className="w-4 h-4" /> Manifested Echoes
                     </h5>
                     <span className="text-[10px] font-mono font-bold text-primary/40 bg-primary/5 px-3 py-1 rounded-full">{playlist.length} tracks</span>
                  </div>
                  
                  <div className="space-y-3">
                    {playlist.map((song, idx) => (
                      <div 
                        key={song.id}
                        className={cn(
                          "group flex items-center justify-between p-4 rounded-[1.5rem] border transition-all cursor-pointer",
                          activeIndex === idx 
                            ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" 
                            : "bg-white border-primary/5 hover:border-primary/20 hover:bg-primary/5"
                        )}
                        onClick={() => switchTrack(idx)}
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-105",
                            activeIndex === idx ? "bg-white/20" : "bg-primary/10 text-primary"
                          )}>
                            {activeIndex === idx && isPlaying ? (
                              <Pause className="w-5 h-5 fill-current" />
                            ) : (
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate leading-tight">{song.title}</p>
                            <p className={cn(
                              "text-[10px] truncate leading-tight opacity-70 mt-1 uppercase tracking-wide",
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
                              "p-3 rounded-xl transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100",
                              activeIndex === idx ? "hover:bg-white/20 text-white" : "hover:bg-destructive/5 text-muted-foreground hover:text-destructive"
                            )}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
            
            <div className="p-6 bg-primary/5 text-[10px] text-center italic text-muted-foreground/60 border-t border-primary/5">
              "Direct manifestable links ensure the highest resonance within the sanctuary."
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
