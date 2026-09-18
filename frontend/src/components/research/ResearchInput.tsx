import { useState, useEffect } from 'react';
import { Search, ArrowRight, Sparkles } from 'lucide-react';

interface ResearchInputProps {
  onSubmit: (question: string, mode: 'quick' | 'deep') => void;
  loading?: boolean;
  externalQuestion?: string;
}

export function ResearchInput({ onSubmit, loading, externalQuestion }: ResearchInputProps) {
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState<'quick' | 'deep'>('deep');

  useEffect(() => {
    if (externalQuestion !== undefined) {
      setQuestion(externalQuestion);
    }
  }, [externalQuestion]);

  const handleSubmit = () => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed, mode);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-elevated transition-all focus-within:border-primary-300 focus-within:shadow-glow">
      <div className="p-5">
        <label htmlFor="research-input" className="text-sm font-medium text-neutral-500">
          What do you want to research?
        </label>
        <textarea
          id="research-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Research the current adoption of Generative AI in Indian IT companies"
          rows={3}
          className="mt-2 w-full resize-none border-0 bg-transparent text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
          disabled={loading}
          aria-label="Research question input"
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-neutral-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('quick')}
            disabled={loading}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === 'quick'
                ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                : 'text-neutral-500 hover:bg-neutral-100'
            }`}
            aria-pressed={mode === 'quick'}
          >
            Quick
          </button>
          <button
            onClick={() => setMode('deep')}
            disabled={loading}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === 'deep'
                ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                : 'text-neutral-500 hover:bg-neutral-100'
            }`}
            aria-pressed={mode === 'deep'}
          >
            Deep
          </button>
          <span className="ml-1 hidden text-xs text-neutral-400 sm:inline">
            {mode === 'quick' ? '5–10 sources' : '15–30 sources'}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!question.trim() || loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700 active:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Sparkles className="h-4 w-4 animate-pulse" />
              Starting...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Start Research
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ResearchInput;
