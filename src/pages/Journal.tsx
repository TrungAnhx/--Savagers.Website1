import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, Calendar, Clock, ChevronRight } from 'lucide-react';
import articlesData from '../data/articles.json';
import { sanitizeHtml } from '../utils/sanitizeHtml';

interface Article {
  id: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  tags: string[];
  link?: string;
}

const articles: Article[] = articlesData as Article[];

// Calculate category frequencies and take the top 5
const categoryCounts = articles.flatMap(a => a.tags || []).reduce((acc, tag) => {
  acc[tag] = (acc[tag] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const allCategories = Object.entries(categoryCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(e => e[0])
  .sort();

const ARTICLES_PER_PAGE = 10;

const backgroundVideos = [
  "/backgrounds/bg1.mp4",
  "/backgrounds/bg2.mp4",
  "/backgrounds/bg3.mp4",
  "/backgrounds/bg4.mp4",
  "/backgrounds/bg5.mp4"
];

interface JournalProps {
  isZenMode?: boolean;
}

export default function Journal({ isZenMode }: JournalProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [ignoreLocationState, setIgnoreLocationState] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [bgIndex, setBgIndex] = useState(() => Math.floor(Math.random() * backgroundVideos.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundVideos.length);
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const currentBg = backgroundVideos[bgIndex];

  // Scroll to top when page changes
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, [currentPage, selectedCategory]);

  const locationArticleId = !ignoreLocationState && location.state && typeof location.state === 'object' && 'articleId' in location.state
    ? (location.state as { articleId?: string }).articleId ?? null
    : null;
  const resolvedArticleId = activeArticleId ?? locationArticleId;
  const activeArticle = resolvedArticleId ? (articles.find((a) => a.id === resolvedArticleId) ?? null) : null;
  const sanitizedContent = useMemo(
    () => (activeArticle ? sanitizeHtml(activeArticle.content) : ''),
    [activeArticle]
  );

  const filteredArticles = useMemo(() => {
    return selectedCategory 
      ? articles.filter(a => a.tags && a.tags.includes(selectedCategory))
      : articles;
  }, [selectedCategory]);

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = useMemo(() => {
    return filteredArticles.slice(
      (currentPage - 1) * ARTICLES_PER_PAGE,
      currentPage * ARTICLES_PER_PAGE
    );
  }, [filteredArticles, currentPage]);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col pt-32 pb-40 px-6 z-10">
      
      {/* Background Styling specifically for Journal */}
      <div className="fixed inset-0 bg-background z-[-2]"></div>
      
      {/* Background Video */}
      <video
        key={currentBg}
        autoPlay
        loop
        muted
        playsInline
        style={{ willChange: 'transform, opacity' }}
        className="fixed inset-0 w-full h-full object-cover z-[-1] opacity-60"
      >
        <source src={currentBg} type="video/mp4" />
      </video>

      <div className="fixed inset-0 bg-gradient-to-b from-background/90 via-background/40 to-background/90 z-[-1] pointer-events-none"></div>

      <div className={`max-w-3xl mx-auto w-full relative transition-opacity duration-1000 ${isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        {!activeArticle ? (
          <div className="animate-[fade-rise_0.6s_ease-out]">
            <header className="mb-16">
              <h1 className="text-6xl md:text-8xl text-foreground mb-6" style={{ fontFamily: "'Lora', serif" }}>
                The Journal.
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mb-12">
                Thoughts, reflections, and deep dives from txnam.net. Read in silence.
              </p>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-3 mb-16">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ${
                    selectedCategory === null 
                      ? 'bg-foreground text-background' 
                      : 'liquid-glass text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All
                </button>
                {allCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ${
                      selectedCategory === category 
                        ? 'bg-foreground text-background' 
                        : 'liquid-glass text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </header>

            <div className="space-y-12">
              {paginatedArticles.map((article, idx) => (
                <article 
                  key={article.id} 
                  className={`group cursor-pointer border-b border-border/40 pb-12 animate-[fade-rise_0.6s_ease-out]`}
                  style={{ animationDelay: `${(idx % 10) * 0.1}s`, animationFillMode: 'both' }}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setActiveArticleId(article.id);
                    setIgnoreLocationState(true);
                  }}
                >
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono mb-4">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {article.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime}</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl text-foreground mb-4 group-hover:text-primary/80 transition-colors" style={{ fontFamily: "'Lora', serif" }}>
                    {article.title}
                  </h2>
                  
                  <p className="text-muted-foreground text-base leading-relaxed mb-6">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {article.tags && article.tags.map(tag => (
                      <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}

              {filteredArticles.length === 0 && (
                <p className="text-muted-foreground italic text-center py-12">No articles found in this category.</p>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-20">
                <button
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="liquid-glass w-10 h-10 rounded-full flex items-center justify-center text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <span className="text-muted-foreground font-mono text-sm">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="liquid-glass w-10 h-10 rounded-full flex items-center justify-center text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <article className="animate-[fade-rise_0.6s_ease-out]">
            <button 
              onClick={() => {
                setActiveArticleId(null);
                setIgnoreLocationState(true);
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-mono text-sm uppercase tracking-widest">Back to Journal</span>
            </button>

            <header className="mb-16">
              <h1 className="text-5xl md:text-7xl text-foreground mb-8 leading-[1.1]" style={{ fontFamily: "'Lora', serif" }}>
                {activeArticle.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-mono border-y border-border/40 py-6">
                <span className="flex items-center gap-2"><Calendar size={14} /> {activeArticle.date}</span>
                <span className="flex items-center gap-2"><Clock size={14} /> {activeArticle.readTime}</span>
                {activeArticle.link && (
                   <a href={activeArticle.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-foreground transition-colors"><BookOpen size={14} /> Original Source</a>
                )}
              </div>
            </header>

            <div 
              className="prose prose-invert prose-lg max-w-none 
              prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-8
              prose-headings:text-foreground prose-headings:font-normal prose-headings:mt-12 prose-headings:mb-6
              [&>h3]:text-3xl [&>h3]:font-serif
              prose-a:text-foreground prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-primary
              prose-img:rounded-xl prose-img:shadow-2xl prose-img:mx-auto prose-img:my-12
              selection:bg-foreground selection:text-background"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
            
            <div className="mt-20 pt-8 border-t border-border/40 flex justify-between items-center">
               <p className="text-muted-foreground italic font-serif text-xl">"End of transmission."</p>
               <button 
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setActiveArticleId(null);
                    setIgnoreLocationState(true);
                    navigate(location.pathname, { replace: true, state: null });
                  }}
                  className="liquid-glass rounded-full px-6 py-2 text-sm text-foreground hover:scale-[1.03] cursor-pointer"
                >
                  Return
                </button>
            </div>
          </article>
        )}

      </div>
    </div>
  );
}
