import { useState } from 'react';

interface ShareButtonProps {
    /** URL to share. Defaults to window.location.href */
    url?: string;
    title?: string;
    text?: string;
    /** Custom label */
    label?: string;
    className?: string;
}

/**
 * Sprint 2 · Share Button
 * Uses Web Share API on mobile, falls back to copy-link on desktop.
 */
export default function ShareButton({ url, title, text, label = 'Chia sẻ', className = '' }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = url ?? window.location.href;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ url: shareUrl, title, text });
            } catch {
                // User cancelled share — ignore
            }
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            type="button"
            onClick={handleShare}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:border-black hover:text-black transition-colors ${className}`}
            title="Chia sẻ hồ sơ này"
        >
            {copied ? (
                <>✓ Đã sao chép!</>
            ) : (
                <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {label}
                </>
            )}
        </button>
    );
}
