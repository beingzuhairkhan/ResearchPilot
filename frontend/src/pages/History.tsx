import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, FileText, ArrowRight, ChevronLeft, ChevronRight, PenLine } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { StatusBadge } from '@/components/ui/Badge';
import { HistorySkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { researchApi } from '@/services/researchApi';
import type { ResearchSession, PaginatedResponse } from '@/types/research';

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function History() {
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState<PaginatedResponse<ResearchSession> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ResearchSession | null>(null);

  const fetchHistory = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await researchApi.getResearchHistory(p, 12);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(page);
  }, [page, fetchHistory]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await researchApi.deleteResearch(deleteTarget.id);
      toast('success', 'Research deleted');
      setDeleteTarget(null);
      fetchHistory(page);
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Failed to delete research');
    }
  };

  const handleClick = (session: ResearchSession) => {
    // console.log("se", session)
    if (session.status === 'completed') {
      navigate(`/research/${session._id}/report`);
    } else {
      navigate(`/research/${session._id}`);
    }
  };

  return (
    <PageContainer maxWidth="xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Research History</h2>
          <p className="mt-0.5 text-sm text-neutral-500">Browse your past research sessions</p>
        </div>
        <Button variant="primary" size="sm" icon={<PenLine className="h-3.5 w-3.5" />} onClick={() => navigate('/')}>
          New Research
        </Button>
      </div>

      {loading && <HistorySkeleton />}

      {error && !loading && (
        <ErrorState title="Failed to load history" message={error} onRetry={() => fetchHistory(page)} />
      )}

      {!loading && !error && data && data.data.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No research yet"
          description="Start your first research investigation."
          action={<Button variant="primary" onClick={() => navigate('/')}>Start Research</Button>}
        />
      )}

      {!loading && !error && data && data.data.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((session) => (
              <div
                key={session.id}
                className="group relative rounded-xl border border-neutral-200 bg-white p-5 shadow-card transition-all hover:shadow-elevated hover:border-neutral-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900">{session.question}</h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(session); }}
                    className="shrink-0 rounded-lg p-1.5 text-neutral-300 transition-colors hover:bg-error-50 hover:text-error-600"
                    aria-label="Delete research"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <StatusBadge status={session.status} />
                  {session.sourcesFound > 0 && (
                    <span className="text-xs text-neutral-400">• {session.sourcesFound} sources</span>
                  )}
                </div>

                <div className="mt-3 text-xs text-neutral-400">{formatDate(session.createdAt)}</div>

                <button
                  onClick={() => handleClick(session)}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
                >
                  {session.status === 'completed' ? 'View Report' : session.status === 'failed' ? 'View Details' : 'View Progress'}
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <span className="px-4 text-sm text-neutral-500">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete research?"
        maxWidth="max-w-sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
          </div>
        }
      >
        <p className="text-sm text-neutral-600">
          This will permanently remove the research session and its report. This action cannot be undone.
        </p>
      </Modal>
    </PageContainer>
  );
}

export default History;
