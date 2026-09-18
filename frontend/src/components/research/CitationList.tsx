import type { CitationSource } from '@/types/research';
import { ExternalLink, Calendar } from 'lucide-react';

interface CitationListProps {
  sources: CitationSource[];
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return null;
  }
}

export function CitationList({ sources }: CitationListProps) {
  if (sources.length === 0) return null;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
      <h3 className="mb-1 text-base font-semibold text-neutral-900">Sources</h3>
      <p className="mb-5 text-xs text-neutral-500">All sources referenced in this report</p>
      <ol className="space-y-3">
        {sources.map((source) => {
          const date = formatDate(source.publishedAt);
          return (
            <li key={source.index} className="flex items-start gap-3 rounded-lg border border-neutral-100 p-3 transition-colors hover:bg-neutral-50">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-50 font-mono text-xs font-semibold text-primary-700">
                {source.index}
              </span>
              <div className="min-w-0 flex-1">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-1.5 text-sm font-medium text-neutral-800 hover:text-primary-700"
                >
                  <span className="line-clamp-1">{source.title}</span>
                  <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-400">
                  <span>{source.domain}</span>
                  {date && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {date}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default CitationList;
