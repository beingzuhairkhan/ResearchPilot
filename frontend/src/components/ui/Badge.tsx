import type { ResearchStatus, TaskStatus, SourceType, Relevance } from '@/types/research';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'neutral';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-neutral-100 text-neutral-600',
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  error: 'bg-error-50 text-error-700',
  neutral: 'bg-neutral-200 text-neutral-700',
};

export function Badge({
  variant = 'default',
  children,
  className = '',
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

const statusMap: Record<ResearchStatus, { variant: BadgeVariant; label: string }> = {
  queued: { variant: 'neutral', label: 'Queued' },
  planning: { variant: 'primary', label: 'Planning' },
  researching: { variant: 'primary', label: 'Researching' },
  analyzing: { variant: 'primary', label: 'Analyzing' },
  completed: { variant: 'success', label: 'Completed' },
  failed: { variant: 'error', label: 'Failed' },
};

export function StatusBadge({ status }: { status: ResearchStatus }) {
  const { variant, label } = statusMap[status] ?? statusMap.queued;
  return (
    <Badge variant={variant}>
      {status === 'researching' || status === 'planning' || status === 'analyzing' ? (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      ) : null}
      {label}
    </Badge>
  );
}

const taskStatusMap: Record<TaskStatus, { variant: BadgeVariant; label: string }> = {
  pending: { variant: 'neutral', label: 'Pending' },
  in_progress: { variant: 'primary', label: 'In Progress' },
  completed: { variant: 'success', label: 'Completed' },
  failed: { variant: 'error', label: 'Failed' },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const { variant, label } = taskStatusMap[status] ?? taskStatusMap.pending;
  return <Badge variant={variant}>{label}</Badge>;
}

const sourceTypeMap: Record<SourceType, { variant: BadgeVariant; label: string }> = {
  web: { variant: 'default', label: 'Web' },
  news: { variant: 'primary', label: 'News' },
  scholar: { variant: 'warning', label: 'Scholar' },
  company: { variant: 'neutral', label: 'Company' },
  report: { variant: 'success', label: 'Report' },
};

export function SourceTypeBadge({ type }: { type: SourceType }) {
  const { variant, label } = sourceTypeMap[type] ?? sourceTypeMap.web;
  return <Badge variant={variant}>{label}</Badge>;
}

const relevanceMap: Record<Relevance, { variant: BadgeVariant; label: string }> = {
  high: { variant: 'success', label: 'High' },
  medium: { variant: 'warning', label: 'Medium' },
  low: { variant: 'neutral', label: 'Low' },
};

export function RelevanceBadge({ relevance }: { relevance: Relevance }) {
  const { variant, label } = relevanceMap[relevance] ?? relevanceMap.low;
  return <Badge variant={variant}>Relevance: {label}</Badge>;
}

export default Badge;
