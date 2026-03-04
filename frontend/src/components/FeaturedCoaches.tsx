import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';

export default function FeaturedCoaches() {
    const [coaches, setCoaches] = useState<any[]>([]);

    useEffect(() => {
        apiClient.get('/users/trainers')
            .then(res => {
                if (res.data?.data) {
                    // Randomize the order
                    const shuffled = [...res.data.data].sort(() => 0.5 - Math.random());
                    setCoaches(shuffled.slice(0, 10)); // Take top 10
                }
            })
            .catch(console.error);
    }, []);

    if (coaches.length === 0) return null;

    return (
        <section className="bg-white py-12 md:py-20 border-b border-gray-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-black text-black">Các chuyên gia hàng đầu</h2>
                        <p className="text-gray-500 text-sm mt-1">Đồng hành cùng bạn trên hành trình lột xác</p>
                    </div>
                </div>
            </div>
            
            {/* Scrolling track */}
            <div className="relative w-full flex overflow-x-hidden">
                <div className="flex gap-6 animate-marquee shrink-0 whitespace-nowrap px-4 hover:pause">
                    {coaches.concat(coaches).map((coach, index) => (
                        <Link 
                            key={`${coach.id}-${index}`} 
                            to={`/coaches/${coach.id}`}
                            className="group block w-64 shrink-0 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:border-black transition"
                        >
                            <div className="aspect-square bg-gray-200 overflow-hidden">
                                {coach.avatar_url ? (
                                    <img src={coach.avatar_url} alt={coach.full_name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl font-black text-gray-400">
                                        {coach.full_name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-black text-base truncate">{coach.full_name}</h3>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium truncate">
                                    {coach.headline || 'Fitness Coach'}
                                </p>
                                {coach.specialties && coach.specialties.length > 0 && (
                                    <div className="flex gap-1 mt-3 overflow-hidden text-clip">
                                        <span className="bg-white border border-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-sm whitespace-nowrap">
                                            {coach.specialties[0]}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                    width: max-content;
                }
                .hover\\:pause:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
}
