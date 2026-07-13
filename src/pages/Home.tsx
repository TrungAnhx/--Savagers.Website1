import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import AmbientVideo from '../components/AmbientVideo';
import { useArticles } from '../hooks/useArticles';
import { displayTagLabel, getFeaturedTodayArticles } from '../utils/articles';

interface HomeProps {
  isZenMode?: boolean;
}

export default function Home({ isZenMode }: HomeProps) {
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
        </section>

      {/* Featured Journal Section */}
      <section id="featured-journal" className="relative z-10 w-full overflow-hidden px-4 py-24 pb-36 sm:px-6 md:py-32">
        <div className="absolute inset-0 bg-background/45 backdrop-blur-[1px]" />
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
              className="min-h-[220px] border-t border-white/18 py-6 animate-pulse md:min-h-[300px] md:py-8"
            />
          ))}

          {!isLoading && featuredArticles.map((entry, idx) => (
            <article 
              key={entry.article.id} 
              className="group flex min-h-[220px] cursor-pointer flex-col border-t border-white/18 py-6 transition-colors animate-[fade-rise_0.6s_ease-out] hover:border-white/45 md:min-h-[300px] md:py-8"
              style={{ animationDelay: `${idx * 0.15}s`, animationFillMode: 'both' }}
              onClick={() => {
                navigate(`/journal/${encodeURIComponent(entry.article.id)}`);
              }}
            >
              <span className="mb-5 font-mono text-[11px] uppercase tracking-[0.24em] text-white/68">
                {entry.label}
              </span>
              <div className="mb-6 flex flex-wrap items-center gap-4 font-mono text-xs text-white/58">
                <span className="flex items-center gap-1"><Calendar size={12} /> {entry.article.date}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {entry.article.readTime}</span>
              </div>
              
              <h3 className="mb-4 flex-1 text-xl font-semibold leading-[1.15] text-white/95 transition-colors group-hover:text-white sm:text-2xl" style={{ fontFamily: "'Noto Serif Display', serif" }}>
                {entry.article.title}
              </h3>
              
              <p className="mb-8 line-clamp-3 text-sm leading-relaxed text-white/68">
                {entry.article.excerpt}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {entry.article.tags.map(tag => (
                  <span key={tag} className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
                    {displayTagLabel(tag)}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        {!isLoading && articles.length > 0 && (
          <div className="mt-12 flex w-fit max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-white/18 pt-4 text-sm text-white/68 md:mt-16">
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
