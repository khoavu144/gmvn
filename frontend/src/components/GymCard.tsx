import React from 'react';
import { Link } from 'react-router-dom';
import type { GymCenter } from '../types';

interface GymCardProps {
    gym: GymCenter;
}

const GymCard: React.FC<GymCardProps> = ({ gym }) => {
    const branches = gym.branches || [];
    const cities = Array.from(new Set(branches.map(b => b.city).filter(Boolean)));
    const primaryCity = cities[0] || null;
    const href = gym.slug ? `/gyms/${gym.slug}` : `/gyms/${gym.id}`;

    return (
        <Link to={href} className="group block bg-white border border-gray-200 hover:border-black transition-all duration-300 overflow-hidden">
            {/* Image */}
            <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '4/3' }}>
                {(gym.cover_image_url || gym.logo_url) ? (
                    <img
                        src={gym.cover_image_url || gym.logo_url!}
                        alt={gym.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-4xl font-black text-gray-300 tracking-tight">{gym.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                )}

                {/* Overlay badges */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                    {gym.is_verified && (
                        <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 bg-black text-white">VERIFIED</span>
                    )}
                </div>

                {/* Branch count pill */}
                {branches.length > 1 && (
                    <div className="absolute bottom-3 right-3 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white/90 text-black">
                        {branches.length} cơ sở
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="mb-3">
                    <h3 className="text-sm font-black text-black tracking-tight line-clamp-1 group-hover:underline underline-offset-2">{gym.name}</h3>
                    {gym.tagline && (
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5 line-clamp-1">{gym.tagline}</p>
                    )}
                </div>

                <div className="space-y-1.5 text-[11px] text-gray-500">
                    {primaryCity && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                            <span>{primaryCity}{cities.length > 1 ? ` + ${cities.length - 1} tỉnh/thành khác` : ''}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                        <span>{gym.view_count.toLocaleString()} lượt xem</span>
                        {gym.avg_rating && (
                            <span className="ml-auto font-bold text-black">★ {Number(gym.avg_rating).toFixed(1)}</span>
                        )}
                    </div>
                </div>

                {/* Highlights */}
                {gym.highlights && gym.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
                        {gym.highlights.slice(0, 3).map((h, i) => (
                            <span key={i} className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 border border-gray-200 text-gray-600">
                                {h}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default GymCard;
