import { Suspense, lazy, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, Disc3, Shuffle, Repeat, Repeat1, MessageCircle } from 'lucide-react';
import FloatingNotes from './components/FloatingNotes';
import notesData from './data/notes.json';
import { useAudioPlayer } from './hooks/useAudioPlayer';

const Home = lazy(() => import('./pages/Home'));
const Mixtapes = lazy(() => import('./pages/Mixtapes'));
const Journal = lazy(() => import('./pages/Journal'));
const About = lazy(() => import('./pages/About'));

function Layout() {
  const isZenMode = false;
  const [showWhispers, setShowWhispers] = useState(() => {
    const saved = localStorage.getItem('savagers_showWhispers');
    if (saved === null) return true;
    try {
      return JSON.parse(saved);
    } catch {
      return true;
    }
  });
  const [customNotes, setCustomNotes] = useState<string[]>(() => {
    const saved = localStorage.getItem('savagers_notes');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allNotes = useMemo(() => [...notesData, ...customNotes], [customNotes]);
  const location = useLocation();

  const {
    audioRef,
    isPlaying,
    currentTrack,
    isShuffle,
    repeatMode,
    volume,
    setIsPlaying,
    setIsShuffle,
    togglePlay,
    handlePlayTrack,
    playNext,
    playPrev,
    handleEnded,
    toggleRepeatMode,
    handleVolumeChange,
    toggleMute,
  } = useAudioPlayer();

  const handleAddNote = (note: string) => {
    const newNotes = [...customNotes, note];
    setCustomNotes(newNotes);
    localStorage.setItem('savagers_notes', JSON.stringify(newNotes));
  };

  const isHome = location.pathname === '/';
  const isMixtapes = location.pathname === '/mixtapes';
  const routeFallback = <div className="min-h-screen w-full" />;

  const toggleWhispers = () => {
    const nextValue = !showWhispers;
    setShowWhispers(nextValue);
    localStorage.setItem('savagers_showWhispers', JSON.stringify(nextValue));
  };

  return (
    <div className={`relative min-h-screen w-full flex flex-col text-foreground ${isZenMode ? '' : 'bg-background'}`}>
      <audio
        ref={audioRef}
        loop={!currentTrack}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={currentTrack ? handleEnded : undefined}
        src={currentTrack?.url || '/musics/default-lofi.mp3'}
      />

      {showWhispers ? <FloatingNotes notes={allNotes} /> : null}

      <div className="flex-1 flex flex-col relative w-full min-h-screen">
        <nav className={`fixed top-4 left-4 right-4 z-50 grid min-h-[72px] grid-cols-[auto_1fr_auto] items-center gap-4 px-7 py-4 md:px-10 ${isHome ? 'max-w-[88rem]' : 'max-w-[72rem]'} mx-auto liquid-glass rounded-full transition-all duration-500 ${isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex min-w-[120px] md:min-w-[150px] justify-start">
            <Link to="/" className="text-3xl tracking-tight text-foreground font-display">
              Savagers.
            </Link>
          </div>

          <div className={`hidden md:flex items-center justify-center ${isHome ? 'gap-8 lg:gap-9' : 'gap-7 lg:gap-8'}`}>
            <Link to="/" className={`text-sm transition-colors hover:text-foreground ${isHome ? 'text-foreground' : 'text-muted-foreground'}`}>Home</Link>
            <Link to="/mixtapes" className={`text-sm transition-colors hover:text-foreground ${isMixtapes ? 'text-foreground' : 'text-muted-foreground'}`}>Frequencies</Link>
            <Link to="/journal" className={`text-sm transition-colors hover:text-foreground ${location.pathname === '/journal' ? 'text-foreground' : 'text-muted-foreground'}`}>Chronicles</Link>
            <Link to="/about" className={`text-sm transition-colors hover:text-foreground ${location.pathname === '/about' ? 'text-foreground' : 'text-muted-foreground'}`}>About</Link>
            <button
              onClick={toggleWhispers}
              className={`liquid-glass liquid-glass-interactive rounded-full px-4 py-2.5 text-sm cursor-pointer flex min-w-[112px] items-center justify-center gap-2 ${showWhispers ? 'liquid-glass-active text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title={showWhispers ? 'Hide ambient notes' : 'Show ambient notes'}
              aria-label={showWhispers ? 'Hide ambient notes' : 'Show ambient notes'}
            >
              <MessageCircle size={17} />
              <span>{showWhispers ? 'Notes On' : 'Notes Off'}</span>
            </button>
          </div>

          <div className={`flex min-w-0 items-center justify-end gap-2 ${isHome ? 'md:min-w-[150px]' : 'md:min-w-0'}`}>
            <div className="md:hidden">
              <button
                onClick={toggleWhispers}
                className={`liquid-glass liquid-glass-interactive rounded-full px-3 py-2 text-sm cursor-pointer flex h-10 w-10 items-center justify-center ${showWhispers ? 'liquid-glass-active text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                title={showWhispers ? 'Hide ambient notes' : 'Show ambient notes'}
                aria-label={showWhispers ? 'Hide ambient notes' : 'Show ambient notes'}
              >
                <MessageCircle size={17} />
              </button>
            </div>

            {isHome ? (
              <>
                <button onClick={togglePlay} className="liquid-glass liquid-glass-interactive rounded-full px-5 py-2.5 text-sm text-foreground cursor-pointer min-w-[92px]">
                  {isPlaying ? 'Pause' : 'Tune In'}
                </button>
              <button onClick={togglePlay} className="text-foreground hover:text-muted-foreground transition-colors cursor-pointer flex h-10 w-10 items-center justify-center" aria-label="Toggle ambient sound">
                {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              </>
            ) : null}
          </div>
        </nav>

        <Suspense fallback={routeFallback}>
          <Routes>
            <Route path="/" element={<Home isPlaying={isPlaying} togglePlay={togglePlay} isZenMode={isZenMode} />} />
            <Route path="/mixtapes" element={<Mixtapes currentTrack={currentTrack} isPlaying={isPlaying} onPlayTrack={handlePlayTrack} isZenMode={isZenMode} />} />
            <Route path="/journal" element={<Journal isZenMode={isZenMode} />} />
            <Route path="/about" element={<About onAddNote={handleAddNote} isZenMode={isZenMode} />} />
          </Routes>
        </Suspense>
      </div>

      {currentTrack && isMixtapes && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-3xl z-50 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between animate-fade-rise-center shadow-2xl transition-opacity duration-1000 ${isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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

          <div className="flex flex-col items-center justify-center w-1/3 gap-2">
            <div className="flex items-center gap-6">
              <button onClick={() => setIsShuffle(!isShuffle)} className={`transition-colors cursor-pointer ${isShuffle ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`} title="Shuffle">
                <Shuffle size={16} />
              </button>

              <button onClick={playPrev} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <SkipBack size={20} />
              </button>

              <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                <span className="flex h-[18px] w-[18px] items-center justify-center">
                  {isPlaying ? <Pause fill="currentColor" size={18} /> : <Play fill="currentColor" size={18} className="translate-x-px" />}
                </span>
              </button>

              <button onClick={playNext} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <SkipForward size={20} />
              </button>

              <button onClick={toggleRepeatMode} className={`transition-colors cursor-pointer ${repeatMode !== 'none' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`} title="Repeat">
                {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
              </button>
            </div>
          </div>

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
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
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
