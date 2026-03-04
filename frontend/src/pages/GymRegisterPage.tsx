import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { gymService } from '../services/gymService';
import { authApi } from '../services/auth';
import { setCredentials } from '../store/slices/authSlice';

const GymRegisterPage: React.FC = () => {
    const { user, accessToken } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    const [form, setForm] = useState({
        name: '',
        description: '',
        tagline: '',
        branchName: 'Cơ sở chính',
        address: '',
        city: '',
        district: '',
        phone: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await gymService.registerGym(form);
            if (res.success) {
                setSubmitted(true);
                // Refresh user state to get new gym_owner_status
                const userRes = await authApi.getProfile();
                const refresh = localStorage.getItem('refresh_token') || '';
                dispatch(setCredentials({
                    user: userRes,
                    access_token: accessToken!,
                    refresh_token: refresh
                }));
            } else {
                setError(res.error || 'Đăng ký phòng tập thất bại');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    if (submitted || user?.gym_owner_status === 'pending_review') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-black text-center max-w-lg w-full">
                    <div className="w-16 h-16 border-4 border-black rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="w-1 h-8 bg-black rounded-full animate-bounce mx-0.5"></div>
                        <div className="w-1 h-8 bg-black rounded-full animate-bounce [animation-delay:0.2s] mx-0.5"></div>
                    </div>
                    <h2 className="text-2xl font-black mb-2 uppercase">Hồ sơ đang chờ duyệt</h2>
                    <p className="text-gray-600 mb-6">
                        GYMERVIET đang xác minh thông tin phòng tập của bạn. Quá trình này thường mất từ 1-2 ngày làm việc. Chúng tôi sẽ liên hệ qua email nếu cần thêm thông tin.
                    </p>
                    <button className="btn-secondary w-full" onClick={() => window.location.reload()}>
                        Tải lại trang
                    </button>
                </div>
            </div>
        );
    }

    if (user?.gym_owner_status === 'rejected') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-red-600 text-center max-w-lg w-full">
                    <div className="text-sm font-black uppercase tracking-widest text-red-600 mb-2">Hồ sơ bị từ chối</div>
                    <h2 className="text-2xl font-black mb-2 uppercase text-red-600">Xác minh thất bại</h2>
                    <p className="text-gray-600">
                        Rất tiếc, thông tin đăng ký phòng tập của bạn không đáp ứng tiêu chuẩn của GYMERVIET. Vui lòng liên hệ bộ phận hỗ trợ để biết thêm chi tiết.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Đăng ký Đối tác Gym Center</h1>
                <p className="text-gray-600 mt-2">Vui lòng cung cấp chính xác thông tin phòng tập để được kiểm duyệt nhanh nhất.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 space-y-8">
                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <h3 className="text-lg font-bold border-b border-gray-100 pb-2">Thông tin chung (Thương hiệu)</h3>
                    <div>
                        <label className="form-label block mb-1">Tên Gym Center / Chuỗi hệ thống</label>
                        <input required type="text" name="name" value={form.name} onChange={handleChange} className="form-input w-full" placeholder="VD: California Fitness, CityGym..." />
                    </div>
                    <div>
                        <label className="form-label block mb-1">Slogan / Tagline</label>
                        <input type="text" name="tagline" value={form.tagline} onChange={handleChange} className="form-input w-full" placeholder="VD: Kiến tạo sức khoẻ người Việt" />
                    </div>
                    <div>
                        <label className="form-label block mb-1">Giới thiệu chi tiết</label>
                        <textarea name="description" value={form.description} onChange={handleChange} className="form-input w-full h-24 resize-none" placeholder="Giới thiệu về quy mô, chất lượng dịch vụ của hệ thống..."></textarea>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg font-bold border-b border-gray-100 pb-2">Tạo cơ sở đầu tiên</h3>
                    <div>
                        <label className="form-label block mb-1">Tên cơ sở</label>
                        <input required type="text" name="branchName" value={form.branchName} onChange={handleChange} className="form-input w-full" placeholder="VD: Cơ sở chính, Chi nhánh Cầu Giấy..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="form-label block mb-1">Tỉnh / Thành phố</label>
                            <input type="text" name="city" value={form.city} onChange={handleChange} className="form-input w-full" placeholder="Hà Nội" />
                        </div>
                        <div>
                            <label className="form-label block mb-1">Quận / Huyện</label>
                            <input type="text" name="district" value={form.district} onChange={handleChange} className="form-input w-full" placeholder="Cầu Giấy" />
                        </div>
                    </div>
                    <div>
                        <label className="form-label block mb-1">Địa chỉ chi tiết</label>
                        <input required type="text" name="address" value={form.address} onChange={handleChange} className="form-input w-full" placeholder="Số 1, Phố abc..." />
                    </div>
                    <div>
                        <label className="form-label block mb-1">Số điện thoại Hotline cơ sở</label>
                        <input type="text" name="phone" value={form.phone} onChange={handleChange} className="form-input w-full" placeholder="09xxxxxxx" />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-sm tracking-widest uppercase">
                        {loading ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ đăng ký'}
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-4">
                        Bằng việc đăng ký, bạn đồng ý với Điều khoản Đối tác của GYMERVIET.
                    </p>
                </div>
            </form>
        </div>
    );
};

export default GymRegisterPage;
