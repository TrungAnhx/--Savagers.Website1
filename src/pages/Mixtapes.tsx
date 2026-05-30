import { Play, Disc3 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import AmbientVideo from '../components/AmbientVideo';
import type { Track } from '../hooks/useAudioPlayer';

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

const rawCategories = [
  {
    title: 'Global Covers & Hits',
    description: 'Timeless vocals and acoustic covers for deep focus.',
    tracks: [
      { name: "I'm Not The Only One", duration: '3:59', artist: 'Sam Smith', url: '/musics/track1.mp3' },
      { name: 'Patience', duration: '3:22', artist: 'Take That', url: '/musics/track2.mp3' },
      { name: 'Modern Loneliness', duration: '4:12', artist: 'Lauv (Alec Chambers Cover)', url: '/musics/track5.mp3' },
      { name: 'Be Happy', duration: '3:18', artist: "Dixie D'Amelio (Alec Chambers Cover)", url: '/musics/track6.mp3' },
    ]
  },
  {
    title: 'Vietnamese Vibes',
    description: 'Local lo-fi and R&B beats to chill out.',
    tracks: [
      { name: 'Hello Em Có Khỏe Không', duration: '3:45', artist: 'Dfoxie37 & Myhoa & Tuann', url: '/musics/track3.mp3' },
      { name: 'Think About U', duration: '3:10', artist: 'Kay Châu Anh', url: '/musics/track4.mp3' },
    ]
  },
  {
    title: 'Piano Covers',
    description: 'Soothing piano instrumentals for absolute silence.',
    tracks: [
      { name: 'Nơi Này Có Anh', duration: '4:20', artist: 'Sơn Tùng M-TP', url: '/musics/track7.mp3' },
      { name: 'Modern Loneliness', duration: '3:55', artist: 'Lauv (Keudae Cover)', url: '/musics/track8.mp3' },
      { name: 'Âm Thầm Bên Em', duration: '4:50', artist: 'Sơn Tùng M-TP', url: '/musics/track9.mp3' },
      { name: 'Xe Đạp', duration: '4:15', artist: 'Thùy Chi ft. M4U', url: '/musics/track10.mp3' },
    ]
  }
];

export default function Mixtapes({ currentTrack, isPlaying, onPlayTrack }: MixtapesProps) {
  const [bgIndex, setBgIndex] = useState(() => Math.floor(Math.random() * backgroundVideos.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundVideos.length);
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const currentBg = backgroundVideos[bgIndex];

  const { sortedCategories, fullPlaylist } = useMemo(() => {
    const sorted = rawCategories.map((cat) => ({
      ...cat,
      tracks: [...cat.tracks].sort((a, b) => a.name.localeCompare(b.name))
    }));
    const playlist = sorted.flatMap((cat) => cat.tracks);
    return { sortedCategories: sorted, fullPlaylist: playlist };
  }, []);

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
          {sortedCategories.map((category, idx) => (
            <section key={category.title} className={`animate-fade-rise-delay-${idx + 1}`}>
              <div className="border-b border-border/40 pb-6 mb-8">
                <h2 className="text-3xl font-semibold text-foreground mb-2 flex items-center gap-3" style={{ fontFamily: "'Noto Serif Display', serif" }}>
                  <Disc3 className="text-muted-foreground" size={24} />
                  {category.title}
                </h2>
                <p className="text-muted-foreground text-sm">{category.description}</p>
              </div>

              <div className="flex flex-col gap-2">
                {category.tracks.map((track, trackIdx) => {
                  const isCurrentTrack = currentTrack?.url === track.url;
                  return (
                    <div
                      key={track.url}
                      onClick={() => onPlayTrack(track, fullPlaylist)}
                      className={`group flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer ${isCurrentTrack ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex items-center gap-6">
                        {isCurrentTrack && isPlaying ? (
                          <div className="w-6 flex justify-center items-end gap-[2px] h-4">
                            <span className="w-1 bg-foreground h-full animate-[bounce_1s_infinite]"></span>
                            <span className="w-1 bg-foreground h-2/3 animate-[bounce_1.2s_infinite_0.2s]"></span>
                            <span className="w-1 bg-foreground h-4/5 animate-[bounce_0.8s_infinite_0.4s]"></span>
                          </div>
                        ) : (
                          <span className={`text-sm font-mono w-6 text-center ${isCurrentTrack ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                            {trackIdx + 1}
                          </span>
                        )}

                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isCurrentTrack ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                          <Play size={14} className={`ml-0.5 ${isCurrentTrack ? 'text-foreground opacity-100' : 'text-foreground opacity-50 group-hover:opacity-100'}`} fill={isCurrentTrack ? 'currentColor' : 'none'} />
                        </div>
                        <div>
                          <h3 className={`text-base font-medium ${isCurrentTrack ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{track.name}</h3>
                          <p className="text-muted-foreground text-xs">{track.artist}</p>
                        </div>
                      </div>
                      <span className="text-muted-foreground text-sm font-mono">{track.duration}</span>
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
