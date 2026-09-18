import { useMemo } from 'react';
import type { Report as ReportType, CitationSource } from '@/types/research';

import ReportSection from './ReportSection';
import FindingCard from './FindingCard';
import ConflictCard from './ConflictCard';
import CitationList from './CitationList';
import { Citation } from './Citation';

interface ReportViewerProps {
  report: ReportType;
  onCitationClick: (index: number) => void;
}

function renderTextWithCitations(
  text: unknown,
  sources: CitationSource[],
  onClick: (index: number) => void
) {
  // Prevent `.split()` from being called on undefined/null/non-string values
  if (typeof text !== 'string' || !text.trim()) {
    return null;
  }

  const parts = text.split(/(\[\d+\])/g);

  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/);

    if (match) {
      const index = Number.parseInt(match[1], 10);

      return (
        <Citation
          key={`citation-${index}-${i}`}
          index={index}
          sources={sources}
          onClick={onClick}
        />
      );
    }

    return <span key={`text-${i}`}>{part}</span>;
  });
}

export function ReportViewer({
  report,
  onCitationClick,
}: ReportViewerProps) {
  console.log('ReportViewer report:', report);

  if (!report) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <p className="text-sm text-neutral-500">
          No report data available.
        </p>
      </div>
    );
  }

  const sources: CitationSource[] = Array.isArray(report.sources)
    ? report.sources
    : [];

  /*
   * Normalize methodology.
   */
  const methodologySteps = useMemo(() => {
    if (typeof report.methodology !== 'string') {
      return [];
    }

    return report.methodology
      .split(/\.\s+/)
      .map((step) => step.trim())
      .filter((step) => step.length > 5)
      .map((step) => step.replace(/\.$/, ''));
  }, [report.methodology]);

  /*
   * Normalize key findings.
   *
   * Your API currently returns:
   *
   * keyFindings: [
   *   "Indian organisations are transitioning...",
   *   "91% of Indian leaders prioritize..."
   * ]
   *
   * But FindingCard may expect an object.
   */
  const keyFindings = useMemo(() => {
    if (!Array.isArray(report.keyFindings)) {
      return [];
    }

    return report.keyFindings
      .map((finding, index) => {
        if (typeof finding === 'string') {
          return {
            id: String(index + 1),
            text: finding,
          };
        }

        if (finding && typeof finding === 'object') {
          return {
            ...finding,
            id: String(
              (finding as { id?: string | number }).id ??
                index + 1
            ),
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [report.keyFindings]);

  /*
   * Normalize recent developments.
   *
   * Your API returns strings:
   *
   * recentDevelopments: [
   *   "TCS-Anthropic ... [10]",
   *   "TCS launches ... [26]"
   * ]
   */
  const recentDevelopments = useMemo(() => {
    if (!Array.isArray(report.recentDevelopments)) {
      return [];
    }

    return report.recentDevelopments
      .map((development, index) => {
        if (typeof development === 'string') {
          return {
            id: String(index + 1),
            text: development,
          };
        }

        if (
          development &&
          typeof development === 'object'
        ) {
          const item = development as {
            id?: string | number;
            text?: string;
          };

          return {
            ...development,
            id: String(item.id ?? index + 1),
            text: item.text ?? '',
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [report.recentDevelopments]);

  /*
   * Your API currently returns limitations as a STRING:
   *
   * limitations: "The analysis relies on..."
   *
   * Normalize it to an array.
   */
  const limitations = useMemo(() => {
    if (Array.isArray(report.limitations)) {
      return report.limitations.filter(
        (item): item is string =>
          typeof item === 'string' && item.trim().length > 0
      );
    }

    if (
      typeof report.limitations === 'string' &&
      report.limitations.trim()
    ) {
      return [report.limitations];
    }

    return [];
  }, [report.limitations]);

  return (
    <div className="space-y-6">

      {/* =====================================================
          Executive Summary
      ===================================================== */}
      {typeof report.executiveSummary === 'string' &&
        report.executiveSummary.trim() && (
          <ReportSection title="Executive Summary">
            <div className="prose prose-sm prose-neutral max-w-none">
              <p className="text-sm leading-relaxed text-neutral-700">
                {renderTextWithCitations(
                  report.executiveSummary,
                  sources,
                  onCitationClick
                )}
              </p>
            </div>
          </ReportSection>
        )}


      {keyFindings.length > 0 && (
        <ReportSection
          title="Key Findings"
          subtitle={`${keyFindings.length} findings identified`}
        >
          <div className="space-y-3">
            {keyFindings.map((finding, index) => (
              <FindingCard
                key={finding?.id ?? index}
                finding={finding}
                sources={sources}
                onCitationClick={onCitationClick}
              />
            ))}
          </div>
        </ReportSection>
      )}

      {Array.isArray(report.conflictingEvidence) &&
        report.conflictingEvidence.length > 0 && (
          <ReportSection
            title="Conflicting Evidence"
            subtitle={`${report.conflictingEvidence.length} conflicts detected`}
          >
            <div className="space-y-3">
              {report.conflictingEvidence.map(
                (conflict, index) => (
                  <ConflictCard
                    key={conflict?.id ?? index}
                    conflict={conflict}
                    sources={sources}
                    onCitationClick={onCitationClick}
                  />
                )
              )}
            </div>
          </ReportSection>
        )}

      {recentDevelopments.length > 0 && (
        <ReportSection title="Recent Developments">
          <ul className="space-y-2.5">
            {recentDevelopments.map(
              (development, index) => (
                <li
                  key={development?.id ?? index}
                  className="flex items-start gap-2.5 text-sm text-neutral-700"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />

                  <span className="flex-1">
                    {renderTextWithCitations(
                      development?.text,
                      sources,
                      onCitationClick
                    )}
                  </span>
                </li>
              )
            )}
          </ul>
        </ReportSection>
      )}


      {methodologySteps.length > 0 && (
        <ReportSection
          title="Methodology"
          subtitle="How ResearchPilot researched this topic"
        >
          <ol className="space-y-2.5">
            {methodologySteps.map((step, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm text-neutral-700"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 font-mono text-xs font-medium text-primary-700">
                  {index + 1}
                </span>

                <span className="pt-0.5">
                  {step}.
                </span>
              </li>
            ))}
          </ol>
        </ReportSection>
      )}

      {limitations.length > 0 && (
        <ReportSection title="Limitations">
          <ul className="space-y-2">
            {limitations.map((limitation, index) => (
              <li
                key={index}
                className="flex items-start gap-2.5 text-sm text-neutral-600"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />

                <span>{limitation}</span>
              </li>
            ))}
          </ul>
        </ReportSection>
      )}

      {sources.length > 0 && (
        <CitationList sources={sources} />
      )}
    </div>
  );
}

export default ReportViewer;
