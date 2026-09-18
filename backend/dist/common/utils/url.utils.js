"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeUrl = normalizeUrl;
exports.getCanonicalUrl = getCanonicalUrl;
exports.getDomain = getDomain;
exports.generateContentHash = generateContentHash;
exports.generateUrlHash = generateUrlHash;
exports.isSimilarTitle = isSimilarTitle;
exports.isRecentDate = isRecentDate;
exports.extractDomainFromUrl = extractDomainFromUrl;
const crypto = __importStar(require("crypto"));
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
function normalizeUrl(rawUrl) {
    try {
        const url = new URL(rawUrl);
        TRACKING_PARAMS.forEach((param) => url.searchParams.delete(param));
        url.hash = '';
        let normalized = url.toString();
        normalized = normalized.replace(/\/$/, '');
        return normalized.toLowerCase();
    }
    catch {
        return rawUrl.toLowerCase().trim();
    }
}
function getCanonicalUrl(rawUrl) {
    try {
        const url = new URL(rawUrl);
        TRACKING_PARAMS.forEach((param) => url.searchParams.delete(param));
        url.hash = '';
        const host = url.hostname.replace(/^www\./, '');
        const path = url.pathname.replace(/\/$/, '');
        return `${host}${path}`.toLowerCase();
    }
    catch {
        return rawUrl.toLowerCase().trim();
    }
}
function getDomain(rawUrl) {
    try {
        const url = new URL(rawUrl);
        return url.hostname.replace(/^www\./, '').toLowerCase();
    }
    catch {
        return '';
    }
}
function generateContentHash(content) {
    return crypto.createHash('sha256').update(content.trim()).digest('hex');
}
function generateUrlHash(url) {
    return crypto.createHash('sha256').update(normalizeUrl(url)).digest('hex');
}
function isSimilarTitle(titleA, titleB, threshold = 0.85) {
    const a = titleA.toLowerCase().trim();
    const b = titleB.toLowerCase().trim();
    if (a === b)
        return true;
    if (a.length === 0 || b.length === 0)
        return false;
    const setA = new Set(a.split(/\s+/));
    const setB = new Set(b.split(/\s+/));
    const intersection = [...setA].filter((w) => setB.has(w)).length;
    const union = new Set([...setA, ...setB]).size;
    const jaccard = intersection / union;
    return jaccard >= threshold;
}
function isRecentDate(date, monthsThreshold = 6) {
    if (!date)
        return false;
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime()))
        return false;
    const threshold = new Date();
    threshold.setMonth(threshold.getMonth() - monthsThreshold);
    return d >= threshold;
}
function extractDomainFromUrl(url) {
    return getDomain(url);
}
//# sourceMappingURL=url.utils.js.map