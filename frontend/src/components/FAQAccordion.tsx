import { useState } from 'react';
import type { FAQItem } from '../data/faqData';

export function FAQAccordion({ items }: { items: FAQItem[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="border border-gray-200 rounded-xs divide-y divide-gray-200 bg-white">
            {items.map((item, i) => (
                <div key={i}>
                    <button
                        type="button"
                        onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        className="w-full flex justify-between items-start gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 focus-visible:ring-offset-2"
                        aria-expanded={openIndex === i}
                    >
                        <span className="text-sm font-medium text-black leading-relaxed">{item.q}</span>
                        <span className="text-gray-500 font-mono text-xs mt-0.5 flex-shrink-0 w-4 text-right">
                            {openIndex === i ? '−' : '+'}
                        </span>
                    </button>
                    {openIndex === i && (
                        <div className="px-5 pb-5 pt-1 bg-gray-50 border-t border-gray-200">
                            <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
