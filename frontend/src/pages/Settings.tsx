import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Server, Info } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { baseURL } from '@/services/api';
import { mockApi } from '@/services/mockApi';

export function Settings() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const useMock = mockApi.isEnabled;

  useEffect(() => {
    if (useMock) {
      setConnected(true);
      return;
    }
    const controller = new AbortController();
    fetch(`${baseURL}/health`, { signal: controller.signal, mode: 'no-cors' })
      .then(() => setConnected(true))
      .catch(() => setConnected(false));
    return () => controller.abort();
  }, [useMock]);

  return (
    <PageContainer maxWidth="md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Settings</h2>
        <p className="mt-0.5 text-sm text-neutral-500">Application and backend configuration</p>
      </div>

      {/* Backend API */}
      <Card className="mb-4">
        <div className="mb-4 flex items-center gap-2">
          <Server className="h-4 w-4 text-neutral-500" />
          <h3 className="text-sm font-semibold text-neutral-900">Backend API</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3">
            <span className="text-sm text-neutral-600">Status</span>
            {connected === null ? (
              <span className="text-xs text-neutral-400">Checking...</span>
            ) : connected ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-success-700">
                <CheckCircle2 className="h-4 w-4" />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-medium text-error-700">
                <XCircle className="h-4 w-4" />
                Disconnected
              </span>
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3">
            <span className="text-sm text-neutral-600">Backend URL</span>
            <span className="font-mono text-xs text-neutral-500">{baseURL}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3">
            <span className="text-sm text-neutral-600">Mock API</span>
            <span className={`text-xs font-medium ${useMock ? 'text-warning-700' : 'text-neutral-500'}`}>
              {useMock ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </Card>

      {/* Application */}
      <Card className="mb-4">
        <div className="mb-4 flex items-center gap-2">
          <Info className="h-4 w-4 text-neutral-500" />
          <h3 className="text-sm font-semibold text-neutral-900">Application</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3">
            <span className="text-sm text-neutral-600">Name</span>
            <span className="text-sm font-medium text-neutral-800">ResearchPilot</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3">
            <span className="text-sm text-neutral-600">Version</span>
            <span className="font-mono text-xs text-neutral-500">1.0.0</span>
          </div>
        </div>
      </Card>

      <p className="text-center text-xs text-neutral-400">
        Track 01 — AI Agents • SerpApi India Hackathon 2026
      </p>
    </PageContainer>
  );
}

export default Settings;
