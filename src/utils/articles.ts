import type { Article } from '../types/article';

export const ARTICLES_PER_PAGE = 10;
export const MAX_ARCHIVE_ARTICLES = 100;
export const MAX_ARCHIVE_PAGES = MAX_ARCHIVE_ARTICLES / ARTICLES_PER_PAGE;

const TECH_PRIORITY_PATTERNS = [
  /\bai\b/,
  /\bit\b/,
  /\bcode\b/,
  /\blập trình\b/,
  /\blap trinh\b/,
  /\bcông nghệ\b/,
  /\bcong nghe\b/,
  /\bkhoa học\b/,
  /\bkhoa hoc\b/,
  /\bphần mềm\b/,
  /\bphan mem\b/,
  /\bdeveloper\b/,
  /\bprogramming\b/,
  /\bsoftware\b/,
  /\bcoding\b/,
  /\bbackend\b/,
  /\bfront end\b/,
  /\bfrontend\b/,
  /\bfullstack\b/,
  /\bdevops\b/,
  /\bcloud\b/,
  /\bsecurity\b/,
  /\bcybersecurity\b/,
  /\bdata\b/,
  /\bdu lieu\b/,
  /\bmachine learning\b/,
  /\bdeep learning\b/,
  /\bllm\b/,
  /\bchatgpt\b/,
  /\bgame\b/,
];

const LIFE_PRIORITY_PATTERNS = [
  /\bcuộc sống\b/,
  /\bcuoc song\b/,
  /\blife\b/,
  /\bminimalism\b/,
  /\burban life\b/,
  /\btâm lý\b/,
  /\btam ly\b/,
  /\bphát triển bản thân\b/,
  /\bphat trien ban than\b/,
  /\bngười trẻ\b/,
  /\bnguoi tre\b/,
];

const DEBATE_PRIORITY_PATTERNS = [
  /\bquan điểm\b/,
  /\bquan diem\b/,
  /\btranh luận\b/,
  /\btranh luan\b/,
  /\bgóc nhìn\b/,
  /\bgoc nhin\b/,
  /\bthinking out loud\b/,
];

export type ArticleSignal = 'latest' | 'tech' | 'life' | 'debate';

export function normalizeTag(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function articlePriorityScore(article: Article) {
  const haystack = normalizeTag([article.title, ...(article.tags || [])].join(' '));
  const techScore = TECH_PRIORITY_PATTERNS.reduce((score, pattern) => score + (pattern.test(haystack) ? 1 : 0), 0);
  if (techScore > 0) return 3 + techScore;
  if (DEBATE_PRIORITY_PATTERNS.some((pattern) => pattern.test(haystack))) return 2;
  if (LIFE_PRIORITY_PATTERNS.some((pattern) => pattern.test(haystack))) return 1;
  return 0;
}

export function getArticleSignal(article: Article): Exclude<ArticleSignal, 'latest'> | null {
  const haystack = normalizeTag([article.title, ...(article.tags || [])].join(' '));
  if (TECH_PRIORITY_PATTERNS.some((pattern) => pattern.test(haystack))) return 'tech';
  if (DEBATE_PRIORITY_PATTERNS.some((pattern) => pattern.test(haystack))) return 'debate';
  if (LIFE_PRIORITY_PATTERNS.some((pattern) => pattern.test(haystack))) return 'life';
  return null;
}

export function limitArchive(articles: Article[]) {
  return articles.slice(0, MAX_ARCHIVE_ARTICLES);
}

export function filterArticlesBySignal(articles: Article[], signal: ArticleSignal) {
  const cappedArticles = limitArchive(articles);
  if (signal === 'latest') return cappedArticles;
  return cappedArticles.filter((article) => getArticleSignal(article) === signal);
}

export function sortArticlesForJournal(articles: Article[], signal: ArticleSignal) {
  const cappedArticles = limitArchive(articles);
  if (signal === 'latest') return cappedArticles;
  return [...cappedArticles].sort((a, b) => articlePriorityScore(b) - articlePriorityScore(a));
}

export function getFeaturedTodayArticles(articles: Article[]) {
  const cappedArticles = limitArchive(articles);
  const buckets: Array<{ signal: Exclude<ArticleSignal, 'latest'>; label: string }> = [
    { signal: 'tech', label: 'Tech Signal' },
    { signal: 'life', label: 'Lối sống' },
    { signal: 'debate', label: 'Góc nhìn' },
  ];
  const usedIds = new Set<string>();
  const featured: Array<{ article: Article; label: string; signal: Exclude<ArticleSignal, 'latest'> }> = [];

  buckets.forEach(({ signal, label }) => {
    const article = cappedArticles.find((item) => !usedIds.has(item.id) && getArticleSignal(item) === signal)
      ?? cappedArticles.find((item) => !usedIds.has(item.id));
    if (!article) return;
    usedIds.add(article.id);
    featured.push({ article, label, signal });
  });

  return featured;
}

export function displayTagLabel(tag: string) {
  const normalized = normalizeTag(tag.replace(/_/g, ' '));
  if (normalized === 'life style' || normalized === 'lifestyle') return 'Lối sống';
  if (normalized === 'thinking out loud') return 'Góc nhìn';
  if (normalized === 'khoa hoc cong nghe') return 'Khoa học - Công nghệ';
  if (normalized === 'quan diem tranh luan') return 'Quan điểm - Tranh luận';
  return tag.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}
