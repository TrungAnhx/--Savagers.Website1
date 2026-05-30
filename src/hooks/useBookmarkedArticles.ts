import { useCallback, useMemo, useState } from 'react';
import { getStoredItem, setStoredItem } from '../utils/storage';

const STORAGE_KEY = 'savagers_bookmarked_articles';

function readBookmarkedIds() {
  try {
    const saved = getStoredItem(STORAGE_KEY);
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
    setStoredItem(STORAGE_KEY, JSON.stringify(nextIds));
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
