/**
 * Generate URL-friendly slug from text
 * Removes diacritics, converts to lowercase, replaces spaces with hyphens
 * Example: "Nguyễn Diệu Nhi" -> "nguyen-dieu-nhi"
 */
export const generateSlug = (text: string): string => {
    if (!text) return '';

    return text
        .toLowerCase()
        .trim()
        // Remove diacritics (Vietnamese characters)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // Remove special characters, keep only alphanumeric and spaces
        .replace(/[^\w\s-]/g, '')
        // Replace spaces with hyphens
        .replace(/\s+/g, '-')
        // Remove multiple consecutive hyphens
        .replace(/-+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-+|-+$/g, '');
};

/**
 * Generate unique slug with counter if needed
 * Example: "nguyen-dieu-nhi", "nguyen-dieu-nhi-2", "nguyen-dieu-nhi-3"
 */
export const generateUniqueSlug = (text: string, existingSlugs: string[]): string => {
    let slug = generateSlug(text);

    if (!existingSlugs.includes(slug)) {
        return slug;
    }

    let counter = 2;
    while (existingSlugs.includes(`${slug}-${counter}`)) {
        counter++;
    }

    return `${slug}-${counter}`;
};
