interface Props {
    coachName: string;
    onMessage: () => void;
}

export default function CoachMobileStickyCta({ coachName, onMessage }: Props) {
    return (
        <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-[color:var(--mk-line)] safe-area-pb">
            <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[color:var(--mk-muted)] truncate">{coachName}</div>
                </div>
                <a
                    href="#programs"
                    className="h-10 px-4 border border-[color:var(--mk-line)] text-black text-xs font-bold uppercase tracking-wider rounded-sm flex items-center hover:bg-[color:var(--mk-paper)] transition-colors shrink-0"
                >
                    Gói tập
                </a>
                <button
                    onClick={onMessage}
                    className="h-10 px-5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-gray-900 transition-colors shrink-0 active:scale-[0.97]"
                >
                    Nhắn tin
                </button>
            </div>
        </div>
    );
}
