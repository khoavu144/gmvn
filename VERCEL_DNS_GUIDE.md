# Hướng dẫn Trỏ Tên Miền (DNS) về Vercel

Sau khi ứng dụng đã chạy thành công trên tên miền có sẵn của Vercel (ví dụ: `gymerviet-theta.vercel.app`), bước tiếp theo là gắn nó vào tên miền chính thức của cậu (ví dụ: `gymerviet.com`).

Vercel làm việc này cực kỳ tự động. Nó thậm chí sẽ tự lo cấu hình chứng chỉ bảo mật SSL (ổ khoá HTTPS màu xanh) cho cậu luôn.

---

### Bước 1: Thêm Tên miền vào Vercel
1. Đăng nhập Vercel, chọn dự án Frontend cậu vừa deploy.
2. Bấm vào tab **Settings** ở menu ngang trang dự án.
3. Nhìn sang cột menu bên trái, chọn **Domains**.
4. Ở ô trống ngay đầu trang, gõ tên miền của cậu vào (Ví dụ: `gymerviet.com`) rồi bấm nút **Add**.
5. Vercel sẽ hỏi cậu muốn thêm theo kiểu nào. Khuyên dùng mục **Add "gymerviet.com" and "www.gymerviet.com"**, để khách gõ kiểu gì cũng vào được web.  
**(Xong bước 5, Vercel sẽ hiện ra 1 cái bảng báo dòng chữ đỏ "Invalid Configuration". Đừng hoảng, đấy là do mình chưa trỏ IP từ nơi mua domain về đây).**

---

### Bước 2: Lấy thông số DNS từ Vercel
Vercel sẽ yêu cầu 2 bản ghi (Records) để chứng minh cậu là chủ tên miền. Cậu hãy giữ nguyên trang đó, nó có dạng như thế này:

**Cho tên miền chính (gymerviet.com)**
- **Type:** `A`
- **Name:** `@` (hoặc để trống, tuỳ nhà cung cấp)
- **Value:** `76.76.21.21` (Số này là IP chung của Vercel toàn cầu)

**Cho tên miền phụ (www.gymerviet.com)**
- **Type:** `CNAME`
- **Name:** `www`
- **Value:** `cname.vercel-dns.com`

---

### Bước 3: Đăng nhập vào nhà cung cấp Domain (Mắt Bão, GoDaddy, Hostinger, Tenten...)
Bước này phụ thuộc vào việc cậu mua tên miền `gymerviet.com` ở đâu. Nhìn chung giao diện hãng nào cũng na ná nhau.
1. Đăng nhập vào trang quản lý của nhà cung cấp đã bán tên miền cho cậu.
2. Tìm đến phần **Quản lý DNS** (DNS Management / DNS Settings).
3. Thêm/Sửa (Add/Edit) các bản ghi (Records) để nó khớp với yêu cầu của Vercel ở Bước 2.

Cụ thể cậu phải tạo đúng 2 dòng như sau:
* **Record 1:** Chọn Type `A` | Host/Name gõ `@` | Value trỏ về `76.76.21.21`
* **Record 2:** Chọn Type `CNAME` | Host/Name gõ `www` | Value gõ `cname.vercel-dns.com.`

> **Xoá rác (Rất quan trọng):** Nếu cậu thấy có bất kỳ dòng Type A hoặc Type CNAME nào cũ có sẵn tên là `@` hoặc `www` đang trỏ đi đâu đó mà không phải IP Vercel, hãy mạnh dạn XÓA bỏ chúng đi để tránh xung đột nhé!

4. Lưu lại cấu hình (Save Changes) ở trang nhà cung cấp.

---

### Bước 4: Chờ đợi phép màu
- Quay lại màn hình Domain của dự án trên Vercel. 
- Vercel sẽ quay quay kiểm tra liên tục. Thông thường nếu cấu hình đúng, sau khoảng **2 phút đến 15 phút**, dòng chữ đỏ "Invalid Configuration" sẽ biến thành hộp chữ xanh lá **Valid Configuration**. 
- Đồng thời nó cũng tự động nhúng luôn thẻ SSL cho trang web của cậu. 

Bây giờ cậu chỉ cần mở tab ẩn danh trên điện thoại, gõ `https://gymerviet.com` và tận hưởng thành quả của một tuần code miệt mài thôi! 🚀
