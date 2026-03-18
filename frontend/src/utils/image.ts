/**
 * Helper to generate responsive Supabase image URLs.
 * NOTE: This requires Supabase Storage Image Transformations to be enabled on the project.
 */

export function getOptimizedUrl(url: string, width: number, format: 'webp' | 'avif' | 'origin' = 'webp') {
    if (!url || typeof url !== 'string') return url;
    // Only optimize if it's a supabase storage URL
    if (!url.includes('supabase.co/storage/v1/object/public')) return url;
  
    // Check if URL already has query params
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&format=${format}`;
}
  
export function getSrcSet(url: string, widths = [400, 800, 1200]) {
    if (!url || !url.includes('supabase.co')) return undefined;
    
    return widths.map(w => `${getOptimizedUrl(url, w)} ${w}w`).join(', ');
}
