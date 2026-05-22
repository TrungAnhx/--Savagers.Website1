import { useCallback, useMemo, useState } from 'react';

const STORAGE_KEY = 'savagers_bookmarked_articles';

function readBookmarkedIds() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function useBookmarkedArticles() {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(readBookmarkedIds);
  const bookmarkedIdSet = useMemo(() => new Set(bookmarkedIds), [bookmarkedIds]);

  const updateBookmarkedIds = useCallback((nextIds: string[]) => {
    setBookmarkedIds(nextIds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));
    } catch {
      // Browser storage can be unavailable in private or locked-down contexts.
    }
  }, []);

  const isBookmarked = useCallback((articleId: string) => bookmarkedIdSet.has(articleId), [bookmarkedIdSet]);

  const toggleBookmark = useCallback((articleId: string) => {
    const nextIds = bookmarkedIdSet.has(articleId)
      ? bookmarkedIds.filter((id) => id !== articleId)
      : [articleId, ...bookmarkedIds];
    updateBookmarkedIds(nextIds);
  }, [bookmarkedIdSet, bookmarkedIds, updateBookmarkedIds]);

  return {
    bookmarkedIds,
    bookmarkedIdSet,
    isBookmarked,
    toggleBookmark,
  };
}
