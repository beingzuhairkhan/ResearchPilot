import { Brain, Globe, AlertTriangle, Files } from 'lucide-react';
import type { ResearchSession } from '@/types/research';

interface ResearchMetricsProps {
  session: ResearchSession;
}

export function ResearchMetrics({ session }: ResearchMetricsProps) {
  const metrics = [
    { label: 'Sources', value: session.sourcesFound || 0, icon: Files, color: 'text-primary-600 bg-primary-50' },
    { label: 'Domains', value: session.sourcesAnalyzed || 0, icon: Globe, color: 'text-accent-600 bg-accent-50' },
    { label: 'Recent', value: session.relevantSources || 0, icon: Brain, color: 'text-success-600 bg-success-50' },
    { label: 'Conflicts', value: session.conflictingClaims || 0, icon: AlertTriangle, color: 'text-warning-600 bg-warning-50' },
  ];

  console.log(session)

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div key={m.label} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
            <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${m.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="text-2xl font-semibold text-neutral-900">{m.value}</div>
            <div className="text-xs text-neutral-500">{m.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default ResearchMetrics;
