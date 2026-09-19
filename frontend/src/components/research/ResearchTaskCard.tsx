import { Check, Loader2, Clock, FileText } from 'lucide-react';
import type { ResearchTask, TaskStatus } from '@/types/research';
import { Hash } from 'lucide-react';
const statusIcon: Record<TaskStatus, React.ReactNode> = {
  completed: <Check className="h-3.5 w-3.5 text-white" />,
  in_progress: <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />,
  pending: <Clock className="h-3.5 w-3.5 text-neutral-400" />,
  failed: <Clock className="h-3.5 w-3.5 text-error-500" />,
};

const statusBg: Record<TaskStatus, string> = {
  completed: 'bg-success-500',
  in_progress: 'bg-primary-600',
  pending: 'bg-neutral-100',
  failed: 'bg-error-100',
};

export function ResearchTaskCard({ task }: { task: ResearchTask }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card transition-all hover:shadow-elevated">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
       
          <div>
            <div className="flex items-center gap-2">
             <Hash className="w-3.5 h-3.5 text-neutral-400" />
              <h4 className="text-sm font-semibold text-neutral-900">{task.type}</h4>
            </div>
            <p className="mt-1 text-sm text-neutral-600">{task.query}</p>
            <p className="mt-1 text-xs text-neutral-400">{task.purpose}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {task.sourcesFound !== undefined && task.sourcesFound > 0 && (
            <span className="flex items-center gap-1 text-xs text-neutral-400">
              <FileText className="h-3 w-3" />
              {task.sourcesFound} sources
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResearchTaskCard;
