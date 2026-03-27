import type { Product } from '../types';

const REGION_ATTR_HINTS = ['khu vực', 'ship từ', 'tỉnh thành', 'địa điểm', 'phạm vi', 'giao hàng'];

export function normalizeKey(value: string) {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export function humanizeToken(value: string) {
    return value.replace(/_/g, ' ').trim();
}

export function titleizeToken(value: string) {
    return humanizeToken(value).replace(/\b\w/g, (char) => char.toUpperCase());
}

export function pickSalesRegionFromAttributes(attrs: Record<string, unknown> | null | undefined): string | null {
    if (!attrs) return null;
    for (const [key, value] of Object.entries(attrs)) {
        const normalizedKey = normalizeKey(key);
        if (REGION_ATTR_HINTS.some((hint) => normalizedKey.includes(normalizeKey(hint)))) {
            return String(value);
        }
    }
    for (const [key, value] of Object.entries(attrs)) {
        if (/khu|vực|ship|tỉnh|thành|giao|phạm/i.test(key)) {
            return String(value);
        }
    }
    return null;
}

function salesAreaFallbackCopy(product: Product): string {
    switch (product.product_type) {
        case 'digital':
            return 'Sản phẩm số được giao trực tuyến sau thanh toán và không cần vận chuyển vật lý.';
        case 'service':
            return 'Dịch vụ được triển khai theo lịch hẹn với người bán; cần xác nhận trước khu vực và hình thức làm việc.';
        default:
            return 'Hàng vật lý được giao theo chính sách của người bán, thường là toàn quốc trừ khi có ghi chú riêng.';
    }
}

export function buildOverviewFacts(product: Product, variants: Product['variants'] = []) {
    const facts: Array<{ label: string; value: string }> = [];
    const trainingPackage = product.training_package;

    if (trainingPackage) {
        facts.push(
            { label: 'Mục tiêu', value: titleizeToken(trainingPackage.goal) },
            { label: 'Thời lượng', value: `${trainingPackage.duration_weeks} tuần` },
            { label: 'Tần suất', value: `${trainingPackage.sessions_per_week} buổi / tuần` },
            { label: 'Cấp độ', value: trainingPackage.level === 'all' ? 'Mọi level' : titleizeToken(trainingPackage.level) }
        );

        if (trainingPackage.includes_nutrition) {
            facts.push({ label: 'Kèm theo', value: 'Hướng dẫn dinh dưỡng' });
        }
        if (trainingPackage.includes_video) {
            facts.push({ label: 'Định dạng', value: 'Có video hướng dẫn' });
        }
        if (trainingPackage.equipment_required?.length) {
            facts.push({ label: 'Thiết bị', value: trainingPackage.equipment_required.join(', ') });
        }

        return facts;
    }

    if (product.product_type === 'physical') {
        if (product.stock_quantity != null) {
            facts.push({ label: 'Tồn kho', value: `Còn ${product.stock_quantity} sản phẩm` });
        }
        if (variants.length > 0) {
            facts.push({ label: 'Lựa chọn', value: `${variants.length} biến thể đang mở bán` });
        }
        facts.push({ label: 'Giao nhận', value: pickSalesRegionFromAttributes(product.attributes ?? null) ?? 'Giao hàng toàn quốc' });
        return facts;
    }

    if (product.product_type === 'service') {
        if (product.attributes?.['Format']) {
            facts.push({ label: 'Hình thức', value: String(product.attributes['Format']) });
        }
        if (product.attributes?.['Phù hợp']) {
            facts.push({ label: 'Phù hợp', value: String(product.attributes['Phù hợp']) });
        }
        if (variants.length > 0) {
            facts.push({ label: 'Gói dịch vụ', value: `${variants.length} lựa chọn` });
        }
        facts.push({ label: 'Lịch hẹn', value: 'Cần đặt lịch trước khi triển khai' });
        return facts;
    }

    facts.push(
        { label: 'Nhận hàng', value: 'Trực tuyến sau thanh toán' },
        { label: 'Quyền truy cập', value: 'Sử dụng lâu dài trên tài khoản' }
    );
    if (product.preview_content) {
        facts.push({ label: 'Preview', value: 'Có nội dung xem trước' });
    }
    return facts;
}

export function buildFulfillmentPanel(product: Product, variants: Product['variants'] = []) {
    const region = pickSalesRegionFromAttributes(product.attributes ?? null) ?? salesAreaFallbackCopy(product);
    const trainingPackage = product.training_package;

    if (trainingPackage) {
        return {
            title: 'Cách nhận chương trình',
            description: 'Nhận lộ trình online ngay sau thanh toán.',
            points: [
                `${trainingPackage.duration_weeks} tuần nội dung`,
                trainingPackage.includes_video ? 'Có video hướng dẫn' : 'Nội dung gọn, dễ theo dõi',
                trainingPackage.includes_nutrition ? 'Kèm định hướng dinh dưỡng' : 'Không kèm meal plan riêng',
            ],
            note: 'Training package không cần bản đồ giao hàng.',
            showMap: false,
        };
    }

    if (product.product_type === 'digital') {
        return {
            title: 'Giao nhận & truy cập',
            description: 'Nhận trực tiếp trên nền tảng, không cần ship.',
            points: [
                product.digital_file_url ? 'Tải tệp sau thanh toán' : 'Nhận tài nguyên số sau thanh toán',
                'Không cần xác nhận địa chỉ',
                product.preview_content ? 'Có nội dung xem trước' : 'Mở toàn bộ sau thanh toán',
            ],
            note: 'Bản đồ không cần thiết với sản phẩm số.',
            showMap: false,
        };
    }

    if (product.product_type === 'service') {
        return {
            title: 'Phạm vi phục vụ',
            description: region,
            points: [
                variants.length > 0 ? `${variants.length} gói đang mở` : 'Gói dịch vụ cấu hình theo nhu cầu',
                'Xác nhận lịch với người bán',
                'Chốt rõ khu vực hoặc hình thức trước khi thanh toán',
            ],
            note: 'Service ưu tiên mô tả text-first thay vì bản đồ chung.',
            showMap: false,
        };
    }

    return {
        title: 'Phạm vi giao hàng',
        description: region,
        points: [
            'Nên kiểm tra khu vực giao thực tế',
            product.track_inventory ? 'Tồn kho được theo dõi trên hệ thống' : 'Nên xác nhận tồn kho trước khi chốt',
            variants.length > 0 ? `${variants.length} biến thể có thể ảnh hưởng thời gian giao` : 'Một SKU chính, dễ chốt nhanh',
        ],
        note: 'Bản đồ chỉ mang tính tham chiếu phạm vi giao hàng.',
        showMap: true,
    };
}

export function buildBuyLead(product: Product) {
    if (product.training_package) {
        return 'Nhận lộ trình online và xem trước cấu trúc chương trình.';
    }
    if (product.product_type === 'digital') {
        return 'Nhận nội dung trực tiếp trên nền tảng, không cần ship.';
    }
    if (product.product_type === 'service') {
        return 'Phù hợp khi bạn cần chốt nhanh hình thức làm việc và lịch hẹn.';
    }
    return 'Xem tồn kho và phạm vi giao trước khi thêm vào giỏ.';
}
