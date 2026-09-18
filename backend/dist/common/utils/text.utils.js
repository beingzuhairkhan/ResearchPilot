"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncateText = truncateText;
exports.cleanHtml = cleanHtml;
exports.normalizeWhitespace = normalizeWhitespace;
exports.extractSnippet = extractSnippet;
function truncateText(text, maxLen) {
    if (text.length <= maxLen)
        return text;
    return text.slice(0, maxLen - 3) + '...';
}
function cleanHtml(html) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}
function normalizeWhitespace(text) {
    return text.replace(/\s+/g, ' ').trim();
}
function extractSnippet(text, maxLen = 300) {
    const cleaned = normalizeWhitespace(text);
    return truncateText(cleaned, maxLen);
}
//# sourceMappingURL=text.utils.js.map