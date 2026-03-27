export function truncateMetaDescription(text: string, maxLen: number): string {
    const trimmed = text.trim();
    if (trimmed.length <= maxLen) return trimmed;
    const slice = trimmed.slice(0, maxLen);
    const lastSpace = slice.lastIndexOf(' ');
    const head = lastSpace > 40 ? slice.slice(0, lastSpace) : slice;
    return `${head.trimEnd()}…`;
}
