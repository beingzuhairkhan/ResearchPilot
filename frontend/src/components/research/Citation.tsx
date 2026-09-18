import type { CitationSource } from '@/types/research';

interface CitationProps {
  index: number;
  sources: CitationSource[];
  onClick: (index: number) => void;
}

export function Citation({ index, onClick }: CitationProps) {
  return (
    <button
      onClick={() => onClick(index)}
      className="inline-flex h-5 min-w-[20px] items-center justify-center rounded px-1 font-mono text-[11px] font-medium text-primary-600 transition-colors hover:bg-primary-100 hover:text-primary-700"
      aria-label={`View citation ${index}`}
    >
      [{index}]
    </button>
  );
}

export default Citation;
