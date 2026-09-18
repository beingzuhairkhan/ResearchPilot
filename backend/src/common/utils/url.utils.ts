import * as crypto from 'crypto';

const TRACKING_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'ref',
  'ref_src',
];

export function normalizeUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    TRACKING_PARAMS.forEach((param) => url.searchParams.delete(param));
    url.hash = '';
    let normalized = url.toString();
    normalized = normalized.replace(/\/$/, '');
    return normalized.toLowerCase();
  } catch {
    return rawUrl.toLowerCase().trim();
  }
}

export function getCanonicalUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    TRACKING_PARAMS.forEach((param) => url.searchParams.delete(param));
    url.hash = '';
    const host = url.hostname.replace(/^www\./, '');
    const path = url.pathname.replace(/\/$/, '');
    return `${host}${path}`.toLowerCase();
  } catch {
    return rawUrl.toLowerCase().trim();
  }
}

export function getDomain(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    return url.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

export function generateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content.trim()).digest('hex');
}

export function generateUrlHash(url: string): string {
  return crypto.createHash('sha256').update(normalizeUrl(url)).digest('hex');
}

export function isSimilarTitle(titleA: string, titleB: string, threshold = 0.85): boolean {
  const a = titleA.toLowerCase().trim();
  const b = titleB.toLowerCase().trim();
  if (a === b) return true;
  if (a.length === 0 || b.length === 0) return false;
  const setA = new Set(a.split(/\s+/));
  const setB = new Set(b.split(/\s+/));
  const intersection = [...setA].filter((w) => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  const jaccard = intersection / union;
  return jaccard >= threshold;
}

export function isRecentDate(date: Date | string | null, monthsThreshold = 6): boolean {
  if (!date) return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return false;
  const threshold = new Date();
  threshold.setMonth(threshold.getMonth() - monthsThreshold);
  return d >= threshold;
}

export function extractDomainFromUrl(url: string): string {
  return getDomain(url);
}
