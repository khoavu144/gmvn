import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Package, Plus, Pencil, ExternalLink, Store } from 'lucide-react';
import type { RootState } from '../../store/store';
import type { Product, SellerProfile } from '../../types';
import {
    getMySellerProfile,
    listSellerProducts,
    registerSeller,
    type SellerBusinessType,
} from '../../services/marketplaceSellerService';
import { isAxiosError } from 'axios';

const STATUS_LABEL: Record<string, string> = {
    draft: 'Bản nháp',
    pending_review: 'Chờ duyệt',
    active: 'Đang bán',
    rejected: 'Từ chối',
    suspended: 'Tạm khóa',
    sold_out: 'Hết hàng',
    archived: 'Đã gỡ',
};

export default function SellerMarketplaceListPage() {
    const user = useSelector((s: RootState) => s.auth.user);
    const [profile, setProfile] = useState<SellerProfile | null | undefined>(undefined);
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [shopName, setShopName] = useState('');
    const [businessType, setBusinessType] = useState<SellerBusinessType>('individual');
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [p, list] = await Promise.all([getMySellerProfile(), listSellerProducts(1, 50)]);
            setProfile(p);
            setProducts(list.products);
            setTotal(list.total);
        } catch {
            setError('Không tải được dữ liệu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shopName.trim()) {
            setError('Nhập tên cửa hàng.');
            return;
        }
        setRegistering(true);
        setError(null);
        try {
            const prof = await registerSeller({ shop_name: shopName.trim(), business_type: businessType });
            setProfile(prof);
            setShopName('');
        } catch (err) {
            if (isAxiosError(err) && err.response?.status === 403) {
                setError('Không thể đăng ký với tài khoản này.');
            } else {
                setError('Đăng ký thất bại. Thử lại sau.');
            }
        } finally {
            setRegistering(false);
        }
    };

    const canTraining = user?.user_type === 'athlete' || user?.user_type === 'trainer';
    const atListingLimit =
        products.length >= 1 && user && !user.marketplace_membership_active;

    if (user?.user_type === 'admin') {
        return (
            <div className="page-shell-muted page-container gv-pad-y-lg">
                <p className="text-gray-500">Tài khoản admin không dùng kênh bán marketplace.</p>
                <Link to="/dashboard" className="btn-secondary inline-block mt-4">
                    Về bảng điều khiển
                </Link>
            </div>
        );
    }

    return (
        <div className="page-shell-muted min-h-[70vh]">
            <Helmet>
                <title>Quản lý Marketplace — GymViet</title>
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
            <div className="bg-white border-b border-gray-200">
                <div className="page-container gv-pad-y">
                    <p className="page-kicker mb-2 flex items-center gap-2">
                        <Store className="w-4 h-4" /> Marketplace
                    </p>
                    <h1 className="page-title">Cửa hàng của bạn</h1>
                    <p className="page-description max-w-2xl">
                        Đăng ký bán, xem bài đăng và chỉnh sửa sản phẩm. Listing đầu tiên miễn phí; từ sản phẩm thứ
                        hai cần membership.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                            to="/dashboard/marketplace/new"
                            className={`btn-primary inline-flex items-center gap-2 ${atListingLimit ? 'pointer-events-none opacity-50' : ''}`}
                            aria-disabled={atListingLimit ? true : undefined}
                            onClick={(e) => {
                                if (atListingLimit) e.preventDefault();
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            Thêm sản phẩm
                        </Link>
                        {canTraining && (
                            <Link
                                to="/dashboard/marketplace/new/training"
                                className={`btn-secondary inline-flex items-center gap-2 ${atListingLimit ? 'pointer-events-none opacity-50' : ''}`}
                                aria-disabled={atListingLimit ? true : undefined}
                                onClick={(e) => {
                                    if (atListingLimit) e.preventDefault();
                                }}
                            >
                                <Package className="w-4 h-4" />
                                Thêm gói tập / giáo án
                            </Link>
                        )}
                        <Link to="/marketplace" className="btn-secondary inline-flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Xem chợ
                        </Link>
                    </div>
                    {atListingLimit && (
                        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                            Bạn đã dùng 1 listing miễn phí.{' '}
                            <Link to="/dashboard/subscriptions" className="font-bold underline">
                                Nâng cấp membership
                            </Link>{' '}
                            để đăng thêm sản phẩm.
                        </div>
                    )}
                </div>
            </div>

            <div className="page-container gv-pad-y-md space-y-10">
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {error}
                    </div>
                )}

                {profile === undefined || loading ? (
                    <div className="flex justify-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-black" />
                    </div>
                ) : profile === null ? (
                    <div className="max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-black uppercase tracking-tight mb-2">Trở thành người bán</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Tạo tên cửa hàng để quản lý bài đăng và có trang shop công khai trên marketplace.
                        </p>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                    Tên cửa hàng
                                </label>
                                <input
                                    className="form-input w-full"
                                    value={shopName}
                                    onChange={(e) => setShopName(e.target.value)}
                                    placeholder="VD: Shop phụ kiện gym của tôi"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                    Loại hình
                                </label>
                                <select
                                    className="form-input w-full"
                                    value={businessType}
                                    onChange={(e) => setBusinessType(e.target.value as SellerBusinessType)}
                                >
                                    <option value="individual">Cá nhân</option>
                                    <option value="brand">Thương hiệu</option>
                                    <option value="gym">Phòng gym</option>
                                    <option value="coach">Coach</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-primary w-full sm:w-auto" disabled={registering}>
                                {registering ? 'Đang xử lý…' : 'Đăng ký'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                            <div>
                                <span className="font-bold">{profile.shop_name}</span>
                                <span className="text-gray-500"> · /marketplace/sellers/{profile.shop_slug}</span>
                            </div>
                            <Link
                                to={`/marketplace/sellers/${profile.shop_slug}`}
                                className="text-xs font-bold uppercase tracking-widest hover:underline inline-flex items-center gap-1"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Xem shop <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>

                        {products.length === 0 ? (
                            <p className="text-gray-500">Chưa có sản phẩm nào. Thêm sản phẩm đầu tiên.</p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50 text-left">
                                            <th className="p-3 font-bold uppercase tracking-wider text-xs">Sản phẩm</th>
                                            <th className="p-3 font-bold uppercase tracking-wider text-xs">Trạng thái</th>
                                            <th className="p-3 font-bold uppercase tracking-wider text-xs">Giá</th>
                                            <th className="p-3 font-bold uppercase tracking-wider text-xs w-40">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((p) => (
                                            <tr key={p.id} className="border-b border-gray-200 last:border-0">
                                                <td className="p-3">
                                                    <div className="font-semibold">{p.title}</div>
                                                    <div className="text-xs text-gray-500">{p.slug}</div>
                                                </td>
                                                <td className="p-3">
                                                    <span className="inline-block rounded px-2 py-0.5 text-xs font-bold bg-gray-50">
                                                        {STATUS_LABEL[p.status] ?? p.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 tabular-nums">
                                                    {Number(p.price).toLocaleString('vi-VN')}đ
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Link
                                                            to={`/dashboard/marketplace/edit/${p.id}`}
                                                            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider hover:underline"
                                                        >
                                                            <Pencil className="w-3 h-3" /> Sửa
                                                        </Link>
                                                        {p.status === 'active' && (
                                                            <Link
                                                                to={`/marketplace/product/${p.slug}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider hover:underline"
                                                            >
                                                                <ExternalLink className="w-3 h-3" /> Xem
                                                            </Link>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200">
                                    Tổng {total} sản phẩm
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
