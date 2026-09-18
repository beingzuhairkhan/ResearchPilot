import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

const maxWidths = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-none',
};

export function PageContainer({ children, maxWidth = 'xl', className = '' }: PageContainerProps) {
  return (
    <main className={`mx-auto w-full ${maxWidths[maxWidth]} px-4 py-6 sm:px-6 sm:py-8 ${className}`}>
      {children}
    </main>
  );
}

export default PageContainer;
