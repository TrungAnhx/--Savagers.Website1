import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, ChevronLeft, Calendar, Clock } from 'lucide-react';
import articlesData from '../data/articles.json';

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

export default function Journal() {
  const location = useLocation();
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (location.state && location.state.articleId) {
      const foundArticle = articles.find(a => a.id === location.state.articleId);
      if (foundArticle) {
        setActiveArticle(foundArticle);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [location.state]);

  return (
    <div className="relative min-h-screen w-full flex flex-col pt-32 pb-40 px-6 z-10">
      
      {/* Background Styling specifically for Journal */}
      <div className="fixed inset-0 bg-background z-[-2]"></div>
      
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{ willChange: 'transform, opacity' }}
        className="fixed inset-0 w-full h-full object-cover z-[-1] opacity-30"
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4" type="video/mp4" />
      </video>

      <div className="fixed inset-0 opacity-20 pointer-events-none z-[-1]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
      <div className="fixed inset-0 bg-gradient-to-b from-background/90 via-background/40 to-background/90 z-[-1] pointer-events-none"></div>

      <div className="max-w-3xl mx-auto w-full relative">
        
        {!activeArticle ? (
          <div className="animate-[fade-rise_0.6s_ease-out]">
            <header className="mb-16">
              <h1 className="text-6xl md:text-8xl text-foreground mb-6" style={{ fontFamily: "'Lora', serif" }}>
                The Journal.
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                Thoughts, reflections, and deep dives from txnam.net. Read in silence.
              </p>
            </header>

            <div className="space-y-12">
              {articles.map((article, idx) => (
                <article 
                  key={article.id} 
                  className={`group cursor-pointer border-b border-border/40 pb-12 animate-[fade-rise_0.6s_ease-out]`}
                  style={{ animationDelay: `${idx * 0.15}s`, animationFillMode: 'both' }}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setActiveArticle(article);
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
            </div>
          </div>
        ) : (
          <article className="animate-[fade-rise_0.6s_ease-out]">
            <button 
              onClick={() => setActiveArticle(null)}
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
              dangerouslySetInnerHTML={{ __html: activeArticle.content }}
            />
            
            <div className="mt-20 pt-8 border-t border-border/40 flex justify-between items-center">
               <p className="text-muted-foreground italic font-serif text-xl">"End of transmission."</p>
               <button 
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setActiveArticle(null);
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