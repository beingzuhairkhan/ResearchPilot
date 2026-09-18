import type { Finding, CitationSource } from '@/types/research';
import { Citation } from './Citation';

interface FindingCardProps {
  finding: Finding;
  sources: CitationSource[];
  onCitationClick: (index: number) => void;
}

export function FindingCard({ finding, sources, onCitationClick }: FindingCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card transition-all hover:shadow-elevated">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 font-mono text-xs font-medium text-primary-500">
          {String(finding.id).padStart(2, '0').slice(-2)}
        </span>
        <div className="flex-1">
          <p className="text-sm text-neutral-800 leading-relaxed">{finding.statement}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {/* Added optional chaining and empty array fallback */}
            {finding.citations?.map((ref) => (
              <Citation key={ref} index={ref} sources={sources} onClick={onCitationClick} />
            )) || null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindingCard;