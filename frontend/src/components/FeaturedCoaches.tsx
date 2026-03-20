import { useEffect, useState, useMemo } from 'react';
import { logger } from '../lib/logger';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import type { Trainer } from '../types';
import { usePrefetchProfile } from '../hooks/usePrefetchProfile';

type FeaturedTrainer = Trainer & {
    is_verified?: boolean;
    created_at?: string;
    slug?: string;
    user_type?: string;
};

export default function FeaturedCoaches() {
    const [coaches, setCoaches] = useState<FeaturedTrainer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { prefetchCoach } = usePrefetchProfile();

    useEffect(() => {
        apiClient.get('/users/trainers')
            .then(res => {
                if (res.data?.data?.trainers) {
                    setCoaches(res.data.data.trainers);
                }
            })
            .catch(logger.error)
            .finally(() => setIsLoading(false));
    }, []);

    const sortedAndCuratedCoaches = useMemo(() => {
        return [...coaches].sort((a, b) => {
            if (a.is_verified !== b.is_verified) return a.is_verified ? -1 : 1;
            if (!!a.avatar_url !== !!b.avatar_url) return a.avatar_url ? -1 : 1;
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        }).slice(0, 6);
    }, [coaches]);

    if (!isLoading && sortedAndCuratedCoaches.length === 0) return null;

    return (
        <section className="bg-black py-20 md:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 md:mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Danh Sách Nổi Bật</h2>
                    <p className="text-[color:var(--mk-muted)] mt-3 text-sm md:text-base">Những chuyên gia hàng đầu kiến tạo sự thay đổi</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[280px] md:auto-rows-[320px]">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, idx) => (
                            <div key={`skeleton-${idx}`} className="bg-white/5 rounded-lg overflow-hidden animate-pulse">
                                <div className="w-full h-full bg-white/10"></div>
                            </div>
                        ))
                    ) : (
                        sortedAndCuratedCoaches.map((coach, index) => {
                            const identifier = coach.slug || coach.id;
                            const detailLink = coach.user_type === 'athlete'
                                ? (coach.slug ? `/athlete/${coach.slug}` : `/athletes/${coach.id}`)
                                : (coach.slug ? `/coach/${coach.slug}` : `/coaches/${coach.id}`);

                            return (
                                <Link
                                    key={`${coach.id}-${index}`}
                                    to={detailLink}
                                    className="group relative block overflow-hidden rounded-lg bg-gray-900 border border-white/10 hover:border-white/30 transition-all duration-500"
                                    onMouseEnter={() => prefetchCoach(identifier)}
                                    onTouchStart={() => prefetchCoach(identifier)}
                                >
                                    <div className="absolute inset-0">
                                        {coach.avatar_url ? (
                                            <img
                                                src={coach.avatar_url}
                                                alt={coach.full_name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white/20 uppercase">
                                                {coach.full_name.charAt(0)}
                                            </div>
                                        )}
                                        {/* Dark overlay for text readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                                    </div>

                                    <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end text-white">
                                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            {coach.specialties && coach.specialties.length > 0 && (
                                                <div className="flex gap-2 mb-3">
                                                    <span className="bg-black/50 backdrop-blur-sm border border-white/20 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-sm">
                                                        [{coach.specialties[0]}]
                                                    </span>
                                                </div>
                                            )}
                                            <h3 className="font-black text-xl md:text-2xl mb-1 uppercase tracking-tight line-clamp-1">{coach.full_name}</h3>
                                            <p className="text-xs uppercase tracking-widest text-[color:var(--mk-muted)] font-medium line-clamp-1">
                                                {coach.headline || 'Fitness Coach'}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
}
