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
        <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 min-h-screen">
        <h1 
          className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Where <em className="not-italic text-muted-foreground">dreams</em> rise <em className="not-italic text-muted-foreground">through the silence.</em>
        </h1>
        
        <p className="animate-fade-rise-delay text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed">
          We're designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos, we build digital spaces for sharp focus and inspired work.
        </p>
        
        <button 
          onClick={() => {
            document.getElementById('featured-journal')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="animate-fade-rise-delay-2 liquid-glass rounded-full px-14 py-5 text-base text-foreground mt-12 hover:scale-[1.03] cursor-pointer inline-block"
        >
          Begin Journey
        </button>
        <button onClick={togglePlay} className="mt-4 text-muted-foreground hover:text-foreground transition-colors text-sm opacity-0 absolute">
          {isPlaying ? 'Playing' : 'Paused'}
        </button>
      </section>

      {/* Featured Journal Section */}
      <section id="featured-journal" className="relative z-10 w-full overflow-hidden px-6 py-32">
        <div className="absolute inset-0 bg-background/72 backdrop-blur-[2px]" />
        <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <h2 className="text-4xl md:text-6xl text-foreground mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Featured Today.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              One tech signal, one life signal, one debate signal. A calmer way to enter the archive.
            </p>
          </div>
          <Link to="/journal" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
            View All Chronicles <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading && Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="liquid-glass rounded-2xl p-8 min-h-[320px] animate-pulse"
            />
          ))}

          {!isLoading && featuredArticles.map((entry, idx) => (
            <article 
              key={entry.article.id} 
              className="group cursor-pointer liquid-glass liquid-glass-interactive rounded-2xl p-8 flex flex-col animate-[fade-rise_0.6s_ease-out]"
              style={{ animationDelay: `${idx * 0.15}s`, animationFillMode: 'both' }}
              onClick={() => {
                navigate('/journal', { state: { articleId: entry.article.id } });
              }}
            >
              <span className="text-[11px] uppercase tracking-[0.24em] text-primary mb-5 font-mono">
                {entry.label}
              </span>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-mono mb-6">
                <span className="flex items-center gap-1"><Calendar size={12} /> {entry.article.date}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {entry.article.readTime}</span>
              </div>
              
              <h3 className="text-2xl text-foreground mb-4 group-hover:text-primary/80 transition-colors flex-1" style={{ fontFamily: "'Instrument Serif', serif" }}>
                {entry.article.title}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 line-clamp-3">
                {entry.article.excerpt}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {entry.article.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-3 py-1 rounded-full border border-border/50 text-muted-foreground">
                    {displayTagLabel(tag)}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        {!isLoading && articles.length > 0 && (
          <div className="mt-16 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>{articles.length} articles live in the archive</span>
            <span className="hidden md:inline text-border">/</span>
            <span>Runtime-loaded to keep the app lighter</span>
            <span className="hidden md:inline text-border">/</span>
            <span>Archive capped at 100 posts</span>
          </div>
        )}
        </div>
      </section>
      </div>
    </div>
  );
}
