import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import articlesData from '../data/articles.json';

interface Article {
  id: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  tags: string[];
}

interface HomeProps {
  isPlaying: boolean;
  togglePlay: () => void;
}

export default function Home({ isPlaying, togglePlay }: HomeProps) {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Pick 3 random articles for the homepage
    const shuffled = [...(articlesData as Article[])].sort(() => 0.5 - Math.random());
    setFeaturedArticles(shuffled.slice(0, 3));
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col flex-1">
      {/* Fixed Video Background so it stays while scrolling */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source src="/home_bg_4k.mp4" type="video/mp4" />
      </video>

      {/* Dark gradient to ensure content below the hero is readable without completely hiding the video */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/90 z-0 pointer-events-none"></div>

      {/* Hero Section (Full Screen) */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 min-h-screen">
        <h1 
          className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal text-foreground"
          style={{ fontFamily: "'Lora', serif" }}
        >
          Where <em className="not-italic text-muted-foreground">melodies</em> fade <em className="not-italic text-muted-foreground">into the void.</em>
        </h1>
        
        <p className="animate-fade-rise-delay text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed">
          We curate soundscapes for deep thinkers, nocturnal creators, and quiet rebels. Amid the noise, we broadcast ambient rhythms for sharp focus and infinite chill.
        </p>
        
        <button 
          onClick={() => {
            document.getElementById('featured-journal')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="animate-fade-rise-delay-2 liquid-glass rounded-full px-14 py-5 text-base text-foreground mt-12 hover:scale-[1.03] cursor-pointer inline-block"
        >
          Explore Frequencies
        </button>
        <button onClick={togglePlay} className="mt-4 text-muted-foreground hover:text-foreground transition-colors text-sm opacity-0 absolute">
          {isPlaying ? 'Playing' : 'Paused'}
        </button>
      </section>

      {/* Featured Journal Section */}
      <section id="featured-journal" className="relative z-10 w-full max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <h2 className="text-4xl md:text-6xl text-foreground mb-4" style={{ fontFamily: "'Lora', serif" }}>
              Random Thoughts.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              A glimpse into the minds of quiet rebels. Deep dives into life, coding, and the future.
            </p>
          </div>
          <Link to="/journal" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
            View All Chronicles <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredArticles.map((article, idx) => (
            <article 
              key={article.id} 
              className="group cursor-pointer bg-white/5 border border-border/40 rounded-2xl p-8 hover:bg-white/10 transition-colors flex flex-col animate-[fade-rise_0.6s_ease-out]"
              style={{ animationDelay: `${idx * 0.15}s`, animationFillMode: 'both' }}
              onClick={() => {
                navigate('/journal', { state: { articleId: article.id } });
              }}
            >
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-mono mb-6">
                <span className="flex items-center gap-1"><Calendar size={12} /> {article.date}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime}</span>
              </div>
              
              <h3 className="text-2xl text-foreground mb-4 group-hover:text-primary/80 transition-colors flex-1" style={{ fontFamily: "'Lora', serif" }}>
                {article.title}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 line-clamp-3">
                {article.excerpt}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {article.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-3 py-1 rounded-full border border-border/50 text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}