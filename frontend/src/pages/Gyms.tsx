import React, { useEffect, useState } from 'react';
import { gymService } from '../services/gymService';
import type { GymCenter } from '../types';
import GymCard from '../components/GymCard';

const Gyms: React.FC = () => {
    const [gyms, setGyms] = useState<GymCenter[]>([]);
    const [filteredGyms, setFilteredGyms] = useState<GymCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [cityFilter, setCityFilter] = useState('');

    useEffect(() => {
        fetchGyms();
    }, []);

    useEffect(() => {
        // Client-side filtering as secondary layer for instant UX if dataset is small
        let result = gyms;
        if (searchTerm) {
            result = result.filter(g =>
                g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                g.branches?.some(b => b.address.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        if (cityFilter) {
            result = result.filter(g =>
                g.branches?.some(b => b.city?.toLowerCase() === cityFilter.toLowerCase())
            );
        }
        setFilteredGyms(result);
    }, [searchTerm, cityFilter, gyms]);

    const fetchGyms = async () => {
        try {
            setLoading(true);
            const response = await gymService.listGyms({ limit: 50, sort: 'views' });
            if (response.success) {
                setGyms(response.gyms || []);
                setFilteredGyms(response.gyms || []);
            } else {
                setError(response.error || 'Lỗi tải danh sách gyms');
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    // Extract unique cities from gyms
    const allCities = Array.from(
        new Set(
            gyms.flatMap(g => (g.branches || []).map(b => b.city).filter(Boolean))
        )
    ) as string[];

    return (
        <div className="bg-white min-h-screen pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tight mb-4">
                        Khám phá <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">Gym Center</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl">
                        Tìm kiếm không gian tập luyện đẳng cấp, phù hợp nhất với phong cách và mục tiêu của bạn. Hệ thống đối tác uy tín của GYMERVIET.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-4 mb-12">
                    <div className="flex-grow">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tìm kiếm</label>
                        <input
                            type="text"
                            placeholder="Tên phòng tập, địa chỉ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all placeholder-gray-400"
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Khu vực</label>
                        <select
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all appearance-none"
                        >
                            <option value="">Tất cả thành phố</option>
                            {allCities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="animate-pulse bg-gray-50 rounded-xl h-[400px]"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center font-medium border border-red-100">
                        {error}
                        <button onClick={fetchGyms} className="ml-4 underline font-bold">Thử lại</button>
                    </div>
                ) : filteredGyms.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                        <div className="text-6xl font-black text-gray-200 mb-4">0</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy phòng tập</h3>
                        <p className="text-gray-500">Vui lòng thử nghiệm tìm kiếm khóa khác hoặc đổi khu vực</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredGyms.map(gym => (
                            <GymCard key={gym.id} gym={gym} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gyms;
