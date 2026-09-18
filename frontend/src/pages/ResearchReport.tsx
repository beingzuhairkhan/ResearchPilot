import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Copy,
  Printer,
  PenLine,
  ArrowLeft,
} from 'lucide-react';

import PageContainer from '@/components/layout/PageContainer';
import ReportViewer from '@/components/research/ReportViewer';
import CitationModal from '@/components/research/CitationModal';
import { ReportSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import { researchApi } from '@/services/researchApi';

import type {
  Report as ReportType,
  CitationSource,
} from '@/types/research';

export function ResearchReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [report, setReport] = useState<ReportType | null>(null);
  const [session, setSession] = useState<{ question: string } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [citationIndex, setCitationIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Research ID is missing');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadReport = async () => {
      try {
        setLoading(true);
        setError(null);

        const [rep, ses] = await Promise.all([
          researchApi.getResearchReport(id),
          researchApi.getResearch(id),
        ]);

        if (cancelled) {
          return;
        }

        console.log('Report API response:', rep);
        console.log('Research API response:', ses);

        /*
         * Your API response is:
         *
         * {
         *   success: true,
         *   data: {
         *     title: "...",
         *     executiveSummary: "...",
         *     keyFindings: [...],
         *     sources: [...]
         *   }
         * }
         *
         * Therefore we need rep.data here.
         */

        const reportData = rep?.data ?? rep;

        if (!reportData) {
          throw new Error('Report data is empty');
        }

        setReport(reportData as ReportType);

        if (ses?.question) {
          setSession({
            question: ses.question,
          });
        }

        setLoading(false);
      } catch (e) {
        if (cancelled) {
          return;
        }

        console.error('Failed to load research report:', e);

        setError(
          e instanceof Error
            ? e.message
            : 'Failed to load report'
        );

        setLoading(false);
      }
    };

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;

      await navigator.clipboard.writeText(url);

      toast(
        'success',
        'Link copied to clipboard'
      );
    } catch {
      toast(
        'error',
        'Failed to copy link'
      );
    }
  };

  const handleExport = () => {
    window.print();

    toast(
      'info',
      "Use your browser's print dialog to save as PDF"
    );
  };

  const handleCitationClick = (index: number) => {
    setCitationIndex(index);
  };

  const handleRetry = () => {
    navigate(`/research/${id}`);
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <PageContainer maxWidth="lg">
        <div className="mb-6 h-20 animate-pulse rounded-2xl border border-neutral-200 bg-white shadow-card" />

        <ReportSkeleton />
      </PageContainer>
    );
  }

  /*
   * Error state
   */
  if (error || !report) {
    return (
      <PageContainer maxWidth="md">
        <ErrorState
          title="Report not available"
          message={
            error ||
            'This research report may still be generating or may have failed.'
          }
          onRetry={handleRetry}
        />
      </PageContainer>
    );
  }

  /*
   * Sources used by the citation modal.
   */
  const sources: CitationSource[] = report.sources ?? [];

  return (
    <PageContainer maxWidth="lg">
      {/* =========================================================
          Report Header
      ========================================================= */}
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
        {/* Back button */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <button
            type="button"
            onClick={() => navigate(`/research/${id}`)}
            className="flex items-center gap-1 transition-colors hover:text-neutral-600"
          >
            <ArrowLeft className="h-3 w-3" />

            Back to research
          </button>
        </div>

        {/* Research question */}
        <h1 className="mt-3 text-balance text-xl font-semibold text-neutral-900">
          {session?.question || report.title || 'Research Report'}
        </h1>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4">
          {/* Copy link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
          >
            <Copy className="h-3.5 w-3.5" />

            Copy Link
          </button>

          {/* Export */}
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
          >
            <Printer className="h-3.5 w-3.5" />

            Export
          </button>

          {/* New research */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-700"
          >
            <PenLine className="h-3.5 w-3.5" />

            New Research
          </button>
        </div>
      </div>

      {/* =========================================================
          Report Content
      ========================================================= */}
      <ReportViewer
        report={report}
        onCitationClick={handleCitationClick}
      />

      {/* =========================================================
          Citation Modal
      ========================================================= */}
      <CitationModal
        index={citationIndex}
        sources={sources}
        onClose={() => setCitationIndex(null)}
      />
    </PageContainer>
  );
}

export default ResearchReport;
