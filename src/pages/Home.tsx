import { Link } from 'react-router-dom';

interface HomeProps {
  isPlaying: boolean;
  togglePlay: () => void;
}

export default function Home({ isPlaying, togglePlay }: HomeProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col flex-1">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/home_bg_4k.mp4" type="video/mp4" />
      </video>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 py-[90px] flex-1">
        <h1 
          className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal text-foreground"
          style={{ fontFamily: "'Lora', serif" }}
        >
          Where <em className="not-italic text-muted-foreground">melodies</em> fade <em className="not-italic text-muted-foreground">into the void.</em>
        </h1>
        
        <p className="animate-fade-rise-delay text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed">
          We curate soundscapes for deep thinkers, nocturnal creators, and quiet rebels. Amid the noise, we broadcast ambient rhythms for sharp focus and infinite chill.
        </p>
        
        <Link to="/mixtapes" className="animate-fade-rise-delay-2 liquid-glass rounded-full px-14 py-5 text-base text-foreground mt-12 hover:scale-[1.03] cursor-pointer inline-block">
          Explore Archives
        </Link>
        <button onClick={togglePlay} className="mt-4 text-muted-foreground hover:text-foreground transition-colors text-sm opacity-0 absolute">
          {isPlaying ? 'Playing' : 'Paused'}
        </button>
      </section>
    </div>
  );
}