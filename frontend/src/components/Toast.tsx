import { useState } from 'react';

export function useToast() {
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const toast = {
        success: (text: string) => { setMessage({ text, type: 'success' }); setTimeout(() => setMessage(null), 3000); },
        error: (text: string) => { setMessage({ text, type: 'error' }); setTimeout(() => setMessage(null), 4000); },
    };

    const ToastComponent = message ? (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-xs text-sm font-medium z-50 border ${message.type === 'success'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-400'
            }`}>
            {message.text}
        </div>
    ) : null;

    return { toast, ToastComponent };
}
