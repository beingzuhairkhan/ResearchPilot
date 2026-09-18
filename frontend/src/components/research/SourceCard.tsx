import { ExternalLink, Calendar } from 'lucide-react';
import type { Source } from '@/types/research';
import { SourceTypeBadge, RelevanceBadge } from '@/components/ui/Badge';

function formatDate(dateStr?: string) {
  if (!dateStr) return 'Unknown date';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function SourceCard({ source }: { source: Source }) {
  return (
    <div className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-card transition-all hover:border-neutral-300 hover:shadow-elevated">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-neutral-100 text-[10px] font-bold uppercase text-neutral-500">
              {source.domain.slice(0, 2)}
            </div>
            <span className="truncate text-sm font-medium text-neutral-700">{source.domain}</span>
          </div>
          <h4 className="mt-2.5 line-clamp-2 text-sm font-semibold text-neutral-900 group-hover:text-primary-700">
            {source.title}
          </h4>
        </div>
      </div>

      {source.snippet && (
        <p className="mt-2 line-clamp-2 text-sm text-neutral-500">{source.snippet}</p>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
        <Calendar className="h-3 w-3" />
        Published {formatDate(source.publishedAt)}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
        <div className="flex items-center gap-2">
          <SourceTypeBadge type={source.sourceType} />
          {source.relevance && <RelevanceBadge relevance={source.relevance} />}
        </div>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
        >
          Read Source
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

export default SourceCard;
