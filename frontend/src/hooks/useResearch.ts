import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { researchApi } from '@/services/researchApi';

import type {
  ResearchSession,
  ResearchPlan,
  Source,
} from '@/types/research';

export function useResearch(
  researchId: string | undefined,
) {
  const [session, setSession] =
    useState<ResearchSession | null>(null);

  const [plan, setPlan] =
    useState<ResearchPlan | null>(null);

  const [sources, setSources] =
    useState<Source[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    if (!researchId) return null;

    try {
      const response =
        await researchApi.getResearch(
          researchId,
        );

      const data =
        response?.data ?? response;

      setSession(data);
      setError(null);

      return data;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Failed to load research',
      );

      return null;
    }
  }, [researchId]);

  const fetchPlan = useCallback(async () => {
    if (!researchId) return null;

    try {
      const response =
        await researchApi.getResearchPlan(
          researchId,
        );

      const data =
        response?.data ?? response;

      setPlan(data);

      return data;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Failed to load research plan',
      );

      return null;
    }
  }, [researchId]);

  const fetchSources = useCallback(async () => {
    if (!researchId) return [];

    try {
      const response =
        await researchApi.getResearchSources(
          researchId,
        );

      const data = Array.isArray(response)
        ? response
        : response?.data ?? [];

      setSources(data);

      return data;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Failed to load sources',
      );

      return [];
    }
  }, [researchId]);

  const fetchAll = useCallback(async () => {
    if (!researchId) return;

    setLoading(true);

    await fetchSession();

    await Promise.allSettled([
      fetchPlan(),
      fetchSources(),
    ]);

    setLoading(false);
  }, [
    researchId,
    fetchSession,
    fetchPlan,
    fetchSources,
  ]);

  useEffect(() => {
    if (!researchId) return;

    fetchAll();
  }, [researchId, fetchAll]);

  return {
    session,
    setSession,
    plan,
    setPlan,
    sources,
    setSources,
    loading,
    error,
    refetch: fetchAll,
    fetchSession,
    fetchSources,
  };
}