// src/components/ui/FilterModal.tsx
// Bottom sheet filter modal (Q5) · Dark mode · Lucide icons

import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

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

    /* eslint-disable react-hooks/set-state-in-effect -- reset draft filters when parent selection or sheet open state changes */
    useEffect(() => {
        setLocalSelected(selected);
    }, [selected, isOpen]);
    /* eslint-enable react-hooks/set-state-in-effect */

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
                className={cn(
                    'fixed inset-x-0 bottom-0 z-modal lg:hidden',
                    'bg-white dark:bg-gray-900 rounded-t-2xl',
                    'max-h-[85vh] overflow-hidden flex flex-col',
                    'animate-in slide-in-from-bottom duration-200'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[color:var(--mk-line)] dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-[color:var(--mk-text-soft)] dark:text-[color:var(--mk-muted)]" />
                        <h3 className="font-semibold text-[color:var(--mk-text)] dark:text-white">{title}</h3>
                        {totalSelected > 0 && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-black dark:bg-white text-white dark:text-black rounded-full">
                                {totalSelected}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-[color:var(--mk-muted)] hover:text-[color:var(--mk-text-soft)] dark:text-[color:var(--mk-muted)] dark:hover:text-gray-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {groups.map((group) => (
                        <div key={group.id}>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[color:var(--mk-muted)] dark:text-[color:var(--mk-muted)] mb-3">
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
                <div className="flex items-center gap-3 px-4 py-3 border-t border-[color:var(--mk-line)] dark:border-gray-800 bg-[color:var(--mk-paper)] dark:bg-gray-800/50">
                    <button
                        onClick={handleReset}
                        className="flex-1 py-2.5 text-sm font-medium text-[color:var(--mk-text-soft)] dark:text-[color:var(--mk-muted)] hover:text-[color:var(--mk-text)] dark:hover:text-white transition-colors"
                    >
                        Đặt lại
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 py-2.5 text-sm font-bold bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-[color:var(--mk-paper)] transition-colors"
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
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-[color:var(--mk-paper)] dark:bg-gray-800 text-[color:var(--mk-text-soft)] dark:text-gray-300 hover:bg-[color:var(--mk-paper-strong)] dark:hover:bg-gray-700'
            )}
        >
            <SlidersHorizontal className="w-4 h-4" />
            Bộ lọc
            {count && count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 dark:bg-black/20 rounded">
                    {count}
                </span>
            )}
        </button>
    );
}