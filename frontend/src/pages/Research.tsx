import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle, RotateCcw, FileText } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import ResearchProgress from '@/components/research/ResearchProgress';
import ResearchTimeline from '@/components/research/ResearchTimeline';
import AgentTimeline from '@/components/research/AgentTimeline';
import ResearchPlan from '@/components/research/ResearchPlan';
import SourceList from '@/components/research/SourceList';
import ResearchMetrics from '@/components/research/ResearchMetrics';
import { useResearch } from '@/hooks/useResearch';
import { useResearchStream } from '@/hooks/useResearchStream';
import { researchApi } from '@/services/researchApi';
import { useToast } from '@/components/ui/Toast';
import { ErrorState } from '@/components/ui/ErrorState';
import { StatusBadge } from '@/components/ui/Badge';
import type { ResearchSession } from '@/types/research';

export function Research() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { session, plan, sources, loading, error, setSession, fetchSources, refetch } = useResearch(id);
  const { timeline, activities, completed, failed, progress } = useResearchStream(id);
  const [showContent, setShowContent] = useState(false);

  const handleCompleted = useCallback(async () => {
    if (!id) return;
    toast('success', 'Research completed! View your citation-backed report.');
    try {
      await fetchSources();
      const updated = await researchApi.getResearch(id);
      setSession(updated);
    } catch {
      // ignore
    }
  }, [id, toast, fetchSources, setSession]);

  useEffect(() => {
    if (completed) {
      handleCompleted();
      setShowContent(true);
    }
  }, [completed, handleCompleted]);

  useEffect(() => {
    if (progress > 40 && !showContent) {
      setShowContent(true);
    }
  }, [progress, showContent]);

  // Sync session progress from SSE
  useEffect(() => {
    if (session && progress > 0) {
      setSession({ ...session, progress, currentStep: timeline.find((s) => s.status === 'active')?.label ?? session.currentStep });
    }
  }, [progress, timeline]);

  // Periodically refetch sources when researching
  useEffect(() => {
    if (!id || !showContent) return;
    const interval = setInterval(() => {
      if (session && session.status !== 'completed' && session.status !== 'failed') {
        fetchSources();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [id, showContent, session, fetchSources]);

  if (loading && !session) {
    return (
      <PageContainer maxWidth="lg">
        <div className="space-y-4">
          <div className="h-32 rounded-2xl border border-neutral-200 bg-white shadow-card animate-pulse" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-80 rounded-2xl border border-neutral-200 bg-white shadow-card animate-pulse" />
            <div className="h-80 rounded-2xl border border-neutral-200 bg-white shadow-card animate-pulse" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error && !session) {
    return (
      <PageContainer maxWidth="md">
        <ErrorState
          title="Research not found"
          message="We couldn't load this research session. It may have been deleted."
          onRetry={() => refetch()}
        />
      </PageContainer>
    );
  }

  if (!session) return null;

  const isFailed = failed || session.status === 'failed';

  // If it failed AND we never got any partial data at all (no plan, no sources),
  // show the full-page failure state — nothing else to show anyway.
  const hasPartialData = !!plan || sources.length > 0;
  if (isFailed && !hasPartialData) {
    return (
      <PageContainer maxWidth="md">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-error-200 bg-error-50/50 px-6 py-16 text-center animate-fade-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-error-100">
            <AlertTriangle className="h-7 w-7 text-error-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-neutral-900">Research failed</h3>
          <p className="mt-1.5 max-w-sm text-sm text-neutral-600">
            {session.error || "We couldn't complete this research session. Please try again."}
          </p>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retry Research
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="xl">
      {/* Question header */}
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-primary-600">Researching</p>
            <h2 className="mt-1 text-lg font-semibold text-neutral-900 text-balance">{session.question}</h2>
          </div>
          <StatusBadge status={session.status} />
        </div>
      </div>

      {/* Failure banner — shown alongside whatever partial data we have, instead of replacing it */}
      {isFailed && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-error-200 bg-error-50/50 p-5 shadow-card animate-fade-in">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error-100">
            <AlertTriangle className="h-5 w-5 text-error-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-neutral-900">Research failed</p>
            <p className="mt-0.5 text-xs text-neutral-600">
              {session.error || "We couldn't complete this research session."}
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Progress */}
      {!isFailed && (
        <div className="mb-6">
          <ResearchProgress progress={progress || session.progress} currentStep={timeline.find((s) => s.status === 'active')?.label ?? session.currentStep} />
        </div>
      )}

      {/* Completed action */}
      {completed && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-success-200 bg-success-50/40 p-5 shadow-card animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-100">
              <FileText className="h-5 w-5 text-success-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">Research complete!</p>
              <p className="text-xs text-neutral-500">Your citation-backed report is ready to view.</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/research/${id}/report`)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700"
          >
            View Research Report
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Timelines */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <ResearchTimeline steps={timeline} />
        <AgentTimeline activities={activities} />
      </div>

      {/* Metrics */}
      {showContent && (session.sourcesFound > 0 || sources.length > 0) && (
        <div className="mb-6">
          <h3 className="mb-3 text-base font-semibold text-neutral-900">Research Coverage</h3>
          <ResearchMetrics session={session} />
        </div>
      )}

      {/* Plan */}
      {(showContent || plan) && (
        <div className="mb-6">
          <ResearchPlan plan={plan} loading={!plan && !isFailed} />
        </div>
      )}

      {/* Sources */}
      {(showContent || sources.length > 0) && (
        <div className="mb-6">
          <SourceList sources={sources} loading={sources.length === 0 && session.status === 'researching'} />
        </div>
      )}
    </PageContainer>
  );
}

export default Research;