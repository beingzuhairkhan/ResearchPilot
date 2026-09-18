import type { ReactNode } from 'react';

interface ReportSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function ReportSection({ title, subtitle, children, className = '' }: ReportSectionProps) {
  return (
    <section className={`rounded-2xl border border-neutral-200 bg-white p-6 shadow-card animate-fade-in ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export default ReportSection;
