import { useCallback, useEffect, useRef, useState } from 'react';

export interface Track {
  name: string;
  duration: string;
  artist: string;
  url: string;
}

type RepeatMode = 'none' | 'all' | 'one';

function readBool(key: string, fallback: boolean): boolean {
  const saved = localStorage.getItem(key);
  if (saved === null) return fallback;
  try {
    return JSON.parse(saved);
  } catch {
    return fallback;
  }
}

function readNumber(key: string, fallback: number): number {
  const saved = localStorage.getItem(key);
  if (saved === null) return fallback;
  const n = parseFloat(saved);
  return Number.isFinite(n) ? n : fallback;
}

function readRepeatMode(key: string, fallback: RepeatMode): RepeatMode {
  const saved = localStorage.getItem(key);
  if (saved === null) return fallback;
  try {
    const parsed = JSON.parse(saved);
    return parsed === 'none' || parsed === 'all' || parsed === 'one' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [isShuffle, setIsShuffle] = useState(() => readBool('savagers_isShuffle', false));
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(() => readRepeatMode('savagers_repeatMode', 'none'));
  const [volume, setVolume] = useState(() => readNumber('savagers_volume', 0.75));
  const [previousVolume, setPreviousVolume] = useState(() => readNumber('savagers_previousVolume', 0.75));
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    localStorage.setItem('savagers_isShuffle', JSON.stringify(isShuffle));
  }, [isShuffle]);
  useEffect(() => {
    localStorage.setItem('savagers_repeatMode', JSON.stringify(repeatMode));
  }, [repeatMode]);
  useEffect(() => {
    localStorage.setItem('savagers_volume', volume.toString());
  }, [volume]);
  useEffect(() => {
    localStorage.setItem('savagers_previousVolume', previousVolume.toString());
  }, [previousVolume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;
    audioRef.current.play().catch(() => setIsPlaying(false));
  }, [currentTrack]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      return;
    }
    setIsPlaying(true);
  }, [isPlaying]);

  const handlePlayTrack = useCallback((track: Track, newPlaylist: Track[]) => {
    if (currentTrack?.name === track.name) {
      togglePlay();
      return;
    }
    setPlaylist(newPlaylist);
    setCurrentTrack(track);
  }, [currentTrack?.name, togglePlay]);

  const playNext = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;

    if (isShuffle) {
      setCurrentTrack(playlist[Math.floor(Math.random() * playlist.length)]);
      return;
    }

    const currentIndex = playlist.findIndex((t) => t.name === currentTrack.name);
    if (currentIndex === -1) return;

    if (currentIndex === playlist.length - 1) {
      if (repeatMode === 'all') setCurrentTrack(playlist[0]);
      else setIsPlaying(false);
      return;
    }

    setCurrentTrack(playlist[currentIndex + 1]);
  }, [currentTrack, isShuffle, playlist, repeatMode]);

  const playPrev = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;

    if (isShuffle) {
      setCurrentTrack(playlist[Math.floor(Math.random() * playlist.length)]);
      return;
    }

    const currentIndex = playlist.findIndex((t) => t.name === currentTrack.name);
    if (currentIndex === -1) return;
    setCurrentTrack(currentIndex === 0 ? playlist[playlist.length - 1] : playlist[currentIndex - 1]);
  }, [currentTrack, isShuffle, playlist]);

  const handleEnded = useCallback(() => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => setIsPlaying(false));
      return;
    }
    const currentIndex = playlist.findIndex((t) => t.name === currentTrack?.name);
    if (repeatMode === 'none' && currentIndex === playlist.length - 1 && !isShuffle) {
      setIsPlaying(false);
      return;
    }
    playNext();
  }, [currentTrack?.name, isShuffle, playNext, playlist, repeatMode]);

  const toggleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => (prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none'));
  }, []);

  const handleVolumeChange = useCallback((nextVolume: number) => {
    setVolume(nextVolume);
    if (nextVolume > 0) setPreviousVolume(nextVolume);
    if (audioRef.current) audioRef.current.volume = nextVolume;
  }, []);

  const toggleMute = useCallback(() => {
    if (volume > 0) {
      setVolume(0);
      if (audioRef.current) audioRef.current.volume = 0;
      return;
    }
    const restored = previousVolume > 0 ? previousVolume : 1;
    setVolume(restored);
    if (audioRef.current) audioRef.current.volume = restored;
  }, [previousVolume, volume]);

  return {
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
  };
}
