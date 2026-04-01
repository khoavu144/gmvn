import { Request } from 'express';
import { AppError } from './AppError';

const LEGACY_MESSAGE_MAP: Record<string, string> = {
    Unauthorized: 'Bạn cần đăng nhập để tiếp tục',
    'Internal server error': 'Lỗi hệ thống, vui lòng thử lại sau',
    'Email already registered': 'Email đã được đăng ký',
    'Invalid email or password': 'Email hoặc mật khẩu không đúng',
    'Invalid refresh token': 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
    'User not found': 'Không tìm thấy người dùng',
    'Verification failed': 'Xác thực email thất bại',
    'Reset password failed': 'Đặt lại mật khẩu thất bại',
    'Profile not found or not public': 'Không tìm thấy hồ sơ công khai',
    'Profile not found': 'Không tìm thấy hồ sơ',
    'Slug already taken': 'Slug đã có người dùng, vui lòng chọn slug khác',
    'Only trainers or athletes can update a profile': 'Chỉ huấn luyện viên hoặc vận động viên mới có thể cập nhật hồ sơ',
    'Experience not found': 'Không tìm thấy mục kinh nghiệm',
    'Experience deleted': 'Đã xóa mục kinh nghiệm',
    'Gallery image not found': 'Không tìm thấy hình ảnh trong thư viện',
    'Image deleted': 'Đã xóa hình ảnh',
    'FAQ not found': 'Không tìm thấy câu hỏi thường gặp',
    'FAQ deleted': 'Đã xóa câu hỏi thường gặp',
    'Skill not found': 'Không tìm thấy kỹ năng',
    'Skill deleted': 'Đã xóa kỹ năng',
    'Package not found': 'Không tìm thấy gói dịch vụ',
    'Package deleted': 'Đã xóa gói dịch vụ',
    'Testimonial not found': 'Không tìm thấy đánh giá',
    'Testimonial deleted': 'Đã xóa đánh giá',
    'Program not found': 'Không tìm thấy giáo án',
    'Program deleted': 'Đã xóa giáo án',
    'Program not found or unauthorized': 'Không tìm thấy giáo án hoặc bạn không có quyền truy cập',
    'No file uploaded': 'Chưa có tệp nào được tải lên',
    'Invalid file content: not a supported image type': 'Nội dung tệp không hợp lệ: chỉ hỗ trợ ảnh JPG, PNG hoặc WebP',
    'File upload failed': 'Tải tệp lên thất bại',
    'Error fetching progress photos': 'Không thể tải ảnh tiến độ',
    'Missing image_url': 'Thiếu đường dẫn ảnh',
    'Error creating progress photo': 'Không thể tạo ảnh tiến độ',
    'Photo not found or unauthorized': 'Không tìm thấy ảnh hoặc bạn không có quyền truy cập',
    'Deleted successfully': 'Đã xóa thành công',
    'Google Form ingest is not configured': 'Chưa cấu hình webhook Google Form',
    'Missing raw body': 'Thiếu nội dung raw body',
    'Invalid signature': 'Chữ ký không hợp lệ',
    'Stale or invalid timestamp': 'Mốc thời gian không hợp lệ hoặc đã hết hạn',
    'Invalid JSON': 'Dữ liệu JSON không hợp lệ',
    'Body must be an object': 'Nội dung gửi lên phải là một đối tượng dữ liệu',
    'responseId required': 'Thiếu responseId',
    'responseId already ingested': 'responseId này đã được xử lý trước đó',
    'Unsupported schemaVersion': 'Phiên bản schema không được hỗ trợ',
    consentRequired: 'Cần xác nhận đồng ý trước khi gửi',
    'invalid email': 'Email không hợp lệ',
    'No account for this email': 'Chưa có tài khoản nào với email này',
    'No token provided': 'Bạn chưa gửi token đăng nhập',
    'Invalid or expired token': 'Token đăng nhập không hợp lệ hoặc đã hết hạn',
    'Only trainers or professional athletes can perform this action': 'Chỉ huấn luyện viên hoặc vận động viên chuyên nghiệp mới có thể thực hiện thao tác này',
    'Admin access only': 'Chỉ quản trị viên mới có quyền truy cập',
    'Only athletes can perform this action': 'Chỉ vận động viên mới có thể thực hiện thao tác này',
    'Only admins or trainers can perform this action': 'Chỉ quản trị viên hoặc huấn luyện viên mới có thể thực hiện thao tác này',
    'Only athletes or users can perform this action': 'Chỉ vận động viên hoặc người dùng mới có thể thực hiện thao tác này',
    'Only trainers can perform this action': 'Chỉ huấn luyện viên mới có thể thực hiện thao tác này',
    'You must be a trainer or a verified athlete to perform this action': 'Bạn phải là huấn luyện viên hoặc vận động viên đã xác minh để thực hiện thao tác này',
    'Validation failed': 'Dữ liệu gửi lên không hợp lệ',
    'Logged out': 'Đăng xuất thành công',
};

export const normalizeApiMessage = (message: string): string => {
    const trimmed = message.trim();
    if (!trimmed) {
        return 'Lỗi hệ thống';
    }

    const exactMatch = LEGACY_MESSAGE_MAP[trimmed];
    if (exactMatch) {
        return exactMatch;
    }

    const routeMatch = trimmed.match(/^Route (.+) not found$/);
    if (routeMatch) {
        return `Không tìm thấy đường dẫn ${routeMatch[1]}`;
    }

    return trimmed;
};

export const getSingleParam = (value: string | string[] | undefined): string =>
    (Array.isArray(value) ? value[0] : value) ?? '';

export const getErrorMessage = (error: unknown, fallback = 'Lỗi hệ thống'): string => {
    if (error instanceof Error && error.message.trim()) {
        return normalizeApiMessage(error.message);
    }

    if (typeof error === 'string' && error.trim()) {
        return normalizeApiMessage(error);
    }

    return normalizeApiMessage(fallback);
};

export const requireRequestUserId = (req: Request): string => {
    const userId = req.user?.user_id;
    if (!userId) {
        throw new AppError('Bạn cần đăng nhập để tiếp tục', 401, 'UNAUTHORIZED');
    }

    return userId;
};

export const asAppError = (
    error: unknown,
    statusCode: number,
    fallbackMessage = 'Lỗi hệ thống',
    code = 'API_ERROR',
    details?: unknown,
): AppError => {
    if (error instanceof AppError) {
        return error;
    }

    return new AppError(getErrorMessage(error, fallbackMessage), statusCode, code, details);
};
