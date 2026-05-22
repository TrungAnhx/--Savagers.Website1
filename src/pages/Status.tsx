import { AlertTriangle, CheckCircle2, Clock, Database, RefreshCw, Rss, Signal } from 'lucide-react';
import AmbientVideo from '../components/AmbientVideo';
import { useArticles } from '../hooks/useArticles';
import { useFetchStatus } from '../hooks/useFetchStatus';
import { formatDateTime } from '../utils/formatDateTime';

interface StatusProps {
  isZenMode?: boolean;
}

function statusLabel(status: string) {
  if (status === 'success') return 'Healthy';
  if (status === 'failure') return 'Needs attention';
  return 'Waiting';
}

export default function Status({ isZenMode }: StatusProps) {
  const { fetchStatus, isLoading: isStatusLoading } = useFetchStatus();
  const { articles, isLoading: isArticlesLoading } = useArticles();
  const counts = fetchStatus.counts || {};
  const warnings = fetchStatus.warnings || [];
  const isFailure = fetchStatus.status === 'failure';
  const consecutiveFailures = Number(fetchStatus.consecutiveFailures || 0);
  const totalStored = fetchStatus.status === 'unknown' ? articles.length : counts.totalStored ?? articles.length;

  return (
    <div className="relative min-h-screen w-full px-6 pb-32 pt-32">
      <div className="fixed inset-0 bg-background z-[-2]" />
      <AmbientVideo
        src="/backgrounds/bg2.mp4"
        className="fixed inset-0 h-full w-full object-cover opacity-45 z-[-1]"
        opacityClassName="fixed inset-0 bg-gradient-to-b from-background/90 via-background/55 to-background/95 z-[-1] pointer-events-none"
      />

      <main className={`mx-auto w-full max-w-5xl transition-opacity duration-1000 ${isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <header className="mb-14 animate-[fade-rise_0.6s_ease-out]">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">Archive Monitor</p>
          <h1 className="mb-5 text-5xl font-semibold text-foreground md:text-7xl" style={{ fontFamily: "'Noto Serif Display', serif" }}>
            Fetch Status.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Theo dõi lần cập nhật bài viết gần nhất, số bài đang lưu và nguồn nào đang phản hồi lỗi.
          </p>
        </header>

        <section className="mb-10 grid gap-4 md:grid-cols-4">
          <div className="liquid-glass rounded-lg px-5 py-5">
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              {isFailure ? <AlertTriangle size={16} /> : fetchStatus.status === 'success' ? <CheckCircle2 size={16} /> : <RefreshCw size={16} />}
              Status
            </div>
            <p className="text-2xl font-semibold text-foreground">{isStatusLoading ? 'Loading' : statusLabel(fetchStatus.status)}</p>
          </div>

          <div className="liquid-glass rounded-lg px-5 py-5">
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={16} />
              Last update
            </div>
            <p className="text-lg font-semibold leading-tight text-foreground">{formatDateTime(fetchStatus.finishedAt)}</p>
          </div>

          <div className="liquid-glass rounded-lg px-5 py-5">
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Database size={16} />
              Stored
            </div>
            <p className="text-2xl font-semibold text-foreground">{isArticlesLoading ? '...' : articles.length}</p>
          </div>

          <div className="liquid-glass rounded-lg px-5 py-5">
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Signal size={16} />
              Fail streak
            </div>
            <p className="text-2xl font-semibold text-foreground">{consecutiveFailures}</p>
          </div>
        </section>

        {consecutiveFailures >= 2 ? (
          <section className="mb-10 rounded-lg border border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm leading-relaxed text-amber-100">
            Actions đã lỗi từ 2 lần liên tiếp. Khả năng cao là nguồn Spiderum/txnam phản hồi chậm hoặc thay đổi HTML, nên cần kiểm tra log workflow.
          </section>
        ) : null}

        <section className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div className="liquid-glass rounded-lg px-6 py-6">
            <h2 className="mb-6 text-2xl font-semibold text-foreground" style={{ fontFamily: "'Noto Serif Display', serif" }}>
              Latest Run
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap justify-between gap-3 border-b border-border/40 pb-4">
                <span className="text-muted-foreground">Message</span>
                <span className="max-w-xl text-right text-foreground">{fetchStatus.message || 'No message recorded.'}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-3 border-b border-border/40 pb-4">
                <span className="text-muted-foreground">Started</span>
                <span className="text-foreground">{formatDateTime(fetchStatus.startedAt)}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-3 border-b border-border/40 pb-4">
                <span className="text-muted-foreground">Last success</span>
                <span className="text-foreground">{formatDateTime(fetchStatus.lastSuccessAt)}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-3">
                <span className="text-muted-foreground">Warnings</span>
                <span className="text-foreground">{warnings.length}</span>
              </div>
            </div>
          </div>

          <div className="liquid-glass rounded-lg px-6 py-6">
            <h2 className="mb-6 text-2xl font-semibold text-foreground" style={{ fontFamily: "'Noto Serif Display', serif" }}>
              Source Counts
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <span className="flex items-center gap-2 text-muted-foreground"><Rss size={15} /> Spiderum fetched</span>
                <span className="font-mono text-foreground">{counts.spiderumFetched ?? 0}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <span className="text-muted-foreground">Spiderum stored</span>
                <span className="font-mono text-foreground">{counts.spiderumStored ?? 0}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <span className="text-muted-foreground">txnam fresh</span>
                <span className="font-mono text-foreground">{counts.txnamFresh ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total stored</span>
                <span className="font-mono text-foreground">{totalStored}</span>
              </div>
            </div>
          </div>
        </section>

        {warnings.length > 0 ? (
          <section className="mt-8 liquid-glass rounded-lg px-6 py-6">
            <h2 className="mb-5 text-2xl font-semibold text-foreground" style={{ fontFamily: "'Noto Serif Display', serif" }}>
              Warnings
            </h2>
            <div className="space-y-3">
              {warnings.slice(0, 8).map((warning, index) => (
                <p key={`${warning}-${index}`} className="break-words rounded-md bg-white/5 px-4 py-3 text-sm text-muted-foreground">
                  {warning}
                </p>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
