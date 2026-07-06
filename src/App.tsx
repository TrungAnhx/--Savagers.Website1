import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Disc3,
  Home as HomeIcon,
  Info,
  MessageCircle,
  Pause,
  Play,
  Radio,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import notesData from './data/notes.json';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { getStoredItem, setStoredItem } from './utils/storage';

const FloatingNotes = lazy(() => import('./components/FloatingNotes'));
const Home = lazy(() => import('./pages/Home'));
const Mixtapes = lazy(() => import('./pages/Mixtapes'));
const Journal = lazy(() => import('./pages/Journal'));
const About = lazy(() => import('./pages/About'));
const Status = lazy(() => import('./pages/Status'));

function Layout() {
  const isZenMode = false;
  const [showWhispers, setShowWhispers] = useState(() => {
    const saved = getStoredItem('savagers_showWhispers');
    if (saved === null) return true;
    try {
      const parsed = JSON.parse(saved);
      return typeof parsed === 'boolean' ? parsed : true;
    } catch {
      return true;
    }
  });
  const [customNotes, setCustomNotes] = useState<string[]>(() => {
    const saved = getStoredItem('savagers_notes');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter((note): note is string => typeof note === 'string') : [];
    } catch {
      return [];
    }
  });

  const allNotes = useMemo(() => [...notesData, ...customNotes], [customNotes]);
  const location = useLocation();
  const isReadingArticle = /^\/journal\/[^/]+/.test(location.pathname);
  const [isChromeHidden, setIsChromeHidden] = useState(false);
  const chromeHiddenRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);

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
    setCustomNotes((currentNotes) => {
      const newNotes = [...currentNotes, note];
      setStoredItem('savagers_notes', JSON.stringify(newNotes));
      return newNotes;
    });
  };

  const isHome = location.pathname === '/';
  const isMixtapes = location.pathname === '/mixtapes';
  const routeFallback = <div className="min-h-screen w-full" />;
  const mobileNavItems = [
    { to: '/', label: 'Home', icon: HomeIcon, active: isHome },
    { to: '/mixtapes', label: 'Music', icon: Radio, active: isMixtapes },
    { to: '/journal', label: 'Read', icon: BookOpen, active: location.pathname.startsWith('/journal') },
    { to: '/about', label: 'About', icon: Info, active: location.pathname === '/about' },
  ];

  const toggleWhispers = () => {
    const nextValue = !showWhispers;
    setShowWhispers(nextValue);
    setStoredItem('savagers_showWhispers', JSON.stringify(nextValue));
  };

  const revealChrome = () => {
    if (!chromeHiddenRef.current) return;
    chromeHiddenRef.current = false;
    setIsChromeHidden(false);
  };

  useEffect(() => {
    if (!isReadingArticle) {
      chromeHiddenRef.current = false;
      return;
    }

    lastScrollYRef.current = window.scrollY;
    let resetFrameId: number | null = null;

    if (window.scrollY < 120 && chromeHiddenRef.current) {
      chromeHiddenRef.current = false;
      resetFrameId = window.requestAnimationFrame(() => {
        setIsChromeHidden(false);
      });
    }

    const updateChromeHidden = (nextHidden: boolean) => {
      if (chromeHiddenRef.current === nextHidden) return;
      chromeHiddenRef.current = nextHidden;
      setIsChromeHidden(nextHidden);
    };

    const handleScroll = () => {
      if (scrollFrameRef.current !== null) return;

      scrollFrameRef.current = window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollYRef.current;

        if (currentScrollY < 120 || scrollDelta < -8) {
          updateChromeHidden(false);
        } else if (scrollDelta > 8 && currentScrollY > 220) {
          updateChromeHidden(true);
        }

        lastScrollYRef.current = currentScrollY;
        scrollFrameRef.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (resetFrameId !== null) {
        window.cancelAnimationFrame(resetFrameId);
      }
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
  }, [isReadingArticle]);

  const effectiveChromeHidden = isReadingArticle && isChromeHidden;
  const topNavVisibilityClass = isZenMode
    ? 'opacity-0 pointer-events-none -translate-y-6'
    : effectiveChromeHidden
      ? 'opacity-0 pointer-events-none -translate-y-[calc(100%+1.25rem)]'
      : 'opacity-100 translate-y-0';

  const bottomNavVisibilityClass = isZenMode
    ? 'opacity-0 pointer-events-none translate-y-6'
    : effectiveChromeHidden
      ? 'opacity-0 pointer-events-none translate-y-24'
      : 'opacity-100 translate-y-0';

  return (
    <div className={`relative min-h-screen w-full flex flex-col text-foreground ${isZenMode ? '' : 'bg-background'}`}>
      <audio
        ref={audioRef}
        loop={!currentTrack}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={currentTrack ? handleEnded : undefined}
        src={currentTrack?.url || '/musics/default-lofi.mp3'}
      />

      {showWhispers ? (
        <Suspense fallback={null}>
          <FloatingNotes notes={allNotes} />
        </Suspense>
      ) : null}

      <div className="flex-1 flex flex-col relative w-full min-h-screen">
        {isReadingArticle ? (
          <div
            className={`fixed inset-x-0 top-0 z-[49] h-24 ${isChromeHidden && !isZenMode ? 'pointer-events-auto' : 'pointer-events-none'}`}
            onMouseEnter={revealChrome}
            aria-hidden="true"
          />
        ) : null}

        <nav
          className={`fixed left-3 right-3 top-3 z-50 mx-auto grid min-h-[56px] max-w-[88rem] grid-cols-[1fr_auto] items-center gap-2 rounded-full px-3 py-2 md:left-4 md:right-4 md:top-4 md:min-h-[72px] md:grid-cols-[minmax(9rem,1fr)_auto_minmax(9rem,1fr)] md:gap-4 md:px-10 md:py-4 liquid-glass transition-[opacity,transform,box-shadow,background] duration-500 ease-out ${topNavVisibilityClass}`}
          onMouseEnter={revealChrome}
          onFocusCapture={revealChrome}
        >
          <div className="flex min-w-0 justify-start">
            <Link to="/" className="font-display text-xl text-foreground sm:text-2xl md:text-3xl">
              Savagers.
            </Link>
          </div>

          <div className="hidden items-center justify-center gap-6 md:flex lg:gap-8">
            <Link to="/" className={`text-sm transition-colors hover:text-foreground ${isHome ? 'text-foreground' : 'text-muted-foreground'}`}>Home</Link>
            <Link to="/mixtapes" className={`text-sm transition-colors hover:text-foreground ${isMixtapes ? 'text-foreground' : 'text-muted-foreground'}`}>Frequencies</Link>
            <Link to="/journal" className={`text-sm transition-colors hover:text-foreground ${location.pathname.startsWith('/journal') ? 'text-foreground' : 'text-muted-foreground'}`}>Chronicles</Link>
            <Link to="/about" className={`text-sm transition-colors hover:text-foreground ${location.pathname === '/about' ? 'text-foreground' : 'text-muted-foreground'}`}>About</Link>
          </div>

          <div className="flex min-w-0 items-center justify-end gap-2 md:gap-2.5 lg:gap-3">
            <button
              onClick={toggleWhispers}
              className={`liquid-glass liquid-glass-interactive hidden rounded-full px-4 py-2.5 text-sm cursor-pointer md:flex min-w-[116px] items-center justify-center gap-2 ${showWhispers ? 'liquid-glass-active text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title={showWhispers ? 'Hide ambient notes' : 'Show ambient notes'}
              aria-label={showWhispers ? 'Hide ambient notes' : 'Show ambient notes'}
            >
              <MessageCircle size={17} />
              <span>{showWhispers ? 'Notes On' : 'Notes Off'}</span>
            </button>

            <button
              onClick={toggleWhispers}
              className={`liquid-glass liquid-glass-interactive rounded-full px-3 py-2 text-sm cursor-pointer flex h-10 w-10 items-center justify-center md:hidden ${showWhispers ? 'liquid-glass-active text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title={showWhispers ? 'Hide ambient notes' : 'Show ambient notes'}
              aria-label={showWhispers ? 'Hide ambient notes' : 'Show ambient notes'}
            >
              <MessageCircle size={17} />
            </button>

            {isHome ? (
              <>
                <button onClick={togglePlay} className="liquid-glass liquid-glass-interactive hidden rounded-full px-5 py-2.5 text-sm text-foreground cursor-pointer min-w-[92px] md:flex md:items-center md:justify-center">
                  {isPlaying ? 'Pause' : 'Tune In'}
                </button>
                <button onClick={togglePlay} className="liquid-glass liquid-glass-interactive text-foreground hover:text-muted-foreground transition-colors cursor-pointer flex h-10 w-10 items-center justify-center rounded-full" aria-label="Toggle ambient sound">
                  {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
              </>
            ) : null}
          </div>
        </nav>

        <nav
          className={`fixed left-3 right-3 z-50 grid grid-cols-4 gap-1 rounded-full px-2 py-2 md:hidden liquid-glass transition-[opacity,transform] duration-500 ease-out ${bottomNavVisibilityClass}`}
          style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
          aria-label="Mobile navigation"
        >
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex min-h-[48px] min-w-0 flex-col items-center justify-center gap-1 rounded-full px-1 text-[10px] transition-colors ${
                  item.active ? 'liquid-glass-active text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-current={item.active ? 'page' : undefined}
              >
                <Icon size={18} />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Suspense fallback={routeFallback}>
          <Routes>
            <Route path="/" element={<Home isZenMode={isZenMode} />} />
            <Route path="/mixtapes" element={<Mixtapes currentTrack={currentTrack} isPlaying={isPlaying} onPlayTrack={handlePlayTrack} isZenMode={isZenMode} />} />
            <Route path="/journal" element={<Journal isZenMode={isZenMode} />} />
            <Route path="/journal/:articleId" element={<Journal isZenMode={isZenMode} />} />
            <Route path="/status" element={<Status isZenMode={isZenMode} />} />
            <Route path="/about" element={<About onAddNote={handleAddNote} isZenMode={isZenMode} />} />
          </Routes>
        </Suspense>
      </div>

      {currentTrack && isMixtapes && (
        <div className={`fixed bottom-28 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-3xl z-40 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-5 py-4 flex flex-col gap-4 items-stretch justify-between animate-fade-rise-center shadow-2xl transition-opacity duration-1000 md:bottom-8 md:z-50 md:w-[calc(100%-3rem)] md:flex-row md:items-center md:gap-0 md:rounded-2xl md:px-6 ${isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex items-center gap-4 md:w-1/3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-muted/50">
              {currentTrack.cover ? <img src={currentTrack.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" /> : null}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <Disc3 size={20} className={`relative text-muted-foreground ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
            </div>
            <div>
              <h4 className="text-foreground text-sm font-medium">{currentTrack.name}</h4>
              <p className="text-muted-foreground text-xs">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 md:w-1/3">
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

          <div className="hidden items-center justify-end gap-3 md:flex md:w-1/3">
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
