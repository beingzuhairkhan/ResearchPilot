import { useMemo, useState } from 'react';
import { Filter, ArrowDownWideNarrow } from 'lucide-react';
import type { Source, SourceType } from '@/types/research';
import { SourceCard } from './SourceCard';
import { SourceCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

type FilterType = 'all' | SourceType;
type SortType = 'recent' | 'relevant';

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'web', label: 'Web' },
  { value: 'news', label: 'News' },
  { value: 'scholar', label: 'Scholar' },
  { value: 'company', label: 'Company' },
  { value: 'report', label: 'Reports' },
];

interface SourceListProps {
  sources: Source[];
  loading?: boolean;
}

export function SourceList({ sources, loading }: SourceListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('relevant');
  const [visible, setVisible] = useState(12);

  const filtered = useMemo(() => {
    let result = filter === 'all' ? sources : sources.filter((s) => s.sourceType === filter);
    if (sort === 'recent') {
      result = [...result].sort((a, b) => {
        if (!a.publishedAt) return 1;
        if (!b.publishedAt) return -1;
        return b.publishedAt.localeCompare(a.publishedAt);
      });
    } else {
      result = [...result].sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
    }
    return result;
  }, [sources, filter, sort]);

  const displayed = filtered.slice(0, visible);

  if (loading) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-neutral-900">Sources Analyzed</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SourceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div>
        <h3 className="mb-4 text-base font-semibold text-neutral-900">Sources Analyzed</h3>
        <EmptyState
          title="No sources available yet"
          description="Sources will appear here once the research agent begins collecting information."
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-neutral-900">
          Sources Analyzed
          <span className="ml-2 text-sm font-normal text-neutral-400">{filtered.length} sources</span>
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-1.5 py-1">
            <Filter className="h-3.5 w-3.5 text-neutral-400" />
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setFilter(opt.value); setVisible(12); }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter === opt.value ? 'bg-primary-50 text-primary-700' : 'text-neutral-500 hover:bg-neutral-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-1.5 py-1">
            <ArrowDownWideNarrow className="h-3.5 w-3.5 text-neutral-400" />
            <button
              onClick={() => setSort('relevant')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${sort === 'relevant' ? 'bg-primary-50 text-primary-700' : 'text-neutral-500 hover:bg-neutral-100'}`}
            >
              Most Relevant
            </button>
            <button
              onClick={() => setSort('recent')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${sort === 'recent' ? 'bg-primary-50 text-primary-700' : 'text-neutral-500 hover:bg-neutral-100'}`}
            >
              Recent
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {displayed.map((source) => (
          <SourceCard key={source.id} source={source} />
        ))}
      </div>

      {visible < filtered.length && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setVisible((v) => v + 12)}
            className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Load more sources ({filtered.length - visible} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

export default SourceList;
