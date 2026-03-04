# Hướng dẫn Deploy Backend Node.js lên Render.com (Dành cho người mới)

Render là dịch vụ hosting rất dễ dùng, cho phép chúng ta gắn thẳng Github vào để lấy code và chạy tự động. Mỗi khi cậu gõ lệnh `git push` ở máy cá nhân, Render sẽ tự kéo code mới về và Build lại server mà cậu không cần làm gì thêm!

Dưới đây là từng bước chi tiết "cầm tay chỉ việc":

---

### Bước 1: Đăng nhập / Đăng ký Render
1. Truy cập [https://render.com/](https://render.com/).
2. Bấm vào nút **"Get Started"** hoặc **"Sign in"**.
3. Chọn Đăng nhập bằng **Github**. Điều này rất quan trọng để cấp quyền cho Render lấy code repository `gmvn` của cậu.

### Bước 2: Tạo Dịch vụ Web (Web Service) mới
1. Sau khi vào Dashboard (Bảng điều khiển), bấm nút **"New"** ở góc trên bên phải.
2. Chọn **"Web Service"** (Dịch vụ Web).
3. Nó sẽ hiện ra list các Repository trên Github của cậu. Hãy tìm và chọn repo **`khoavu144/gmvn`**. 
4. Nếu đây là lần kết nối đầu tiên, có thể Render sẽ hỏi quyền truy cập Github, cứ bấm "Install & Authorize" (Chấp nhận).

### Bước 3: Cấu hình Web Service
Khi đã chọn repo `gmvn`, bảng điền cấu hình sẽ hiện ra. Cậu điền CHÍNH XÁC như sau nhé:

- **Name:** Đặt tên tuỳ ý (Ví dụ: `gymerviet-backend`).
- **Region:** Chọn **Singapore** (Rất quan trọng, để ping về Việt Nam nhanh nhất).
- **Branch:** `main` (Nhánh mặc định của Git).
- **Root Directory:** Gõ vào chữ `backend` (Vì thư mục code Node của mình nằm trong folder `backend` chứ không phải ở rễ repo).
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build` (Nó sẽ tải các cục dependencies về và biên dịch Typescript ra Javascript).
- **Start Command:** `npm start` (Lệnh kích hoạt server, xem package.json).
- **Instance Type:** Chọn gói `Free` (nếu có) hoặc `Hobby` ($5/tháng, rất mượt và không bị tự tắt khi không ai dùng). 

### Bước 4: Thêm Biến Môi Trường (Environment Variables)
Kéo xuống phía dưới cậu sẽ thấy mục **Advanced** > **Environment Variables**. Cậu cần Add các biến sau. Nửa bên trái là Tên biến (Key), nửa bên phải là Giá trị (Value).

| Tên biến (Key) | Giá trị (Value) | Lưu ý |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Bắt buộc để báo cho Nodejs biết đây là server thật |
| `JWT_SECRET` | *(Một chuỗi chữ và số dài tùy cậu tự bịa)* | VD: `Hkj21hjKhj124HJ1asx83hH812` |
| `JWT_REFRESH_SECRET`| *(Một chuỗi tuỳ chọn nhưng phải khác cái trên)* | VD: `938bB1asdk1U23nB12b32n31` |
| `FRONTEND_URL` | `https://gymerviet.com` | Hoặc URL do Vercel cấp. Đảm bảo CORS kết nối được |
| `DATABASE_URL` | *(Link kết nối Database lấy từ Supabase)* | Chút nữa lấy ở Supabase nhét vào đây |
| `PORT` | `3001` | Mặc định port backend của dự án |

*(Ghi chú: Đừng thêm dấu ngoặc kép `" "` bao quanh Giá trị Value nhé)*

### Bước 5: Hoàn tất và Deploy
1. Kiểm tra lại mọi thứ lần cuối.
2. Bấm nút **"Create Web Service"** màu xanh bự chảng ở dưới cùng.
3. Ngồi đợi! Render sẽ hiện cái khung đen sì toàn chữ (Console Log) giống như lúc cậu chạy terminal ở máy tính. 
4. Tuỳ vào lúc kéo thư viện, sẽ mất khoảng **2 đến 5 phút** để Render build xong.
5. Khi nào Console báo chữ "Build successful" và URL có tick xanh "Live" tức là **Thành công**!

> **Làm thế nào để biết Server chạy OK?**
> Render sẽ cung cấp cho cậu một cái đường link (ví dụ: `https://gymerviet-backend.onrender.com`). Cậu click vào đó và gõ thêm `/api/v1/health`. 
> Nếu trình duyệt hiện chữ `{"status":"OK","timestamp":"..."}` là chúc mừng cậu, Backend đã nằm gọn trên Cloud! 🚀

---
*Khi cậu hoàn tất cài đặt Render, lấy được cái Base Link kia đưa dán vào `VITE_API_URL` của bước thiết lập **Vercel** là hai đứa nhào vô tìm thấy nhau ngay! Hãy thử làm và báo cho tớ nếu gặp lỗi nhé.*
