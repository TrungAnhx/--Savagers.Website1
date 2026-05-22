import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import AmbientVideo from '../components/AmbientVideo';
import { useArticles } from '../hooks/useArticles';
import { displayTagLabel, getFeaturedTodayArticles } from '../utils/articles';

interface HomeProps {
  isPlaying: boolean;
  togglePlay: () => void;
  isZenMode?: boolean;
}

export default function Home({ isPlaying, togglePlay, isZenMode }: HomeProps) {
  const navigate = useNavigate();
  const { articles, isLoading } = useArticles();
  const featuredArticles = getFeaturedTodayArticles(articles);

  return (
    <div className="relative min-h-screen w-full flex flex-col flex-1">
      {/* Fixed Video Background so it stays while scrolling */}
      <AmbientVideo
        src="/backgrounds/home_bg_4k.mp4"
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      <div className={`relative z-10 flex-1 flex flex-col transition-opacity duration-1000 ${isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Hero Section (Full Screen) */}
        <section className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-5 pb-28 pt-32 text-center sm:px-6 md:min-h-screen md:pb-24 md:pt-36">
          <h1
            className="animate-fade-rise max-w-[12ch] text-[2.9rem] font-semibold leading-[1.05] text-foreground sm:max-w-4xl sm:text-7xl md:max-w-7xl md:text-8xl"
            style={{ fontFamily: "'Noto Serif Display', serif" }}
          >
            Where <em className="not-italic text-muted-foreground">dreams</em> rise <em className="not-italic text-muted-foreground">through the silence.</em>
          </h1>

          <p className="animate-fade-rise-delay mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-8 sm:text-base md:text-lg">
            We're designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos, we build digital spaces for sharp focus and inspired work.
          </p>

          <button
            onClick={() => {
              document.getElementById('featured-journal')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="animate-fade-rise-delay-2 liquid-glass mt-9 inline-block rounded-full px-8 py-4 text-sm text-foreground hover:scale-[1.03] cursor-pointer sm:mt-12 sm:px-14 sm:py-5 sm:text-base"
          >
            Begin Journey
          </button>
          <button onClick={togglePlay} className="absolute mt-4 text-sm text-muted-foreground opacity-0 transition-colors hover:text-foreground">
            {isPlaying ? 'Playing' : 'Paused'}
          </button>
        </section>

      {/* Featured Journal Section */}
      <section id="featured-journal" className="relative z-10 w-full overflow-hidden px-4 py-24 pb-36 sm:px-6 md:py-32">
        <div className="absolute inset-0 bg-background/72 backdrop-blur-[2px]" />
        <div className="relative max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end md:gap-8">
          <div>
            <h2 className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl md:text-6xl" style={{ fontFamily: "'Noto Serif Display', serif" }}>
              Featured Today.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              One tech signal, one life signal, one debate signal. A calmer way to enter the archive.
            </p>
          </div>
          <Link to="/journal" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
            View All Chronicles <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-8">
          {isLoading && Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="liquid-glass min-h-[260px] rounded-lg p-6 animate-pulse md:min-h-[320px] md:p-8"
            />
          ))}

          {!isLoading && featuredArticles.map((entry, idx) => (
            <article 
              key={entry.article.id} 
              className="group cursor-pointer liquid-glass liquid-glass-interactive rounded-lg p-6 flex flex-col animate-[fade-rise_0.6s_ease-out] md:p-8"
              style={{ animationDelay: `${idx * 0.15}s`, animationFillMode: 'both' }}
              onClick={() => {
                navigate(`/journal/${encodeURIComponent(entry.article.id)}`);
              }}
            >
              <span className="text-[11px] uppercase tracking-[0.24em] text-primary mb-5 font-mono">
                {entry.label}
              </span>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-mono mb-6">
                <span className="flex items-center gap-1"><Calendar size={12} /> {entry.article.date}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {entry.article.readTime}</span>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary/80 transition-colors flex-1 sm:text-2xl" style={{ fontFamily: "'Noto Serif Display', serif" }}>
                {entry.article.title}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 line-clamp-3">
                {entry.article.excerpt}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {entry.article.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 backdrop-blur-sm">
                    {displayTagLabel(tag)}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        {!isLoading && articles.length > 0 && (
          <div className="mt-12 liquid-glass rounded-lg px-5 py-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-white/78 w-fit max-w-full md:mt-16 md:rounded-full">
            <span className="whitespace-nowrap">
              Developed by Savagers<sup className="ml-0.5 text-[10px] leading-none">®</sup>
            </span>
            <span className="hidden md:inline text-white/35">/</span>
            <span className="whitespace-nowrap">Built for quiet focus</span>
            <span className="hidden md:inline text-white/35">/</span>
            <span className="whitespace-nowrap">Curated daily</span>
          </div>
        )}
        </div>
      </section>
      </div>
    </div>
  );
}
