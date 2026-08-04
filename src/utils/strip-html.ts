/**
 * Cleans HTML string by removing HTML tags and decoding standard HTML entities.
 */
export function stripHtml(html?: string | null): string {
    if (!html) return '';

    let text = html.replace(/<[^>]+>/g, ' ');

    text = text
        .replace(/&nbsp;/gi, ' ')
        .replace(/&ndash;/gi, '–')
        .replace(/&mdash;/gi, '—')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&apos;/gi, "'")
        .replace(/&#39;/gi, "'")
        .replace(/&deg;/gi, '°')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&ldquo;/gi, '“')
        .replace(/&rdquo;/gi, '”')
        .replace(/&laquo;/gi, '«')
        .replace(/&raquo;/gi, '»')
        .replace(/&middot;/gi, '·')
        .replace(/&bull;/gi, '•')
        .replace(/&reg;/gi, '®')
        .replace(/&copy;/gi, '©')
        .replace(/&trade;/gi, '™');

    return text.replace(/\s+/g, ' ').trim();
}
