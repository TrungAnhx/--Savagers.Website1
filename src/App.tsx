import { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, Disc3, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import Home from './pages/Home';
import Mixtapes from './pages/Mixtapes';
import Journal from './pages/Journal';

interface Track {
  name: string;
  duration: string;
  artist: string;
  url: string;
}

function Layout() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.play().catch(e => console.log("Playback failed:", e));
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setIsPlaying(true);
          }).catch(e => {
            console.log("Play error:", e);
            // Revert state if play fails
            setIsPlaying(false);
          });
        } else {
           setIsPlaying(true);
        }
      }
    }
  };

  const handlePlayTrack = (track: Track, newPlaylist: Track[]) => {
    if (currentTrack?.name === track.name) {
      togglePlay();
      return;
    }
    setPlaylist(newPlaylist);
    setCurrentTrack(track);
  };

  const playNext = () => {
    if (!currentTrack || playlist.length === 0) return;
    
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      setCurrentTrack(playlist[randomIndex]);
      return;
    }

    const currentIndex = playlist.findIndex(t => t.name === currentTrack.name);
    if (currentIndex === -1) return;

    if (currentIndex === playlist.length - 1) {
      if (repeatMode === 'all') {
        setCurrentTrack(playlist[0]);
      } else {
        setIsPlaying(false);
      }
    } else {
      setCurrentTrack(playlist[currentIndex + 1]);
    }
  };

  const playPrev = () => {
    if (!currentTrack || playlist.length === 0) return;
    
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      setCurrentTrack(playlist[randomIndex]);
      return;
    }

    const currentIndex = playlist.findIndex(t => t.name === currentTrack.name);
    if (currentIndex === -1) return;

    if (currentIndex === 0) {
      setCurrentTrack(playlist[playlist.length - 1]);
    } else {
      setCurrentTrack(playlist[currentIndex - 1]);
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      const currentIndex = playlist.findIndex(t => t.name === currentTrack?.name);
      if (repeatMode === 'none' && currentIndex === playlist.length - 1 && !isShuffle) {
        setIsPlaying(false);
      } else {
        playNext();
      }
    }
  };

  const toggleRepeatMode = () => {
    if (repeatMode === 'none') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('none');
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) setPreviousVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
      if (audioRef.current) audioRef.current.volume = 0;
    } else {
      const volToRestore = previousVolume > 0 ? previousVolume : 1;
      setVolume(volToRestore);
      if (audioRef.current) audioRef.current.volume = volToRestore;
    }
  };

  const isHome = location.pathname === '/';
  const isMixtapes = location.pathname === '/mixtapes';

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col bg-background text-foreground">
      {/* Background Audio */}
      <audio 
        ref={audioRef} 
        loop={!currentTrack}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={currentTrack ? handleEnded : undefined}
        src={currentTrack?.url || "/musics/default-lofi.mp3"}
      />

      {/* Global Navigation Bar */}
      <nav className={`absolute top-0 w-full z-50 flex flex-row items-center justify-between px-8 py-6 max-w-7xl mx-auto left-1/2 -translate-x-1/2`}>
        {/* Left Side: Logo */}
        <div className="flex-1 flex justify-start">
          <Link to="/" style={{ fontFamily: "'Lora', serif" }} className="text-3xl tracking-tight text-foreground">
            Savagers.
          </Link>
        </div>
        
        {/* Center: Navigation Links */}
        <ul className="hidden md:flex items-center justify-center gap-8 flex-none">
          <li><Link to="/" className={`text-sm transition-colors hover:text-foreground ${isHome ? 'text-foreground' : 'text-muted-foreground'}`}>Home</Link></li>
          <li><Link to="/mixtapes" className={`text-sm transition-colors hover:text-foreground ${isMixtapes ? 'text-foreground' : 'text-muted-foreground'}`}>Mixtapes</Link></li>
          <li><Link to="/journal" className={`text-sm transition-colors hover:text-foreground ${location.pathname === '/journal' ? 'text-foreground' : 'text-muted-foreground'}`}>Journal</Link></li>
          <li><a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">About</a></li>
        </ul>

        {/* Right Side: CTA + Music Toggle */}
        <div className="flex-1 flex items-center justify-end gap-4">
          {isHome && (
            <>
              <button 
                onClick={togglePlay}
                className="text-foreground hover:text-muted-foreground transition-colors cursor-pointer flex items-center justify-center"
                aria-label="Toggle ambient sound"
              >
                {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              
              <button onClick={togglePlay} className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03] cursor-pointer">
                {isPlaying ? 'Pause' : 'Tune In'}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <div className="flex-1 flex flex-col relative w-full h-full overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home isPlaying={isPlaying} togglePlay={togglePlay} />} />
          <Route path="/mixtapes" element={<Mixtapes currentTrack={currentTrack} isPlaying={isPlaying} onPlayTrack={handlePlayTrack} />} />
          <Route path="/journal" element={<Journal />} />
        </Routes>
      </div>

      {/* Global Music Player Bar */}
      {currentTrack && isMixtapes && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-3xl z-50 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between animate-[fade-rise_0.3s_ease-out] shadow-2xl">
          {/* Track Info */}
          <div className="flex items-center gap-4 w-1/3">
            <div className="w-12 h-12 rounded bg-muted/50 flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <Disc3 size={20} className={`text-muted-foreground ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
            </div>
            <div>
              <h4 className="text-foreground text-sm font-medium">{currentTrack.name}</h4>
              <p className="text-muted-foreground text-xs">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center justify-center w-1/3 gap-2">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsShuffle(!isShuffle)}
                className={`transition-colors cursor-pointer ${isShuffle ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="Shuffle"
              >
                <Shuffle size={16} />
              </button>
              
              <button onClick={playPrev} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <SkipBack size={20} />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
              >
                {isPlaying ? <Pause fill="currentColor" size={18} /> : <Play fill="currentColor" size={18} className="ml-1" />}
              </button>
              
              <button onClick={playNext} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <SkipForward size={20} />
              </button>

              <button 
                onClick={toggleRepeatMode}
                className={`transition-colors cursor-pointer ${repeatMode !== 'none' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title="Repeat"
              >
                {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
              </button>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-end w-1/3 gap-3">
            <button onClick={toggleMute} className="cursor-pointer transition-colors flex items-center">
              {volume === 0 ? <VolumeX size={16} className="text-muted-foreground hover:text-foreground transition-colors" /> : <Volume2 size={16} className="text-muted-foreground hover:text-foreground transition-colors" />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-transparent rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-transform"
              style={{
                background: `linear-gradient(to right, hsl(var(--foreground)) ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
