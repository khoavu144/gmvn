// src/components/ui/FilterModal.tsx
// Bottom sheet filter modal (Q5) · Dark mode · Lucide icons

import { useState, useEffect, useRef } from 'react';
import { X, SlidersHorizontal, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface FilterOption {
    id: string;
    label: string;
    count?: number;
}

interface FilterGroup {
    id: string;
    label: string;
    options: FilterOption[];
    multi?: boolean;
}

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    groups: FilterGroup[];
    selected: Record<string, string[]>;
    onApply: (selected: Record<string, string[]>) => void;
    title?: string;
}

export function FilterModal({
    isOpen,
    onClose,
    groups,
    selected,
    onApply,
    title = 'Bộ lọc',
}: FilterModalProps) {
    const [localSelected, setLocalSelected] = useState<Record<string, string[]>>(selected);
    const modalRef = useRef<HTMLDivElement>(null);

    useFocusTrap(modalRef, isOpen);

    /* eslint-disable react-hooks/set-state-in-effect -- reset draft filters when parent selection or sheet open state changes */
    useEffect(() => {
        setLocalSelected(selected);
    }, [selected, isOpen]);
    /* eslint-enable react-hooks/set-state-in-effect */

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const toggleOption = (groupId: string, optionId: string, multi: boolean = false) => {
        setLocalSelected((prev) => {
            const current = prev[groupId] || [];
            if (multi) {
                return {
                    ...prev,
                    [groupId]: current.includes(optionId)
                        ? current.filter((id) => id !== optionId)
                        : [...current, optionId],
                };
            } else {
                return {
                    ...prev,
                    [groupId]: current.includes(optionId) ? [] : [optionId],
                };
            }
        });
    };

    const handleApply = () => {
        onApply(localSelected);
        onClose();
    };

    const handleReset = () => {
        setLocalSelected({});
    };

    const totalSelected = Object.values(localSelected).flat().length;

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-modal-backdrop lg:hidden"
                onClick={onClose}
            />

            {/* Bottom Sheet */}
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                className={cn(
                    'fixed inset-x-0 bottom-0 z-modal lg:hidden',
                    'bg-white rounded-t-2xl',
                    'max-h-[85vh] overflow-hidden flex flex-col',
                    'animate-in slide-in-from-bottom duration-200'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">{title}
                        {totalSelected > 0 && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-black text-white rounded-full ml-2">
                                {totalSelected}
                            </span>
                        )}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="-mr-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center p-2 text-gray-500 hover:text-gray-600"
                        aria-label="Đóng bộ lọc"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {groups.map((group) => (
                        <div key={group.id}>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                                {group.label}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {group.options.map((option) => {
                                    const isSelected = localSelected[group.id]?.includes(option.id);
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => toggleOption(group.id, option.id, group.multi)}
                                            className={cn(
                                                'chip',
                                                isSelected && 'chip-active'
                                            )}
                                        >
                                            {isSelected && <Check className="w-3 h-3 mr-1" />}
                                            {option.label}
                                            {option.count !== undefined && (
                                                <span className="ml-1 text-xs opacity-60">
                                                    ({option.count})
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={handleReset}
                        className="flex-1 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        Đặt lại
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 py-2.5 text-sm font-bold bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Áp dụng{totalSelected > 0 && ` (${totalSelected})`}
                    </button>
                </div>
            </div>
        </>
    );
}

// Filter trigger button
export function FilterButton({
    count,
    onClick,
}: {
    count?: number;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                count && count > 0
                    ? 'bg-black text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            )}
        >
            <SlidersHorizontal className="w-4 h-4" />
            Bộ lọc
            {count && count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded">
                    {count}
                </span>
            )}
        </button>
    );
}