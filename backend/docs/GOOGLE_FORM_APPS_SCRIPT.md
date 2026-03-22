# Google Form → GYMERVIET API (Apps Script)

## Biến môi trường (backend)

- `GOOGLE_FORM_WEBHOOK_SECRET` — bắt buộc để bật endpoint ingest.
- `GOOGLE_FORM_AUTO_PUBLISH_PROFILE` — đặt `true` nếu muốn sau import tự bật `is_profile_public` cho trainer/athlete đã có `trainer_profiles`.

## Endpoint

`POST /api/v1/integrations/google-form/ingest`

- Header `X-Gymerviet-Signature`: `HMAC-SHA256(raw_json_body, secret)` dạng **hex** (không prefix).
- Header `X-Gymerviet-Timestamp`: epoch ms (tuỳ chọn; lệch tối đa 5 phút).
- Body JSON UTF-8 **giống hệt** chuỗi đã ký (không đổi khoảng trắng).

## Payload JSON

```json
{
  "responseId": "unique-from-google-or-uuid",
  "schemaVersion": "1",
  "flow": "profile",
  "email": "user@example.com",
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567",
  "consentAccepted": true,
  "checkedTermSlugs": ["fat_loss", "muscle_gain"],
  "freeText": { "note": "Ghi chú ngắn" }
}
```

- `flow`: `profile` (mặc định) áp dụng catalog theo **user_type trong DB**; `contact` chỉ lưu log, không cần tài khoản.
- `checkedTermSlugs`: slug khớp bảng `user_profile_terms.slug` và `applies_to` của section.
- Tài khoản phải **đã đăng ký** (email trùng `users.email`); nếu không có user → log `no_user`, HTTP 200.

## Apps Script (mẫu)

1. Form → biểu tượng ⋮ → **Script editor**.
2. Dán code, điền `API_BASE` và `SECRET`.
3. Triggers → **onFormSubmit** từ form.

```javascript
const API_BASE = 'https://your-api.com/api/v1'; // không có dấu /
const SECRET = 'same-as-GOOGLE_FORM_WEBHOOK_SECRET';

function onFormSubmit(e) {
  const itemResponses = e.response.getItemResponses();
  const flat = {};
  for (let i = 0; i < itemResponses.length; i++) {
    const title = itemResponses[i].getItem().getTitle().trim();
    const resp = itemResponses[i].getResponse();
    flat[title] = resp;
  }

  const termSlugs = [];
  // Ví dụ: mỗi câu hỏi checkbox có title = slug term nội bộ
  Object.keys(flat).forEach((k) => {
    if (flat[k] === true || flat[k] === 'Có' || flat[k] === 'Yes') termSlugs.push(k);
  });

  const payload = {
    responseId: e.response.getId(),
    schemaVersion: '1',
    flow: flat['flow'] || 'profile',
    email: flat['Email'] || '',
    fullName: flat['Họ và tên'] || '',
    phone: flat['Số điện thoại'] || '',
    consentAccepted: flat['Đồng ý điều khoản'] === true || flat['Đồng ý điều khoản'] === 'Có',
    checkedTermSlugs: termSlugs,
    freeText: { raw_titles: JSON.stringify(Object.keys(flat)) },
  };

  const body = JSON.stringify(payload);
  const sig = Utilities.computeHmacSha256Signature(body, SECRET);
  const hex = sig.map(function (b) {
    return ('0' + (b & 0xff).toString(16)).slice(-2);
  }).join('');

  UrlFetchApp.fetch(API_BASE + '/integrations/google-form/ingest', {
    method: 'post',
    contentType: 'application/json; charset=utf-8',
    payload: body,
    headers: {
      'X-Gymerviet-Signature': hex,
      'X-Gymerviet-Timestamp': String(Date.now()),
    },
    muteHttpExceptions: true,
  });
}
```

Điều chỉnh map `flat[...]` cho đúng **tiêu đề câu hỏi** trên form của bạn. Nên dùng tiêu đề = **slug** cho từng term checkbox để không cần bảng map.

## Admin

- `GET /api/v1/admin/form-imports?limit=50` — lịch sử import.
- `GET /api/v1/admin/catalog-export` — JSON section + term slug để thiết kế form.
