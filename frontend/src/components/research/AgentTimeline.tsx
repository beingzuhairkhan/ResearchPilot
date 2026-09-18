import {
  Compass,
  Search,
  FolderOpen,
  Database,
  Microscope,
  GitCompare,
  FileText,
  Check,
  Loader2,
} from 'lucide-react';
import type { AgentActivity, AgentType } from '@/types/research';

const agentIcons: Record<AgentType, typeof Compass> = {
  planner: Compass,
  research: Search,
  collector: FolderOpen,
  rag: Database,
  evidence: Microscope,
  comparison: GitCompare,
  report: FileText,
};

const agentColors: Record<AgentType, string> = {
  planner: 'bg-blue-50 text-blue-600',
  research: 'bg-cyan-50 text-cyan-600',
  collector: 'bg-teal-50 text-teal-600',
  rag: 'bg-indigo-50 text-indigo-600',
  evidence: 'bg-violet-50 text-violet-600',
  comparison: 'bg-amber-50 text-amber-600',
  report: 'bg-emerald-50 text-emerald-600',
};

const defaultLabels: Record<AgentType, string> = {
  planner: 'Planner Agent',
  research: 'Research Agent',
  collector: 'Source Collector',
  rag: 'RAG Engine',
  evidence: 'Evidence Analyzer',
  comparison: 'Comparison Agent',
  report: 'Report Generator',
};

function formatTime(ts: string) {
  try {
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  } catch {
    return '--:--:--';
  }
}

export function AgentTimeline({ activities, currentAgent }: { activities: AgentActivity[]; currentAgent?: AgentType }) {
  const allAgents: AgentType[] = ['planner', 'research', 'collector', 'rag', 'evidence', 'comparison', 'report'];
  const activityMap = new Map(activities.map((a) => [a.agent, a]));

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
      <h3 className="mb-1 text-sm font-semibold text-neutral-900">AI Agent Activity</h3>
      <p className="mb-5 text-xs text-neutral-500">Multi-agent research workflow</p>
      <ol className="relative space-y-1">
        {allAgents.map((agent, idx) => {
          const Icon = agentIcons[agent];
          const activity = activityMap.get(agent);
          const isCurrent = currentAgent === agent && !activity;
          const isPending = !activity && !isCurrent;
          const status = activity?.status ?? (isCurrent ? 'active' : 'pending');

          return (
            <li key={agent} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                    status === 'completed'
                      ? agentColors[agent]
                      : status === 'active'
                        ? 'bg-primary-100 text-primary-600 ring-4 ring-primary-50'
                        : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {status === 'active' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
                  {status === 'completed' && (
                    <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-success-500 ring-2 ring-white">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
                {idx < allAgents.length - 1 && (
                  <div className={`mt-0.5 h-8 w-0.5 ${status === 'completed' ? 'bg-neutral-300' : 'bg-neutral-200'}`} />
                )}
              </div>
              <div className="flex-1 pt-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      status === 'completed' ? 'text-neutral-800' : status === 'active' ? 'text-primary-700' : 'text-neutral-400'
                    }`}
                  >
                    {activity?.label ?? defaultLabels[agent]}
                  </span>
                  {activity && <span className="text-[10px] font-mono text-neutral-400">{formatTime(activity.timestamp)}</span>}
                </div>
                <p className={`mt-0.5 text-xs ${status === 'pending' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {status === 'active' ? 'Working...' : activity?.detail ?? 'Pending'}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default AgentTimeline;
