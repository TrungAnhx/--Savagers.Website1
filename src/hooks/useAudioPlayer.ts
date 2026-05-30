import { useCallback, useEffect, useRef, useState } from 'react';
import { getStoredItem, setStoredItem } from '../utils/storage';

export interface Track {
  name: string;
  duration: string;
  artist: string;
  url: string;
}

type RepeatMode = 'none' | 'all' | 'one';

function readBool(key: string, fallback: boolean): boolean {
  const saved = getStoredItem(key);
  if (saved === null) return fallback;
  try {
    const parsed = JSON.parse(saved);
    return typeof parsed === 'boolean' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, value));
}

function readNumber(key: string, fallback: number): number {
  const saved = getStoredItem(key);
  if (saved === null) return fallback;
  const n = parseFloat(saved);
  return Number.isFinite(n) ? clampVolume(n) : fallback;
}

function readRepeatMode(key: string, fallback: RepeatMode): RepeatMode {
  const saved = getStoredItem(key);
  if (saved === null) return fallback;
  try {
    const parsed = JSON.parse(saved);
    return parsed === 'none' || parsed === 'all' || parsed === 'one' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function findTrackIndex(playlist: Track[], track: Track | null) {
  if (!track) return -1;
  return playlist.findIndex((item) => item.url === track.url);
}

function pickShuffledTrack(playlist: Track[], currentTrack: Track | null) {
  if (playlist.length === 0) return null;
  if (playlist.length <= 1) return playlist[0];
  const candidates = playlist.filter((track) => track.url !== currentTrack?.url);
  return candidates[Math.floor(Math.random() * candidates.length)];
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
    setStoredItem('savagers_isShuffle', JSON.stringify(isShuffle));
  }, [isShuffle]);
  useEffect(() => {
    setStoredItem('savagers_repeatMode', JSON.stringify(repeatMode));
  }, [repeatMode]);
  useEffect(() => {
    setStoredItem('savagers_volume', volume.toString());
  }, [volume]);
  useEffect(() => {
    setStoredItem('savagers_previousVolume', previousVolume.toString());
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
    if (currentTrack?.url === track.url) {
      togglePlay();
      return;
    }
    setPlaylist(newPlaylist);
    setCurrentTrack(track);
  }, [currentTrack?.url, togglePlay]);

  const playNext = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;

    if (isShuffle) {
      setCurrentTrack(pickShuffledTrack(playlist, currentTrack));
      return;
    }

    const currentIndex = findTrackIndex(playlist, currentTrack);
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
      setCurrentTrack(pickShuffledTrack(playlist, currentTrack));
      return;
    }

    const currentIndex = findTrackIndex(playlist, currentTrack);
    if (currentIndex === -1) return;
    setCurrentTrack(currentIndex === 0 ? playlist[playlist.length - 1] : playlist[currentIndex - 1]);
  }, [currentTrack, isShuffle, playlist]);

  const handleEnded = useCallback(() => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => setIsPlaying(false));
      return;
    }
    const currentIndex = findTrackIndex(playlist, currentTrack);
    if (repeatMode === 'none' && currentIndex === playlist.length - 1 && !isShuffle) {
      setIsPlaying(false);
      return;
    }
    playNext();
  }, [currentTrack, isShuffle, playNext, playlist, repeatMode]);

  const toggleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => (prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none'));
  }, []);

  const handleVolumeChange = useCallback((nextVolume: number) => {
    const normalizedVolume = clampVolume(nextVolume);
    setVolume(normalizedVolume);
    if (normalizedVolume > 0) setPreviousVolume(normalizedVolume);
    if (audioRef.current) audioRef.current.volume = normalizedVolume;
  }, []);

  const toggleMute = useCallback(() => {
    if (volume > 0) {
      setVolume(0);
      if (audioRef.current) audioRef.current.volume = 0;
      return;
    }
    const restored = previousVolume > 0 ? clampVolume(previousVolume) : 1;
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
