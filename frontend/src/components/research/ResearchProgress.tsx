import { CircularProgress } from '@/components/ui/Progress';

interface ResearchProgressProps {
  progress: number;
  currentStep: string;
}

export function ResearchProgress({ progress, currentStep }: ResearchProgressProps) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-neutral-200 bg-white p-8 shadow-card sm:flex-row sm:gap-8">
      <CircularProgress value={progress} size={120} />
      <div className="flex-1 text-center sm:text-left">
        <p className="text-xs font-medium uppercase tracking-wider text-primary-600">Research Progress</p>
        <h2 className="mt-1 text-xl font-semibold text-neutral-900">
          {progress >= 100 ? 'Research complete' : 'Researching...'}
        </h2>
        <p className="mt-1.5 text-sm text-neutral-500">
          {currentStep || 'Initializing research session...'}
        </p>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default ResearchProgress;
