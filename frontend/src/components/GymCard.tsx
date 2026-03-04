import { Link } from 'react-router-dom';
import type { GymCenter } from '../types';

interface GymCardProps {
    gym: GymCenter;
}

const GymCard: React.FC<GymCardProps> = ({ gym }) => {
    // Collect branches info
    const branches = gym.branches || [];
    const locationCount = branches.length;
    const cities = Array.from(new Set(branches.map(b => b.city).filter(Boolean)));
    const displayCity = cities.length > 0 ? cities[0] : 'Nhiều chi nhánh';
    if (cities.length > 1) {
        // e.g "Hà Nội + 2"
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group">
            {/* Image Placeholder or Logo */}
            <div className="h-48 bg-gray-100 relative overflow-hidden flex-shrink-0">
                {gym.logo_url ? (
                    <img
                        src={gym.logo_url}
                        alt={gym.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-300 to-gray-400">GV</span>
                        <span className="text-xs uppercase tracking-widest mt-2">{gym.name.substring(0, 2)}</span>
                    </div>
                )}

                {/* Verification Badge */}
                {gym.is_verified && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-green-700 tracking-wide border border-green-100 shadow-sm">
                        ✓ VERIFIED
                    </div>
                )}
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">{gym.name}</h3>
                    {gym.tagline && (
                        <p className="text-sm text-gray-500 font-medium italic line-clamp-1">"{gym.tagline}"</p>
                    )}
                </div>

                <div className="space-y-2 mb-6 flex-grow">
                    <div className="flex items-start text-sm text-gray-600">
                        <span className="font-bold mr-2 uppercase tracking-wider text-gray-400 text-xs mt-0.5">LOC</span>
                        <span className="line-clamp-1">
                            {locationCount > 0
                                ? `${locationCount} cơ sở (${displayCity}${cities.length > 1 ? '...' : ''})`
                                : 'Chưa cập nhật cơ sở'}
                        </span>
                    </div>
                    {/* Only show views implicitly without icon */}
                    <div className="flex items-start text-sm text-gray-600">
                        <span className="font-bold mr-2 uppercase tracking-wider text-gray-400 text-xs mt-0.5">POP</span>
                        <span>{gym.view_count} lượt xem</span>
                        <div className="flex items-start text-sm text-gray-600">
                            <span className="font-bold mr-2 uppercase tracking-wider text-gray-400 text-xs mt-0.5">RAT</span>
                            <span className="font-black text-black">★ {(gym as any).avg_rating?.toFixed(1) || '5.0'}</span>
                        </div>
                    </div>
                </div>

                <Link
                    to={`/gyms/${gym.id}`}
                    className="w-full py-3 bg-gray-50 hover:bg-black text-gray-900 hover:text-white text-center rounded-lg font-bold transition-all duration-300 text-sm uppercase tracking-wider mt-auto"
                >
                    Khám phá không gian
                </Link>
            </div>
        </div>
    );
};

export default GymCard;
