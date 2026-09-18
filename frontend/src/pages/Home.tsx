import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Brain, Search, GitCompare, FileText, Database } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import ResearchInput from '@/components/research/ResearchInput';
import { useToast } from '@/components/ui/Toast';
import { researchApi } from '@/services/researchApi';
import type { ResearchMode } from '@/types/research';

const examples = [
  'Research the current adoption of Generative AI in Indian IT companies.',
  'What are the latest trends in AI coding assistants?',
  'Research the current state of electric vehicle adoption in India.',
  'Compare the major approaches to enterprise RAG systems.',
];

const features = [
  { icon: Compass, title: 'AI Planning', desc: 'Break complex questions into focused research tasks.' },
  { icon: Search, title: 'Live Web Research', desc: 'Search current information across web, news, and research sources.' },
  { icon: Database, title: 'Evidence & RAG', desc: 'Retrieve relevant evidence from the sources collected during your investigation.' },
  { icon: GitCompare, title: 'Source Comparison', desc: 'Identify agreements, conflicts, and differences across sources.' },
  { icon: FileText, title: 'Citation-Backed Reports', desc: 'Every major finding is connected to its underlying sources.' },
  { icon: Brain, title: 'Multi-Agent Architecture', desc: 'Specialized AI agents collaborate to produce comprehensive research.' },
];

export function Home() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [exampleQuestion, setExampleQuestion] = useState('');

  const handleSubmit = async (question: string, mode: ResearchMode) => {
    setLoading(true);
    try {
      const result = await researchApi.createResearch(question, mode);
      // console.log(result)
      toast('success', 'Research started! Watch the AI agents work.');
      navigate(`/research/${result.data.researchId}`);
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Failed to start research');
      setLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="2xl">
      <div className="flex flex-col items-center pt-8 sm:pt-16">
        <div className="mb-6 flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 shadow-soft">
          <span className="h-2 w-2 rounded-full bg-success-500 animate-pulse" />
          <span className="text-xs font-medium text-neutral-600">AI Research Agent • SerpApi India Hackathon 2026</span>
        </div>

        <h1 className="max-w-3xl text-center text-4xl font-semibold tracking-tight text-neutral-900 text-balance sm:text-5xl">
          Research anything.{' '}
          <span className="text-primary-600">Understand everything.</span>
        </h1>

        <p className="mt-4 max-w-2xl text-center text-base text-neutral-500 sm:text-lg text-balance">
          ResearchPilot plans your research, searches the live web, compares evidence, and generates a citation-backed report.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <ResearchInput onSubmit={handleSubmit} loading={loading} externalQuestion={exampleQuestion} />
      </div>

      <div className="mx-auto mt-6 max-w-3xl">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-400">Try an example</p>
        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => setExampleQuestion(ex)}
              className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs text-neutral-600 transition-all hover:border-primary-200 hover:bg-primary-50/50 hover:text-primary-700"
            >
              {ex.length > 50 ? ex.slice(0, 50) + '...' : ex}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-5xl">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card transition-all hover:shadow-elevated hover:border-neutral-300"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">{f.title}</h3>
                <p className="mt-1 text-sm text-neutral-500">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}

export default Home;
