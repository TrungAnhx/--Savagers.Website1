import { useEffect, useState } from 'react';
import type { Article } from '../types/article';
import { limitArchive } from '../utils/articles';

interface UseArticlesState {
  articles: Article[];
  isLoading: boolean;
  error: string | null;
}

export function useArticles(): UseArticlesState {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadArticles() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/data/articles.json', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load article archive: ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) {
          setArticles(limitArchive(Array.isArray(data) ? data : []));
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

    loadArticles();

    return () => {
      cancelled = true;
    };
  }, []);

  return { articles, isLoading, error };
}
