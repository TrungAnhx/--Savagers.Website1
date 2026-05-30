import { useEffect, useState } from 'react';

interface UseArticleContentState {
  content: string;
  isLoading: boolean;
  error: string | null;
}

interface ArticleContentResult {
  articleId: string | null;
  content: string;
  error: string | null;
}

const articleContentCache = new Map<string, string>();
const articleContentRequests = new Map<string, Promise<string>>();

async function fetchArticleContent(articleId: string) {
  const cachedContent = articleContentCache.get(articleId);
  if (cachedContent !== undefined) return cachedContent;

  const existingRequest = articleContentRequests.get(articleId);
  if (existingRequest) return existingRequest;

  const request = fetch(`/data/articles/${encodeURIComponent(articleId)}.json`, { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load article content: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const content = typeof data.content === 'string' ? data.content : '';
      articleContentCache.set(articleId, content);
      return content;
    })
    .finally(() => {
      articleContentRequests.delete(articleId);
    });

  articleContentRequests.set(articleId, request);
  return request;
}

export function useArticleContent(articleId: string | null): UseArticleContentState {
  const [result, setResult] = useState<ArticleContentResult>(() => ({
    articleId,
    content: articleId ? articleContentCache.get(articleId) ?? '' : '',
    error: null,
  }));

  useEffect(() => {
    let cancelled = false;

    async function loadArticleContent() {
      if (!articleId) return;

      try {
        const content = await fetchArticleContent(articleId);
        if (!cancelled) {
          setResult({ articleId, content, error: null });
        }
      } catch (loadError) {
        if (!cancelled) {
          setResult({
            articleId,
            content: '',
            error: loadError instanceof Error ? loadError.message : 'Failed to load article content.',
          });
        }
      }
    }

    loadArticleContent();

    return () => {
      cancelled = true;
    };
  }, [articleId]);

  const isCurrentArticle = result.articleId === articleId;
  const hasCachedContent = articleId ? articleContentCache.has(articleId) : false;

  return {
    content: isCurrentArticle ? result.content : '',
    isLoading: Boolean(articleId && (!isCurrentArticle || articleContentRequests.has(articleId) || (!hasCachedContent && !result.error))),
    error: isCurrentArticle ? result.error : null,
  };
}
