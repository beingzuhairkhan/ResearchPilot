import type { Finding, CitationSource } from '@/types/research';
import { Citation } from './Citation';

interface FindingCardProps {
  finding: Finding;
  sources: CitationSource[];
  onCitationClick: (index: number) => void;
}

function renderTextWithCitations(
  text: unknown,
  sources: CitationSource[],
  onClick: (index: number) => void
) {
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

export function FindingCard({ finding, sources, onCitationClick }: FindingCardProps) {
  if (!finding || typeof finding.text !== 'string' || !finding.text.trim()) {
    return null;
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card transition-all hover:shadow-elevated">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 font-mono text-xs font-medium text-primary-500">
          {String(finding.id).padStart(2, '0').slice(-2)}
        </span>
        <div className="flex-1">
          <p className="text-sm text-neutral-800 leading-relaxed">
            {renderTextWithCitations(finding.text, sources, onCitationClick)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default FindingCard;