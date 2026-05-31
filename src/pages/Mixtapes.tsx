import { Play, Disc3 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import AmbientVideo from '../components/AmbientVideo';
import type { Track } from '../hooks/useAudioPlayer';
import { useTracks } from '../hooks/useTracks';

interface MixtapesProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, playlist: Track[]) => void;
  isZenMode?: boolean;
}

const backgroundVideos = [
  '/backgrounds/bg1.mp4',
  '/backgrounds/bg2.mp4',
  '/backgrounds/bg3.mp4',
  '/backgrounds/bg4.mp4',
  '/backgrounds/bg5.mp4'
];

function totalDurationLabel(tracks: Track[]) {
  const seconds = tracks.reduce((total, track) => {
    const [minutes, remainder] = track.duration.split(':').map(Number);
    return total + (Number.isFinite(minutes) ? minutes * 60 : 0) + (Number.isFinite(remainder) ? remainder : 0);
  }, 0);
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}

export default function Mixtapes({ currentTrack, isPlaying, onPlayTrack }: MixtapesProps) {
  const [bgIndex, setBgIndex] = useState(() => Math.floor(Math.random() * backgroundVideos.length));
  const { categories, isLoading, error } = useTracks();

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundVideos.length);
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const currentBg = backgroundVideos[bgIndex];

  const { sortedCategories, fullPlaylist } = useMemo(() => {
    const sorted = categories.map((cat) => ({
      ...cat,
      tracks: [...cat.tracks].sort((a, b) => a.name.localeCompare(b.name))
    }));
    return { sortedCategories: sorted, fullPlaylist: sorted.flatMap((category) => category.tracks) };
  }, [categories]);

  return (
    <div className="relative min-h-screen w-full flex flex-col pt-32 pb-40 px-6">
      <AmbientVideo
        src={currentBg}
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-80 pointer-events-none"
        opacityClassName="fixed inset-0 bg-gradient-to-b from-background/90 via-background/40 to-background/90 z-0 pointer-events-none"
      />

      <div className="max-w-4xl mx-auto relative z-10 w-full">
        <header className="mb-20 animate-fade-rise">
          <h1 className="text-6xl md:text-8xl font-semibold text-foreground mb-6" style={{ fontFamily: "'Noto Serif Display', serif" }}>
            The Archives.
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
            Curated frequencies divided by mood and atmosphere. Select a tape, disappear into the sound.
          </p>
        </header>

        <div className="space-y-24">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          ) : null}

          {!isLoading && error ? (
            <p className="py-12 text-muted-foreground italic">Could not load the frequencies right now.</p>
          ) : null}

          {sortedCategories.map((category, idx) => (
            <section key={category.title} className={`animate-fade-rise-delay-${idx + 1}`}>
              <div className="mb-8 flex items-end justify-between gap-5 border-b border-border/40 pb-6">
                <div>
                  <h2 className="mb-2 flex items-center gap-3 text-3xl font-semibold text-foreground" style={{ fontFamily: "'Noto Serif Display', serif" }}>
                    <Disc3 className="text-muted-foreground" size={24} />
                    {category.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <span className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:block">
                  {category.tracks.length} tracks / {totalDurationLabel(category.tracks)}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {category.tracks.map((track, trackIdx) => {
                  const isCurrentTrack = currentTrack?.url === track.url;
                  return (
                    <div
                      key={track.url}
                      onClick={() => onPlayTrack(track, fullPlaylist)}
                      className={`group flex cursor-pointer items-center justify-between gap-3 rounded-lg p-3 transition-colors sm:p-4 ${isCurrentTrack ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                        {isCurrentTrack && isPlaying ? (
                          <div className="hidden h-4 w-6 items-end justify-center gap-[2px] sm:flex">
                            <span className="w-1 bg-foreground h-full animate-[bounce_1s_infinite]"></span>
                            <span className="w-1 bg-foreground h-2/3 animate-[bounce_1.2s_infinite_0.2s]"></span>
                            <span className="w-1 bg-foreground h-4/5 animate-[bounce_0.8s_infinite_0.4s]"></span>
                          </div>
                        ) : (
                          <span className={`hidden w-6 text-center font-mono text-sm sm:block ${isCurrentTrack ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                            {trackIdx + 1}
                          </span>
                        )}

                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/5 sm:h-12 sm:w-12">
                          <img src={track.cover || category.cover} alt="" className="h-full w-full object-cover opacity-45 transition-opacity group-hover:opacity-30" />
                          <Play size={14} className={`absolute ml-0.5 ${isCurrentTrack ? 'text-foreground opacity-100' : 'text-foreground opacity-70 group-hover:opacity-100'}`} fill={isCurrentTrack ? 'currentColor' : 'none'} />
                        </div>
                        <div className="min-w-0">
                          <h3 className={`truncate text-sm font-medium sm:text-base ${isCurrentTrack ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{track.name}</h3>
                          <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                        </div>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground sm:text-sm">{track.duration}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
