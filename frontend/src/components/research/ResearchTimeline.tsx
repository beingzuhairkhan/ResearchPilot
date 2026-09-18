import { Check, Loader2, Circle, AlertCircle } from 'lucide-react';
import type { TimelineStep } from '@/types/research';

interface ResearchTimelineProps {
  steps: TimelineStep[];
}

const statusIcon = {
  completed: <Check className="h-3.5 w-3.5 text-white" />,
  active: <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />,
  pending: <Circle className="h-3 w-3 text-neutral-300" />,
  failed: <AlertCircle className="h-3.5 w-3.5 text-white" />,
};

const statusBg = {
  completed: 'bg-success-500',
  active: 'bg-primary-600',
  pending: 'bg-neutral-100',
  failed: 'bg-error-500',
};

const statusText = {
  completed: 'text-neutral-700',
  active: 'text-primary-700 font-medium',
  pending: 'text-neutral-400',
  failed: 'text-error-700',
};

export function ResearchTimeline({ steps }: ResearchTimelineProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
      <h3 className="mb-5 text-sm font-semibold text-neutral-900">Research Timeline</h3>
      <ol className="relative space-y-1">
        {steps.map((step, idx) => (
          <li key={step.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${statusBg[step.status]} ${step.status === 'active' ? 'ring-4 ring-primary-100' : ''}`}>
                {statusIcon[step.status]}
              </div>
              {idx < steps.length - 1 && (
                <div className={`mt-0.5 h-7 w-0.5 ${step.status === 'completed' ? 'bg-success-500' : 'bg-neutral-200'}`} />
              )}
            </div>
            <div className="pt-1">
              <span className={`text-sm ${statusText[step.status]}`}>{step.label}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default ResearchTimeline;
