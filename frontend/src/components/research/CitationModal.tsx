import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { ExternalLink, Calendar, Globe } from 'lucide-react';
import type { CitationSource } from '@/types/research';

interface CitationModalProps {
  index: number | null;
  sources: CitationSource[];
  onClose: () => void;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'Unknown date';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return 'Unknown date';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Unknown date';
  }
}

export function CitationModal({ index, sources, onClose }: CitationModalProps) {
  const source =
    index !== null
      ? sources.find((s) => s.citationNumber === index)
      : undefined;

  return (
    <Modal
      open={index !== null}
      onClose={onClose}
      title={index !== null ? `Citation [${index}]` : ''}
      maxWidth="max-w-md"
    >
      {source ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Source</p>
            <p className="mt-1 text-sm font-medium text-neutral-900">{source.title}</p>
            <p className="mt-0.5 text-sm text-neutral-500">{source.domain}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Calendar className="h-3.5 w-3.5" />
            Published {formatDate(source.publishedAt)}
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-neutral-50 p-3">
            <Globe className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <span className="truncate text-xs text-neutral-500">{source.url}</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            icon={<ExternalLink className="h-3.5 w-3.5" />}
            onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
          >
            Open Source
          </Button>
        </div>
      ) : (
        <p className="text-sm text-neutral-500">Citation source not found.</p>
      )}
    </Modal>
  );
}

export default CitationModal;