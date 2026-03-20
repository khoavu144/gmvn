import type { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: ReactNode;
    title?: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    numberIcon?: string | number; // For the "0" style empty state
}

export function EmptyState({ icon, title, description, action, numberIcon }: EmptyStateProps) {
    return (
        <div className="empty-state">
            {numberIcon !== undefined ? (
                <div className="empty-state-number">{numberIcon}</div>
            ) : icon ? (
                <div className="mb-4 text-gray-300 flex justify-center">{icon}</div>
            ) : null}
            
            {title && <h3 className="text-lg font-bold text-[color:var(--mk-text)]">{title}</h3>}
            {description && (
                <p className="mt-2 text-sm text-[color:var(--mk-muted)] max-w-md mx-auto">
                    {description}
                </p>
            )}
            
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-6 btn-primary"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
