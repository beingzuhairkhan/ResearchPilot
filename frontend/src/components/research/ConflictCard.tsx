import { AlertTriangle, ArrowRight } from 'lucide-react';
import type { Conflict, CitationSource } from '@/types/research';
import { Citation } from './Citation';

interface ConflictCardProps {
  conflict: Conflict;
  sources: CitationSource[];
  onCitationClick: (index: number) => void;
}

export function ConflictCard({ conflict, sources, onCitationClick }: ConflictCardProps) {
  return (
    <div className="rounded-xl border border-warning-200 bg-warning-50/30 p-5 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-warning-600" />
        <h4 className="text-sm font-semibold text-neutral-900">{conflict.topic}</h4>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">Source A</span>
            <Citation index={conflict.sourceA.sourceRef} sources={sources} onClick={onCitationClick} />
          </div>
          <p className="text-sm text-neutral-700">"{conflict.sourceA.claim}"</p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">Source B</span>
            <Citation index={conflict.sourceB.sourceRef} sources={sources} onClick={onCitationClick} />
          </div>
          <p className="text-sm text-neutral-700">"{conflict.sourceB.claim}"</p>
        </div>
      </div>

      {conflict.explanation && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-white/60 p-3">
          <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
          <p className="text-xs text-neutral-600">
            <span className="font-medium text-neutral-700">Possible explanation: </span>
            {conflict.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

export default ConflictCard;
