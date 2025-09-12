"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncateText = truncateText;
exports.getTimestamp = getTimestamp;
exports.hashString = hashString;
exports.generateId = generateId;
exports.cleanHtml = cleanHtml;
exports.isValidUrl = isValidUrl;
exports.delay = delay;
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) {
        return text || '';
    }
    return text.slice(0, maxLength).trim() + '...';
}
function getTimestamp() {
    return new Date().toISOString();
}
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
}
function generateId(prefix, source) {
    return `${prefix}-${hashString(source)}-${Date.now()}`;
}
function cleanHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    }
    catch (_) {
        return false;
    }
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
