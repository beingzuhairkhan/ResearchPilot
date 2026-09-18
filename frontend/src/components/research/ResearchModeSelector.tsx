import { Zap, Layers } from 'lucide-react';
import type { ResearchMode } from '@/types/research';

interface ResearchModeSelectorProps {
  mode: ResearchMode;
  onChange: (mode: ResearchMode) => void;
}

export function ResearchModeSelector({ mode, onChange }: ResearchModeSelectorProps) {
  const modes: { value: ResearchMode; label: string; desc: string; sources: string; icon: typeof Zap }[] = [
    { value: 'quick', label: 'Quick', desc: 'Fast research', sources: '5–10 sources', icon: Zap },
    { value: 'deep', label: 'Deep', desc: 'Detailed research', sources: '15–30 sources', icon: Layers },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {modes.map((m) => {
        const Icon = m.icon;
        const active = mode === m.value;
        return (
          <button
            key={m.value}
            onClick={() => onChange(m.value)}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
              active
                ? 'border-primary-300 bg-primary-50/50 shadow-soft'
                : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
            }`}
            aria-pressed={active}
          >
            <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${active ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-500'}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className={`text-sm font-semibold ${active ? 'text-primary-900' : 'text-neutral-800'}`}>{m.label}</div>
              <div className="mt-0.5 text-xs text-neutral-500">{m.desc}</div>
              <div className="mt-1 text-xs text-neutral-400">{m.sources}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ResearchModeSelector;
