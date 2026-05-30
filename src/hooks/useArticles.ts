import { useEffect, useState } from 'react';
import type { Article } from '../types/article';
import { limitArchive } from '../utils/articles';

interface UseArticlesState {
  articles: Article[];
  isLoading: boolean;
  error: string | null;
}

const ARTICLES_CACHE_TTL_MS = 5 * 60 * 1000;
let cachedArticles: Article[] | null = null;
let articlesCachedAt = 0;
let articlesRequest: Promise<Article[]> | null = null;

async function fetchArticles() {
  if (cachedArticles && Date.now() - articlesCachedAt < ARTICLES_CACHE_TTL_MS) return cachedArticles;

  if (!articlesRequest) {
    articlesRequest = fetch('/data/articles.json', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load article archive: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        cachedArticles = limitArchive(Array.isArray(data) ? data : []);
        articlesCachedAt = Date.now();
        return cachedArticles;
      })
      .finally(() => {
        articlesRequest = null;
      });
  }

  return articlesRequest;
}

export function useArticles(): UseArticlesState {
  const [articles, setArticles] = useState<Article[]>(() => cachedArticles ?? []);
  const [isLoading, setIsLoading] = useState(() => cachedArticles === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function hydrateArticles() {
      try {
        const data = await fetchArticles();
        if (!cancelled) {
          setArticles(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load article archive.');
          setArticles([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    hydrateArticles();

    return () => {
      cancelled = true;
    };
  }, []);

  return { articles, isLoading, error };
}
