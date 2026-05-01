import { useEffect, useState } from 'react';

interface UseArticleContentState {
  content: string;
  isLoading: boolean;
  error: string | null;
}

export function useArticleContent(articleId: string | null): UseArticleContentState {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadArticleContent() {
      if (!articleId) {
        setContent('');
        setError(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/data/articles/${encodeURIComponent(articleId)}.json`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load article content: ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) {
          setContent(typeof data.content === 'string' ? data.content : '');
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load article content.');
          setContent('');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadArticleContent();

    return () => {
      cancelled = true;
    };
  }, [articleId]);

  return { content, isLoading, error };
}
