import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useParams,
  useNavigate,
} from 'react-router-dom';

import {
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  FileText,
} from 'lucide-react';

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

export function Research() {
  const { id } =
    useParams<{ id: string }>();

  const navigate = useNavigate();

  const toast = useToast();

  const {
    session,
    plan,
    sources,
    loading,
    error,
    setSession,
    fetchSources,
    refetch,
  } = useResearch(id);

  const {
    timeline,
    activities,
    completed,
    failed,
    progress,
  } = useResearchStream(id);

  const [showContent, setShowContent] =
    useState(false);

  const completionHandledRef =
    useRef(false);

  useEffect(() => {
    completionHandledRef.current =
      false;
  }, [id]);

  useEffect(() => {
    if (!session) return;

    console.log(
      '[Research] session:',
      session,
    );

    if (
      session.status === 'completed' ||
      session.status === 'researching' ||
      session.sourcesFound > 0
    ) {
      setShowContent(true);
    }
  }, [session]);

  useEffect(() => {
    console.log(
      '[Research] sources:',
      sources,
    );
  }, [sources]);

  useEffect(() => {
    console.log(
      '[Research] plan:',
      plan,
    );
  }, [plan]);

  useEffect(() => {
    console.log(
      '[Research] stream:',
      {
        timeline,
        activities,
        completed,
        failed,
        progress,
      },
    );

    if (
      completed ||
      progress > 0
    ) {
      setShowContent(true);
    }
  }, [
    timeline,
    activities,
    completed,
    failed,
    progress,
  ]);

  const handleCompleted =
    useCallback(async () => {
      if (
        !id ||
        completionHandledRef.current
      ) {
        return;
      }

      completionHandledRef.current =
        true;

      console.log(
        '[Research] research completed',
      );

      toast(
        'success',
        'Research completed! View your citation-backed report.',
      );

      try {
        await fetchSources();

        const response =
          await researchApi.getResearch(
            id,
          );

        console.log(
          '[Research] completed API response:',
          response,
        );

        const updatedSession =
          response?.data ?? response;

        setSession(updatedSession);

        setShowContent(true);
      } catch (err) {
        console.error(
          '[Research] completion refresh error:',
          err,
        );
      }
    }, [
      id,
      toast,
      fetchSources,
      setSession,
    ]);

  useEffect(() => {
    if (completed) {
      handleCompleted();
    }
  }, [
    completed,
    handleCompleted,
  ]);

  useEffect(() => {
    if (
      !session ||
      progress <= 0
    ) {
      return;
    }

    const activeStep =
      timeline.find(
        (step) =>
          step.status === 'active',
      );

    const nextProgress =
      progress;

    const nextStep =
      activeStep?.label ??
      session.currentStep;

    if (
      session.progress ===
        nextProgress &&
      session.currentStep ===
        nextStep
    ) {
      return;
    }

    setSession({
      ...session,
      progress: nextProgress,
      currentStep: nextStep,
    });
  }, [
    progress,
    timeline,
  ]);

  useEffect(() => {
    if (
      !id ||
      !showContent
    ) {
      return;
    }

    if (
      session?.status ===
        'completed' ||
      session?.status ===
        'failed'
    ) {
      return;
    }

    const interval =
      setInterval(() => {
        console.log(
          '[Research] polling sources',
        );

        fetchSources();
      }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [
    id,
    showContent,
    session?.status,
    fetchSources,
  ]);

  if (
    loading &&
    !session
  ) {
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

  if (
    error &&
    !session
  ) {
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

  if (!session) {
    return null;
  }

  if (
    failed ||
    session.status === 'failed'
  ) {
    return (
      <PageContainer maxWidth="md">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-error-200 bg-error-50/50 px-6 py-16 text-center animate-fade-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-error-100">
            <AlertTriangle className="h-7 w-7 text-error-600" />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-neutral-900">
            Research failed
          </h3>

          <p className="mt-1.5 max-w-sm text-sm text-neutral-600">
            We couldn't complete this research session. Please try again.
          </p>

          <div className="mt-5 flex gap-3">
            <button
              onClick={() =>
                navigate('/')
              }
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

  const currentProgress =
    progress > 0
      ? progress
      : session.progress ?? 0;

  const currentStep =
    timeline.find(
      (step) =>
        step.status === 'active',
    )?.label ??
    session.currentStep ??
    '';

  console.log(
    '[Research] rendering',
    {
      status: session.status,
      progress: currentProgress,
      currentStep,
      showContent,
      sourcesLength:
        sources.length,
      planExists: !!plan,
      activitiesLength:
        activities.length,
    },
  );

  return (
    <PageContainer maxWidth="xl">
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-primary-600">
              Researching
            </p>

            <h2 className="mt-1 text-lg font-semibold text-neutral-900 text-balance">
              {session.question}
            </h2>
          </div>

          <StatusBadge
            status={session.status}
          />
        </div>
      </div>

      <div className="mb-6">
        <ResearchProgress
          progress={
            currentProgress
          }
          currentStep={
            currentStep
          }
        />
      </div>

      {(completed ||
        session.status ===
          'completed') && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-success-200 bg-success-50/40 p-5 shadow-card animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-100">
              <FileText className="h-5 w-5 text-success-700" />
            </div>

            <div>
              <p className="text-sm font-semibold text-neutral-900">
                Research complete!
              </p>

              <p className="text-xs text-neutral-500">
                Your citation-backed report is ready to view.
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              navigate(
                `/research/${id}/report`,
              )
            }
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700"
          >
            View Research Report
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <ResearchTimeline
          steps={timeline}
        />

        <AgentTimeline
          activities={activities}
        />
      </div>

      {showContent &&
        session.sourcesFound >
          0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-base font-semibold text-neutral-900">
              Research Coverage
            </h3>

            <ResearchMetrics
              session={session}
            />
          </div>
        )}

      {showContent && (
        <div className="mb-6">
          <ResearchPlan
            plan={plan}
            loading={!plan}
          />
        </div>
      )}

      {showContent && (
        <div className="mb-6">
          <SourceList
            sources={sources}
            loading={
              sources.length === 0 &&
              session.status ===
                'researching'
            }
          />
        </div>
      )}
    </PageContainer>
  );
}

export default Research;