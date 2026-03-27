export function formatPrice(n: number | string, currency = 'VND'): string {
    const num = Number(n);
    if (isNaN(num)) return 'Liên hệ';
    if (currency === 'VND') return num.toLocaleString('vi-VN') + 'đ';
    return num.toLocaleString('en-US', { style: 'currency', currency });
}
