import { useCallback, useMemo, useState } from 'react';
import { getStoredItem, setStoredItem } from '../utils/storage';

const STORAGE_KEY = 'savagers_reading_history';
const MAX_HISTORY_ITEMS = 30;

export interface ReadingHistoryItem {
  articleId: string;
  progress: number;
  lastReadAt: string;
}

function normalizeProgress(progress: number) {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));
  return clampedProgress >= 98 ? 100 : clampedProgress;
}

function readHistory() {
  try {
    const saved = getStoredItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item): ReadingHistoryItem[] => {
      if (!item || typeof item !== 'object') return [];
      const record = item as Record<string, unknown>;
      if (typeof record.articleId !== 'string' || typeof record.lastReadAt !== 'string') return [];
      return [{
        articleId: record.articleId,
        progress: normalizeProgress(typeof record.progress === 'number' ? record.progress : 0),
        lastReadAt: record.lastReadAt,
      }];
    }).slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

export function useReadingHistory() {
  const [history, setHistory] = useState<ReadingHistoryItem[]>(readHistory);
  const historyMap = useMemo(() => new Map(history.map((item) => [item.articleId, item])), [history]);

  const updateHistory = useCallback((articleId: string, progress?: number) => {
    setHistory((currentHistory) => {
      const previousItem = currentHistory.find((item) => item.articleId === articleId);
      const nextProgress = normalizeProgress(progress ?? previousItem?.progress ?? 0);
      if (previousItem && progress !== undefined && previousItem.progress === nextProgress) {
        return currentHistory;
      }

      const nextHistory = [
        { articleId, progress: nextProgress, lastReadAt: new Date().toISOString() },
        ...currentHistory.filter((item) => item.articleId !== articleId),
      ].slice(0, MAX_HISTORY_ITEMS);
      setStoredItem(STORAGE_KEY, JSON.stringify(nextHistory));
      return nextHistory;
    });
  }, []);

  const markArticleOpened = useCallback((articleId: string) => {
    updateHistory(articleId);
  }, [updateHistory]);

  const updateArticleProgress = useCallback((articleId: string, progress: number) => {
    updateHistory(articleId, progress);
  }, [updateHistory]);

  const getArticleProgress = useCallback((articleId: string) => {
    return historyMap.get(articleId)?.progress ?? 0;
  }, [historyMap]);

  return {
    history,
    historyMap,
    getArticleProgress,
    markArticleOpened,
    updateArticleProgress,
  };
}
