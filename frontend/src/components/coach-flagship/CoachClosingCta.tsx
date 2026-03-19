interface Props {
    coachName: string;
    onMessage: () => void;
}

export default function CoachClosingCta({ coachName, onMessage }: Props) {
    return (
        <section className="py-16 sm:py-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
                    Bắt đầu hành trình
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black mb-4">
                    Sẵn sàng thay đổi cùng {coachName.split(' ').pop()}?
                </h2>
                <p className="text-base text-gray-500 leading-relaxed max-w-md mx-auto mb-8">
                    Liên hệ ngay để được tư vấn chương trình tập luyện phù hợp nhất với mục tiêu và thể trạng của bạn.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={onMessage}
                        className="h-14 px-10 bg-black text-white font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-gray-900 transition-all active:scale-[0.98] shadow-lg shadow-black/20"
                    >
                        Nhắn tin cho Coach
                    </button>
                    <a
                        href="#programs"
                        className="h-14 px-10 border border-gray-300 text-black font-bold text-sm uppercase tracking-wider rounded-sm hover:border-black transition-all flex items-center"
                    >
                        Xem gói tập
                    </a>
                </div>
            </div>
        </section>
    );
}
