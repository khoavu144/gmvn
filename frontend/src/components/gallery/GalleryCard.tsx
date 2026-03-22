import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { CommunityGalleryItem } from '../../services/communityGalleryService';
import { Star } from 'lucide-react';

interface GalleryCardProps {
    item: CommunityGalleryItem;
    onClick: () => void;
}

export default function GalleryCard({ item, onClick }: GalleryCardProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const profileHref =
        item.linked_user?.slug
            ? item.linked_user.user_type === 'athlete'
                ? `/athlete/${item.linked_user.slug}`
                : `/coach/${item.linked_user.slug}`
            : '#';

    // Randomize aspect ratios for masonry effect if not provided by backend
    // Since images might be strictly square or rectangular, we use natural flow in CSS.
    
    return (
        <div
            className="group relative cursor-zoom-in overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            onClick={onClick}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onClick();
                }
            }}
            role="button"
            tabIndex={0}
        >
            {/* Loading Skeleton */}
            {!isLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gray-100" />
            )}

            <img
                src={item.image_url}
                alt={item.caption || "Community Gallery Image"}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                className={`w-full h-auto object-cover transition-[transform,opacity,filter] duration-700 ease-in-out group-hover:scale-105 group-hover:opacity-90 ${
                    isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-xl'
                }`}
            />

            {/* Hover overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f1c18]/90 via-[#1f1c18]/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Featured Badge */}
            {item.is_featured && (
                <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-500 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-[transform,opacity] duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Star size={10} className="fill-current" />
                    Featured
                </div>
            )}

            {/* Content Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 opacity-0 group-hover:opacity-100 transition-[transform,opacity] duration-300 transform translate-y-4 group-hover:translate-y-0">
                {item.caption && (
                    <p className="text-white text-sm md:text-base font-medium line-clamp-2 mb-4 drop-shadow-md">
                        "{item.caption}"
                    </p>
                )}

                {/* Linked User Mini Profile */}
                {item.linked_user ? (
                    <div
                        className="flex items-center gap-3"
                    >
                        <Link to={profileHref} onClick={(e) => e.stopPropagation()}>
                            <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-white/10 flex-shrink-0 transition-transform hover:scale-110">
                                {item.linked_user.avatar_url ? (
                                    <img src={item.linked_user.avatar_url} alt={item.linked_user.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-600 text-xs font-bold text-white uppercase">
                                        {item.linked_user.full_name.substring(0, 2)}
                                    </div>
                                )}
                            </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <Link to={profileHref} onClick={(e) => e.stopPropagation()} className="group/name block">
                                <div className="flex items-center gap-1.5">
                                    <h4 className="text-white font-bold text-sm truncate group-hover/name:underline">
                                        {item.linked_user.full_name}
                                    </h4>
                                    {item.linked_user.user_type === 'trainer' && <CheckCircle2 size={12} className="text-blue-400 flex-shrink-0" />}
                                </div>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">
                                    {item.linked_user.user_type === 'trainer' ? 'Coach' : 'Athlete'}
                                </p>
                            </Link>
                        </div>
                        <Link 
                            to={profileHref}
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                            <span className="text-white text-xs font-bold">G</span>
                        </div>
                        <span className="text-sm font-semibold text-white">Gymerviet Community</span>
                    </div>
                )}
            </div>
        </div>
    );
}
