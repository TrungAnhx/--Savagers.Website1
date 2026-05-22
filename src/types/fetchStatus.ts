export type FetchStatusKind = 'success' | 'failure' | 'unknown';

export interface FetchStatusCounts {
  spiderumFetched?: number;
  spiderumStored?: number;
  txnamFresh?: number;
  txnamStored?: number;
  totalStored?: number;
}

export interface FetchStatus {
  version?: number;
  status: FetchStatusKind;
  message?: string;
  startedAt?: string;
  finishedAt?: string;
  lastSuccessAt?: string;
  consecutiveFailures?: number;
  sourceUrls?: {
    spiderum?: string[];
    txnam?: string;
  };
  counts?: FetchStatusCounts;
  warnings?: string[];
}
