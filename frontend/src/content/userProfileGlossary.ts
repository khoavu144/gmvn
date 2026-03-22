/**
 * Bảng ngôn ngữ UI — không hiển thị thuật ngữ kỹ thuật cho end user.
 *
 * | Nội bộ (dev / admin) | Hiển thị cho user (tiếng Việt)        |
 * | -------------------- | -------------------------------------- |
 * | taxonomy / term      | Danh mục có sẵn / Lựa chọn / Nhãn      |
 * | custom field         | Câu hỏi thêm / Thông tin bổ sung       |
 * | profile section      | Nhóm mục (tiêu đề từng khối trên màn)   |
 * | catalog              | Danh sách gợi ý                        |
 */

/** Một dòng gợi ý dưới tiêu đề khi nhóm không bắt buộc */
export const PROFILE_HINT_OPTIONAL_GROUP =
    'Chọn các mục phù hợp — có thể bỏ qua, sau này đổi trong mục Hồ sơ bất cứ lúc nào.';

/** Khi nhóm có rule bắt buộc (truyền tên mục đích động) */
export function profileHintRequiredGroup(purpose: string): string {
    return `Cần chọn đủ mục bên dưới để ${purpose}.`;
}

export const ONBOARDING_GOALS_TITLE = 'Bạn đang hướng tới điều gì?';
export const ONBOARDING_GOALS_SUB =
    'Chọn một hoặc nhiều mục — giúp GYMERVIET gợi ý phù hợp hơn.';

export const ONBOARDING_COACH_SPECIALTIES_TITLE = 'Chuyên môn huấn luyện';
export const ONBOARDING_COACH_SPECIALTIES_SUB =
    'Chọn ít nhất một lĩnh vực bạn mạnh nhất (có thể chọn nhiều).';

export const PROFILE_INTERESTS_TAB_LABEL = 'Mục tiêu & chuyên môn';
export const PROFILE_INTERESTS_TAB_DESC =
    'Cập nhật lựa chọn từ danh sách có sẵn — không cần gõ tay.';

export const SKIP_FOR_NOW = 'Bỏ qua, làm sau';
