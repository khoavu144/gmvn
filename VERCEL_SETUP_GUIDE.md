# Hướng dẫn Deploy Frontend Vite React lên Vercel (Dành cho người mới)

Vercel là một trong những nền tảng host web Frontend mạnh mẽ và dễ dùng nhất hành tinh. Nó sinh ra để chạy các ứng dụng React/Vite mượt mà như bôi mỡ và hoàn toàn MIỄN PHÍ. Điểm hay là Vercel cũng đồng bộ thẳng với kho chứa Github của cậu, đẩy code lên là tự nó nhận và phát hành (Auto-Deploy).

Ngay khi Backend (bên Render) và CSDL (Supabase) đã thông nhau và ra được cái link backend, cậu làm tiếp tới thằng Vercel này nhé:

---

### Bước 1: Login & Kết nối Vercel với Github
1. Truy cập [https://vercel.com/](https://vercel.com/).
2. Nếu chưa có nick, cậu ấn **Sign up** hoặc **Log In** rồi chọn đăng nhập qua cổng **"Continue with GitHub"**.

### Bước 2: Import Dự án (Import Project)
1. Trong màn hình Dashboard chình ình giữa màn hình, nhấp nút **"Add New..."** màu đen ở góc phải trên cùng và chọn **"Project"**.
2. Phần Import Git Repository, cậu sẽ thấy danh sách Repo Github của mình hiện ra. 
3. Tìm repo tên là `khoavu144/gmvn` và bấm dòng nút **Import**.

### Bước 3: Cấu hình Dự án (Configure Project)
Đây là màn hình quan trọng nhất. Ở phần *Configure Project*, hãy điền giống hệt tớ báo nhé:
- **Project Name:** Mặc định của nó là `gmvn`, cậu có thể đổi sang `gymerviet` cho đẹp.
- **Framework Preset:** Vercel thường rất thông minh, nó tự quét code và điền luôn là `Vite` rồi. Nếu nó không đúng thì cậu tự click mở ra chọn Vite.
- **Root Directory:** Nhấp vào nút `Edit` -> chọn cái thư mục mang tên `frontend` và ấn nút **Save**. (Cực kì quan trọng vì Front end của mình code tất cả bên trong nhánh thư mục nhỏ này).

Tiếp theo mở gập phần **Environment Variables** ra để điền biến:
1. Ô **Key** cậu điền: `VITE_API_URL`
2. Ô **Value** cậu dán URL Backend của Render vào. Ví dụ của cậu là `https://gymerviet-backend.onrender.com/api/v1` (Lưu ý: Không có dấu xuyệt `/` ở cuối url nhé!).
3. Ấn nút `Add`.

> *Tạm thời cậu mới chỉ cần mỗi cái biến Server URL kia để gọi Data hiển thị UI lên thôi. Mấy biến về API Key Stripe nọ kia mình bỏ qua vì Sepay đã tích hợp thẳng.*

### Bước 4: Khởi Tạy Bấm Nút Deploy
Cậu bấm thẳng nút **Deploy** màu xanh lè bự chảng ở hàng cuối cùng.

Cứ ngồi đợi thả lỏng chừng **1 phút**. Vercel sẽ chạy chuỗi hạt building từ code nháp -> thành các cục File mã JS nén (minified). Cậu sẽ thấy nó check các icon xanh mướt lần lượt chạy xuống.
Cứ tới khi màn hình bùm nổ bong bóng Confetti 🎊🎊 tung tóe là nó dựng trang Web của cậu lên Internet xong xuôi mỹ mãn!

### Bước 5: Xem bản Web thực tế
1. Cậu nhấp lên cái màn hình Preview nhỏ hoặc ấn **Continue to Dashboard**!
2. Ở dashboard, Vercel cung cấp cho cậu một "Domain miễn phí" loằng ngoằng (ví dụ: `gmvn-rho.vercel.app`), cậu thử ấn vô. Cậu sẽ thấy Giao diện ứng dụng GYMERVIET thân quen đã hiển thị trên mạng cho toàn bộ thiên hạ thấy rồi đó!

---
*(Sau này nếu cậu mua Domain riêng là gymerviet.com. Cậu chỉ cần vô Vercel Setting -> Domains. Click Add Domain gõ chữ gymerviet.com vào thì tự Vercel nó chèn Config Name Server về máy gốc và phát SSL xanh cho cậu ngầu như Theanh28 luôn!)*
