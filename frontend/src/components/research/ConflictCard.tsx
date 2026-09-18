import { AlertTriangle, ArrowRight } from 'lucide-react';
import type { Conflict } from '@/types/research';

interface ConflictCardProps {
  conflict: Conflict;
}

export function ConflictCard({ conflict }: ConflictCardProps) {
  if (!conflict) return null;

  return (
    <div className="rounded-xl border border-warning-200 bg-warning-50/30 p-5 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-warning-600" />
        <h4 className="text-sm font-semibold text-neutral-900">{conflict.topic}</h4>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              Source A
            </span>
          </div>
          <p className="text-sm text-neutral-700">{conflict.claimA}</p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              Source B
            </span>
          </div>
          <p className="text-sm text-neutral-700">{conflict.claimB}</p>
        </div>
      </div>

      {conflict.possibleReason && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-white/60 p-3">
          <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
          <p className="text-xs text-neutral-600">
            <span className="font-medium text-neutral-700">Possible explanation: </span>
            {conflict.possibleReason}
          </p>
        </div>
      )}
    </div>
  );
}

export default ConflictCard;