import { useEffect, useState } from 'react';
import type { FetchStatus } from '../types/fetchStatus';

const fallbackStatus: FetchStatus = {
  status: 'unknown',
  message: 'Fetch status is not available yet.',
  consecutiveFailures: 0,
};

interface UseFetchStatusState {
  fetchStatus: FetchStatus;
  isLoading: boolean;
  error: string | null;
}

export function useFetchStatus(): UseFetchStatusState {
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>(fallbackStatus);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFetchStatus() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/data/fetch-status.json', { cache: 'no-store' });
        if (response.status === 404) {
          if (!cancelled) setFetchStatus(fallbackStatus);
          return;
        }
        if (!response.ok) {
          throw new Error(`Failed to load fetch status: ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) {
          setFetchStatus(data && typeof data === 'object' ? data : fallbackStatus);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load fetch status.');
          setFetchStatus(fallbackStatus);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadFetchStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  return { fetchStatus, isLoading, error };
}
