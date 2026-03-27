import { Star } from 'lucide-react';

export function StarRating({ rating }: { rating: number }) {
    const rounded = Math.round(rating);
    return (
        <div className="mpd-stars" role="img" aria-label={`Đánh giá ${rating}/5`}>
            {[1, 2, 3, 4, 5].map((index) => (
                <Star
                    key={index}
                    className={`h-4 w-4 shrink-0 ${index <= rounded ? 'fill-amber-400 text-amber-500' : 'text-[color:var(--cur-outline-var)]'}`}
                    strokeWidth={1.5}
                    aria-hidden
                />
            ))}
        </div>
    );
}
