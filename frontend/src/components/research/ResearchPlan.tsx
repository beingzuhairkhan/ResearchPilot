import { Target } from 'lucide-react';
import type { ResearchPlan as ResearchPlanType } from '@/types/research';
import ResearchTaskCard from './ResearchTaskCard';
import { ResearchPlanSkeleton } from '@/components/ui/Skeleton';

interface ResearchPlanProps {
  plan: ResearchPlanType | null;
  loading?: boolean;
}

export function ResearchPlan({
  plan,
  loading,
}: ResearchPlanProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
        <h3 className="mb-1 text-sm font-semibold text-neutral-900">
          Research Plan
        </h3>

        <p className="mb-5 text-xs text-neutral-500">
          AI-generated research strategy
        </p>

        <ResearchPlanSkeleton />
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const tasks = plan.tasks ?? [];

  const completed = tasks.filter(
    (task) => task.status === 'completed'
  ).length;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-neutral-900">
          Research Plan
        </h3>

        <p className="mt-0.5 text-xs text-neutral-500">
          AI-generated research strategy
        </p>
      </div>

      <div className="mb-5 flex items-start gap-3 rounded-xl bg-neutral-50 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100">
          <Target className="h-4 w-4 text-primary-700" />
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            Objective
          </p>

          <p className="mt-0.5 text-sm text-neutral-800">
            {plan.objective}
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-medium text-neutral-500">
          {tasks.length} research tasks
        </p>

        <p className="text-xs text-neutral-400">
          {completed}/{tasks.length} completed
        </p>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <ResearchTaskCard
            key={task.id}
            task={task}
          />
        ))}
      </div>
    </div>
  );
}

export default ResearchPlan;