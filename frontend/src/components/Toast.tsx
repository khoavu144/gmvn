import { useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function useToast() {
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const toast = {
        success: (text: string) => {
            setMessage({ text, type: 'success' });
            setTimeout(() => setMessage(null), 3000);
        },
        error: (text: string) => {
            setMessage({ text, type: 'error' });
            setTimeout(() => setMessage(null), 4000);
        },
    };

    const dismiss = () => setMessage(null);

    const ToastComponent = message ? (
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={cn(
                'fixed top-4 right-4 z-toast flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg',
                'border transition-colors duration-150',
                'animate-in slide-in-from-top-2 fade-in',
                message.type === 'success'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-red-600 border-red-200'
            )}
        >
            {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
                <XCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
            <button
                onClick={dismiss}
                aria-label="Đóng thông báo"
                className={cn(
                    'ml-2 p-2 rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center',
                    message.type === 'success'
                        ? 'hover:bg-white/20'
                        : 'hover:bg-red-100'
                )}
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    ) : null;

    return { toast, ToastComponent };
}