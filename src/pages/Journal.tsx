import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  Search,
  Share2,
  X,
} from 'lucide-react';
import AmbientVideo from '../components/AmbientVideo';
import { useArticleContent } from '../hooks/useArticleContent';
import { useArticles } from '../hooks/useArticles';
import { useBookmarkedArticles } from '../hooks/useBookmarkedArticles';
import { useReadingHistory } from '../hooks/useReadingHistory';
import { htmlHasReadableContent, sanitizeHtml } from '../utils/sanitizeHtml';
import {
  ARTICLES_PER_PAGE,
  MAX_ARCHIVE_PAGES,
  displayTagLabel,
  filterArticlesBySignal,
  matchesArticleQuery,
  type ArticleSignal,
} from '../utils/articles';

const backgroundVideos = [
  '/backgrounds/bg1.mp4',
  '/backgrounds/bg2.mp4',
  '/backgrounds/bg3.mp4',
  '/backgrounds/bg4.mp4',
  '/backgrounds/bg5.mp4',
];

interface JournalProps {
  isZenMode?: boolean;
}

const signalOptions: Array<{ key: ArticleSignal; label: string }> = [
  { key: 'latest', label: 'Mới nhất' },
  { key: 'tech', label: 'Tech' },
  { key: 'life', label: 'Lối sống' },
  { key: 'debate', label: 'Góc nhìn' },
];

export default function Journal({ isZenMode }: JournalProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { articleId: routeArticleId } = useParams<{ articleId?: string }>();
  const { articles, isLoading, error } = useArticles();
  const { bookmarkedIds, bookmarkedIdSet, isBookmarked, toggleBookmark } = useBookmarkedArticles();
  const { history, historyMap, getArticleProgress, markArticleOpened, updateArticleProgress } = useReadingHistory();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSignal, setSelectedSignal] = useState<ArticleSignal>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [showHistoryOnly, setShowHistoryOnly] = useState(false);
  const [bgIndex, setBgIndex] = useState(() => Math.floor(Math.random() * backgroundVideos.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundVideos.length);
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    return () => window.clearTimeout(timeoutId);
  }, [currentPage, selectedSignal]);

  const locationArticleId = location.state && typeof location.state === 'object' && 'articleId' in location.state
    ? (location.state as { articleId?: string }).articleId ?? null
    : null;
  const activeArticleId = routeArticleId ?? locationArticleId;

  useEffect(() => {
    if (!routeArticleId && locationArticleId) {
      navigate(`/journal/${encodeURIComponent(locationArticleId)}`, { replace: true, state: null });
    }
  }, [locationArticleId, navigate, routeArticleId]);

  const currentBg = backgroundVideos[bgIndex];
  const filteredArticles = useMemo(() => {
    const signalArticles = filterArticlesBySignal(articles, selectedSignal);
    const searchedArticles = signalArticles.filter((article) => matchesArticleQuery(article, searchQuery));
    const savedArticles = showSavedOnly
      ? searchedArticles.filter((article) => bookmarkedIdSet.has(article.id))
      : searchedArticles;
    if (!showHistoryOnly) return savedArticles;
    return savedArticles
      .filter((article) => historyMap.has(article.id))
      .sort((a, b) => {
        const aTime = historyMap.get(a.id)?.lastReadAt ?? '';
        const bTime = historyMap.get(b.id)?.lastReadAt ?? '';
        return bTime.localeCompare(aTime);
      });
  }, [articles, bookmarkedIdSet, historyMap, searchQuery, selectedSignal, showHistoryOnly, showSavedOnly]);

  const totalPages = Math.min(MAX_ARCHIVE_PAGES, Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE));
  const visiblePage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedArticles = useMemo(() => {
    return filteredArticles.slice((visiblePage - 1) * ARTICLES_PER_PAGE, visiblePage * ARTICLES_PER_PAGE);
  }, [filteredArticles, visiblePage]);

  const activeArticle = activeArticleId ? (articles.find((article) => article.id === activeArticleId) ?? null) : null;
  const isArticleNotFound = Boolean(activeArticleId && !isLoading && !activeArticle);
  const { content: activeArticleContent, isLoading: isArticleContentLoading, error: articleContentError } = useArticleContent(activeArticle?.id ?? null);
  const sanitizedContent = useMemo(() => sanitizeHtml(activeArticleContent), [activeArticleContent]);
  const hasReadableContent = useMemo(() => htmlHasReadableContent(sanitizedContent), [sanitizedContent]);
  const activeReadingProgress = activeArticle ? getArticleProgress(activeArticle.id) : 0;

  useEffect(() => {
    if (!activeArticle?.id) return;
    const articleId = activeArticle.id;
    const openTimeoutId = window.setTimeout(() => markArticleOpened(articleId), 0);
    let frameId: number | null = null;

    const recordReadingProgress = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 100;
        updateArticleProgress(articleId, progress);
        frameId = null;
      });
    };

    recordReadingProgress();
    window.addEventListener('scroll', recordReadingProgress, { passive: true });
    return () => {
      window.clearTimeout(openTimeoutId);
      window.removeEventListener('scroll', recordReadingProgress);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [activeArticle?.id, markArticleOpened, updateArticleProgress]);

  const handleShareArticle = async () => {
    if (!activeArticle) return;
    const shareUrl = `${window.location.origin}/journal/${encodeURIComponent(activeArticle.id)}`;
    if (navigator.share) {
      await navigator.share({ title: activeArticle.title, url: shareUrl });
      return;
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col pt-32 pb-40 px-6 z-10">
      {activeArticle ? (
        <div className="fixed inset-x-0 top-0 z-[70] h-0.5 bg-white/5">
          <div className="h-full bg-white/80 transition-[width] duration-300" style={{ width: `${activeReadingProgress}%` }} />
        </div>
      ) : null}

      <div className="fixed inset-0 bg-background z-[-2]" />

      <AmbientVideo
        src={currentBg}
        className="fixed inset-0 w-full h-full object-cover z-[-1] opacity-45"
        opacityClassName="fixed inset-0 bg-gradient-to-b from-background/95 via-background/70 to-background/95 z-[-1] pointer-events-none"
      />

      <div className={`max-w-3xl mx-auto w-full relative transition-opacity duration-1000 ${isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {isArticleNotFound ? (
          <div className="animate-[fade-rise_0.6s_ease-out] rounded-lg border border-border/40 bg-white/[0.03] px-6 py-8">
            <p className="text-foreground text-xl font-semibold mb-3" style={{ fontFamily: "'Noto Serif Display', serif" }}>
              Article not found.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Link bài viết này không còn nằm trong archive hiện tại.
            </p>
            <button
              onClick={() => navigate('/journal', { replace: true })}
              className="liquid-glass rounded-full px-6 py-2 text-sm text-foreground hover:scale-[1.03] cursor-pointer"
            >
              Back to Journal
            </button>
          </div>
        ) : !activeArticle ? (
          <div className="animate-[fade-rise_0.6s_ease-out]">
            <header className="mb-16">
              <h1 className="section-heading mb-6 text-6xl font-semibold text-foreground md:text-8xl" style={{ fontFamily: "'Noto Serif Display', serif" }}>
                The Journal.
              </h1>
              <p className="journal-intro-copy mb-12 max-w-xl text-lg leading-relaxed text-white/[0.76]">
                A rolling archive of up to 100 pieces from Spiderum and txnam. Read in silence.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {signalOptions.map((signal) => (
                  <button
                    key={signal.key}
                    onClick={() => {
                      setSelectedSignal(signal.key);
                      setCurrentPage(1);
                      setShowHistoryOnly(false);
                    }}
                    className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ${
                      selectedSignal === signal.key
                        ? 'liquid-glass liquid-glass-active text-foreground'
                        : 'liquid-glass text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {signal.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                <label className="liquid-glass flex h-12 min-w-0 items-center gap-3 rounded-full px-5 text-muted-foreground focus-within:text-foreground">
                  <Search size={17} className="shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    placeholder="Search title, tag, source..."
                    type="search"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setCurrentPage(1);
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                </label>

                <button
                  onClick={() => {
                    setShowSavedOnly((value) => !value);
                    setShowHistoryOnly(false);
                    setCurrentPage(1);
                  }}
                  className={`liquid-glass liquid-glass-interactive flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm ${
                    showSavedOnly ? 'liquid-glass-active text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-pressed={showSavedOnly}
                >
                  {showSavedOnly ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                  <span>Saved {bookmarkedIds.length}</span>
                </button>

                <button
                  onClick={() => {
                    setShowHistoryOnly((value) => !value);
                    setShowSavedOnly(false);
                    setSelectedSignal('latest');
                    setCurrentPage(1);
                  }}
                  className={`liquid-glass liquid-glass-interactive flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm ${
                    showHistoryOnly ? 'liquid-glass-active text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-pressed={showHistoryOnly}
                >
                  <History size={17} />
                  <span>History {history.length}</span>
                </button>
              </div>
            </header>

            {isLoading && (
              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="border-b border-border/40 pb-12 animate-pulse">
                    <div className="h-4 w-40 bg-white/10 rounded mb-4" />
                    <div className="h-10 w-3/4 bg-white/10 rounded mb-4" />
                    <div className="h-4 w-full bg-white/10 rounded mb-3" />
                    <div className="h-4 w-2/3 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && error && (
              <p className="text-muted-foreground italic py-12">
                Could not load the article archive right now.
              </p>
            )}

            {!isLoading && !error && (
              <div className="space-y-12">
                {paginatedArticles.map((article, idx) => {
                  const readingProgress = getArticleProgress(article.id);
                  return (
                    <article
                      key={article.id}
                      className="article-list-card group cursor-pointer animate-[fade-rise_0.6s_ease-out]"
                      style={{ animationDelay: `${(idx % 10) * 0.1}s`, animationFillMode: 'both' }}
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        navigate(`/journal/${encodeURIComponent(article.id)}`);
                      }}
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="article-meta-line flex flex-wrap items-center gap-4 text-xs font-mono">
                          <span className="flex items-center gap-1"><Calendar size={12} /> {article.date}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime}</span>
                          {readingProgress > 0 ? <span>{readingProgress}% read</span> : null}
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleBookmark(article.id);
                          }}
                          className={`liquid-glass liquid-glass-interactive flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            isBookmarked(article.id) ? 'liquid-glass-active text-foreground' : 'text-muted-foreground hover:text-foreground'
                          }`}
                          aria-label={isBookmarked(article.id) ? 'Remove saved article' : 'Save article'}
                          aria-pressed={isBookmarked(article.id)}
                          title={isBookmarked(article.id) ? 'Remove saved article' : 'Save article'}
                        >
                          {isBookmarked(article.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        </button>
                      </div>

                      <h2 className="mb-4 text-3xl font-semibold leading-[1.15] text-white/95 transition-colors group-hover:text-white md:text-4xl" style={{ fontFamily: "'Noto Serif Display', serif" }}>
                        {article.title}
                      </h2>

                      <p className="mb-6 text-base leading-relaxed text-white/[0.76]">
                        {article.excerpt}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {article.tags?.map((tag) => (
                          <span key={tag} className="article-tag-pill font-mono text-xs">
                            {displayTagLabel(tag)}
                          </span>
                        ))}
                      </div>
                    </article>
                  );
                })}

                {filteredArticles.length === 0 && (
                  <p className="text-muted-foreground italic text-center py-12">
                    {showSavedOnly
                      ? 'No saved articles match this view.'
                      : showHistoryOnly
                        ? 'Your reading history is still empty.'
                        : 'No articles found in this lane.'}
                  </p>
                )}
              </div>
            )}

            {!isLoading && !error && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-20">
                <button
                  onClick={() => {
                    setCurrentPage((page) => Math.max(1, page - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={visiblePage === 1}
                  className="liquid-glass w-10 h-10 rounded-full flex items-center justify-center text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                >
                  <ChevronLeft size={20} />
                </button>

                <span className="text-muted-foreground font-mono text-sm">
                  {visiblePage} / {totalPages}
                </span>

                <button
                  onClick={() => {
                    setCurrentPage((page) => Math.min(totalPages, page + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={visiblePage === totalPages}
                  className="liquid-glass w-10 h-10 rounded-full flex items-center justify-center text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

          </div>
        ) : (
          <article className="reader-shell animate-[fade-rise_0.6s_ease-out]">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/journal');
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-mono text-sm uppercase tracking-widest">Back to Journal</span>
            </button>

            <header className="mb-16">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold text-foreground mb-8 leading-[1.08] sm:leading-[1.12]" style={{ fontFamily: "'Noto Serif Display', serif" }}>
                {activeArticle.title}
              </h1>

              <div className="reader-meta flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-mono">
                <span className="flex items-center gap-2"><Calendar size={14} /> {activeArticle.date}</span>
                <span className="flex items-center gap-2"><Clock size={14} /> {activeArticle.readTime}</span>
                {activeArticle.link && (
                  <a href={activeArticle.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-foreground transition-colors">
                    <BookOpen size={14} /> Original Source
                  </a>
                )}
                <button
                  onClick={() => {
                    void handleShareArticle();
                  }}
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <Share2 size={14} /> Share Link
                </button>
                <button
                  onClick={() => toggleBookmark(activeArticle.id)}
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                  aria-pressed={isBookmarked(activeArticle.id)}
                >
                  {isBookmarked(activeArticle.id) ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  {isBookmarked(activeArticle.id) ? 'Saved' : 'Save'}
                </button>
              </div>
            </header>

            {isArticleContentLoading && (
              <div className="space-y-4 animate-pulse">
                <div className="h-5 w-full bg-white/10 rounded" />
                <div className="h-5 w-11/12 bg-white/10 rounded" />
                <div className="h-5 w-4/5 bg-white/10 rounded" />
                <div className="h-80 w-full bg-white/10 rounded-xl mt-10" />
              </div>
            )}

            {!isArticleContentLoading && articleContentError && (
              <p className="text-muted-foreground italic py-12">
                Could not load this article right now.
              </p>
            )}

            {!isArticleContentLoading && !articleContentError && hasReadableContent && (
              <div
                className="article-content reader-prose prose prose-invert prose-lg max-w-none
              prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-8
              prose-headings:text-foreground prose-headings:font-semibold prose-headings:mt-12 prose-headings:mb-6
              prose-headings:font-display [&>h3]:text-3xl
              prose-a:text-foreground prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-primary
              prose-img:rounded-xl prose-img:shadow-2xl prose-img:mx-auto prose-img:my-12
              selection:bg-foreground selection:text-background"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            )}

            {!isArticleContentLoading && !articleContentError && !hasReadableContent && (
              <div className="article-content rounded-lg border border-border/40 bg-white/[0.03] px-6 py-7">
                <p className="text-muted-foreground leading-relaxed mb-5">
                  Nội dung đầy đủ của bài này chưa được lưu trong archive. Bạn vẫn có thể đọc phần tóm tắt hoặc mở nguồn gốc bên dưới.
                </p>
                {activeArticle.excerpt && (
                  <p className="text-foreground/85 leading-relaxed mb-6">
                    {activeArticle.excerpt}
                  </p>
                )}
                {activeArticle.link && (
                  <a
                    href={activeArticle.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    <BookOpen size={14} /> Open original source
                  </a>
                )}
              </div>
            )}

            <div className="mt-20 pt-8 border-t border-border/40 flex justify-between items-center">
              <p className="text-muted-foreground italic font-serif text-xl">"End of transmission."</p>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  navigate('/journal');
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
