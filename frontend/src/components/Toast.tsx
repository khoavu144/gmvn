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
            className={cn(
                'fixed top-4 right-4 z-toast flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg',
                'border transition-colors duration-150',
                'animate-in slide-in-from-top-2 fade-in',
                message.type === 'success'
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                    : 'bg-white text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800'
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
                className={cn(
                    'ml-2 p-0.5 rounded transition-colors',
                    message.type === 'success'
                        ? 'hover:bg-white/20 dark:hover:bg-black/20'
                        : 'hover:bg-red-100 dark:hover:bg-red-900'
                )}
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    ) : null;

    return { toast, ToastComponent };
}