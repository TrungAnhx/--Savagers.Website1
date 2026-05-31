import { useEffect, useState } from 'react';
import type { Track } from './useAudioPlayer';

export interface TrackCategory {
  id: string;
  title: string;
  description: string;
  cover: string;
  tracks: Track[];
}

interface TrackArchive {
  categories: TrackCategory[];
  playlist: Track[];
}

interface UseTracksState extends TrackArchive {
  isLoading: boolean;
  error: string | null;
}

interface RawTrackCategory {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  cover?: unknown;
  tracks?: unknown;
}

interface RawTrackArchive {
  defaultCover?: unknown;
  categories?: unknown;
}

const FALLBACK_COVER = '/eagle.png';
let cachedTrackArchive: TrackArchive | null = null;
let tracksRequest: Promise<TrackArchive> | null = null;

function normalizeTrackCategory(category: RawTrackCategory, index: number, defaultCover: string): TrackCategory | null {
  if (typeof category.title !== 'string' || !Array.isArray(category.tracks)) return null;
  const cover = typeof category.cover === 'string' ? category.cover : defaultCover;
  const tracks = category.tracks.flatMap((track) => {
    if (!track || typeof track !== 'object') return [];
    const record = track as Record<string, unknown>;
    if (
      typeof record.name !== 'string'
      || typeof record.duration !== 'string'
      || typeof record.artist !== 'string'
      || typeof record.url !== 'string'
    ) {
      return [];
    }

    return [{
      name: record.name,
      duration: record.duration,
      artist: record.artist,
      url: record.url,
      cover: typeof record.cover === 'string' ? record.cover : cover,
    }];
  });

  return {
    id: typeof category.id === 'string' ? category.id : `category-${index + 1}`,
    title: category.title,
    description: typeof category.description === 'string' ? category.description : '',
    cover,
    tracks,
  };
}

async function fetchTracks() {
  if (cachedTrackArchive) return cachedTrackArchive;

  if (!tracksRequest) {
    tracksRequest = fetch('/data/tracks.json')
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load tracks: ${response.status}`);
        return response.json();
      })
      .then((data: RawTrackArchive) => {
        const defaultCover = typeof data.defaultCover === 'string' ? data.defaultCover : FALLBACK_COVER;
        const categories = Array.isArray(data.categories)
          ? data.categories.flatMap((category, index) => {
              if (!category || typeof category !== 'object') return [];
              const normalized = normalizeTrackCategory(category as RawTrackCategory, index, defaultCover);
              return normalized ? [normalized] : [];
            })
          : [];
        const playlist = categories.flatMap((category) => category.tracks);
        cachedTrackArchive = { categories, playlist };
        return cachedTrackArchive;
      })
      .finally(() => {
        tracksRequest = null;
      });
  }

  return tracksRequest;
}

export function useTracks(): UseTracksState {
  const [trackArchive, setTrackArchive] = useState<TrackArchive>(() => cachedTrackArchive ?? { categories: [], playlist: [] });
  const [isLoading, setIsLoading] = useState(() => cachedTrackArchive === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function hydrateTracks() {
      try {
        const archive = await fetchTracks();
        if (!cancelled) setTrackArchive(archive);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load tracks.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    hydrateTracks();

    return () => {
      cancelled = true;
    };
  }, []);

  return { ...trackArchive, isLoading, error };
}
